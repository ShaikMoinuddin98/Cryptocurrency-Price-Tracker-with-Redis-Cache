const express = require('express')
const mongoose = require('mongoose')
const { createClient } = require('redis')
const axios = require('axios')
const cron = require('node-cron')
const cors=require("cors")

// Initialize Express app
const app = express()
app.use(cors())
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())

// MongoDB connection
mongoose.connect('mongodb+srv://King-Moin:Moin-7093@cluster0.3uvscb7.mongodb.net/')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))

// Redis client setup
const redisClient = createClient({
    url: 'redis://127.0.0.1:6379'
  })
redisClient.on('error', (err) => console.log('Redis Client Error', err))

redisClient.connect().then(() => {
  console.log('Redis client connected')

  // User schema definition
  const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    alertCriteria: {
      symbol: { type: String, required: true },
      targetPrice: { type: Number, required: true },
      direction: { type: String, enum: ['above', 'below'], required: true }
    },
    alertSent:{
        type:Boolean
    }
  })

  const User = mongoose.model('User', userSchema)

  // Fetch and cache cryptocurrency prices
  const fetchCryptoPrices = async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'inr',
          order: 'market_cap_desc',
          per_page: 20,
          page: 1
        },
        headers: {accept: 'application/json', 'x-cg-demo-api-key': 'CG-Dyy1rhWZuTgoDXgXUNvJ6wB3'}
      })

      const prices = response.data.reduce((acc, coin) => {
        acc[coin.symbol] = coin.current_price
        return acc
      }, {})

      // Cache the prices in Redis
      await redisClient.set('cryptoPrices', JSON.stringify(prices))
    } catch (error) {
      console.error('Error fetching crypto prices:', error)
    }
  }

  // Schedule the price fetching every second
  cron.schedule('*/1 * * * * *', fetchCryptoPrices)

  // Fetch prices immediately on startup
  fetchCryptoPrices()

  // Routes
  app.post('/alerts', async (req, res) => {
    const { email, symbol, targetPrice, direction } = req.body

    const user = new User({
      email:email,
      alertCriteria: {
        symbol:symbol,
        targetPrice:targetPrice,
        direction:direction
      },

      alertSent:false
    })

    await user.save()
    res.status(201).send('Alert created')
  })

  app.get('/prices', async (req, res) => {
    try {
      const prices = await redisClient.get('cryptoPrices')
      res.send(JSON.parse(prices))
    } catch (err) {
      res.status(500).send('Error fetching prices')
    }
  })

  app.get('/alertSentstat',async(req,res)=>{
    const u=await User.find()
    let l=[]
    console.log(u)
    for(i of u)
    {
        console.log(i)
        if(i.alertSent)
            {
                l.push(i.alertCriteria)
                await User.deleteOne({email:i.email})
            }
        
    }
    console.log(l)
    res.json({data:l})
  })

  // Check alerts every second
  cron.schedule('*/1 * * * * *', async () => {
    const users = await User.find()
    try {
        console.log("checking")
      const prices = await redisClient.get('cryptoPrices')
      const cryptoPrices = JSON.parse(prices)

      users.forEach(async(user)=> {
        const { email, alertCriteria } = user
        const { symbol, targetPrice, direction } = alertCriteria
        const currentPrice = cryptoPrices[symbol]
        console.log(user.alertSent)
        if (((direction === 'above' && currentPrice > targetPrice) || 
            (direction === 'below' && currentPrice < targetPrice)) && (user.alertSent==false)) {
          console.log(`Sending alert to ${email}: ${symbol} is ${direction} ${targetPrice}`)
        
          await User.updateOne({email:user.email},{alertSent:true})

        }
      })
    } catch (err) {
      console.error('Error fetching prices from Redis:', err)
    }
  })

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

}).catch(err => console.error('Error connecting to Redis:', err))


