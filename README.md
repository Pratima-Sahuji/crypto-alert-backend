# Crypto Alert Backend

A **real-time cryptocurrency alert system** built with **Node.js, Express, MongoDB, and WebSockets**.  
It allows users to set price alerts for cryptocurrencies in their preferred currency and receive **instant notifications** when conditions are met.

---

## Features

- **User Authentication**  
  Secure JWT-based login & registration.

- **Real-Time Price Updates**  
  Live crypto prices via CoinGecko API, updated every **30s**.

- **Price Alerts**  
  Create alerts like *“BTC above $70,000”* or *“ETH below ₹3,00,000”*.

- **WebSocket Notifications**  
  Users get instant alerts in real time (no refresh needed).

- **Multi-Currency Support**  
  Alerts can be set in any CoinGecko-supported currency (USD, INR, EUR, etc.).

- **Centralized Cron Job**  
  Efficient scheduler fetches all prices once every 30s, caches them, and checks against all alerts.

- **Persistent Alert History**  
  All alerts are stored in MongoDB, whether triggered or not.

- **Scalable Architecture**  
  Can be extended with Redis for distributed caching and background jobs.

---

## Tech Stack

- **Backend**: Node.js, Express  
- **Database**: MongoDB (Mongoose)  
- **Real-Time**: WebSocket (Socket.IO)  
- **Scheduler**: node-cron  
- **Crypto Prices**: CoinGecko API  
- **Auth**: JWT Tokens  

---

##Setup Instructions

1. **Clone the repo**
   ```bash
   git clone https://github.com/Pratima-Sahuji/crypto-alert-backend.git
   cd crypto-alert-backend
