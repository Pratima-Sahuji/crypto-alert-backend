

import axios from "axios";

let coinMap = {}; 
let lastFetchTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getCoinMap() {
  const now = Date.now();

  if (!lastFetchTime || now - lastFetchTime > CACHE_DURATION) {
    console.log("Fetching top coins from CoinGecko...");

    // Fetch top 250 coins by market cap
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 250,
          page: 1,
        },
      }
    );

    const data = response.data; // array of coin objects
    coinMap = {};

    data.forEach((coin) => {
      // store mapping like { BTC: "bitcoin", ETH: "ethereum" }
      coinMap[coin.symbol.toUpperCase()] = coin.id;
    });

    lastFetchTime = now;
    // console.log("Coin map updated, total symbols:", Object.keys(coinMap).length);
    // console.log("BTC maps to:", coinMap["BTC"]);
    // console.log("ETH maps to:", coinMap["ETH"]);
    // console.log("DOGE maps to:", coinMap["DOGE"]);
  }

  return coinMap;
}
