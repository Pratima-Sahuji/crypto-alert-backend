import axios from "axios";

let coinMap = {}; // Symbol -> ID
let lastFetchTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getCoinMap() {
  const now = Date.now();

  // If cache is empty or expired → fetch again
  if (!lastFetchTime || now - lastFetchTime > CACHE_DURATION) {
    console.log("Fetching coin list from CoinGecko...");
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/list");
    
    const data = response.data; // array of coins
    coinMap = {};

    data.forEach((coin) => {
      // store mapping like { BTC: "bitcoin", ETH: "ethereum" }
      coinMap[coin.symbol.toUpperCase()] = coin.id;
    });

    lastFetchTime = now;
    console.log("Coin map updated, total symbols:", Object.keys(coinMap).length);
  }

  return coinMap;
}
