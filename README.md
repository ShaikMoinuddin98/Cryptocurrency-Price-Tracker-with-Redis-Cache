# Crypto Price Alert System

This web application monitors cryptocurrency prices and sends alerts when a specified price condition is met. It uses Node.js, Express, MongoDB, Redis, Cron Jobs and Axios to manage real-time cryptocurrency prices and user alerts.

## Features

- Set price alerts for specific cryptocurrencies.
- Receive notifications when the cryptocurrency price crosses the specified threshold.
- Real-time updates of cryptocurrency prices using Cron Jobs.
- Uses Redis for caching prices and MongoDB for storing user alert data.

## Tech Stack

- Node.js
- MongoDB
- Redis
- CoinGecko API
- Cron Jobs

## Usage

1. **Set an alert:**
   - Enter your email address.
   - Enter the cryptocurrency symbol (e.g., `btc` for Bitcoin).
   - Enter the target price.
   - Select the direction (`above` or `below`).
   - Click "Set Alert".

2. **View current prices:**
   - Current prices of the top 20 cryptocurrencies are displayed in real-time on the webpage.

3. **Receive alerts:**
   - You will receive an alert when the cryptocurrency price crosses the specified threshold.

## API Endpoints

- **POST /alerts**: Create a new alert.
- **GET /prices**: Get the current cryptocurrency prices.
- **GET /alertSentstat**: Get the status of sent alerts.

## Cron Jobs

The application uses cron jobs to ensure real-time updates and alert notifications:

- **Fetching Cryptocurrency Prices:**
  - Fetches the latest cryptocurrency prices from the CoinGecko API every second and caches them in Redis.

- **Checking Alerts:**
  - Checks user alerts every second to see if the current price meets the alert condition (above or below the target price).

---

Happy coding! 🚀
