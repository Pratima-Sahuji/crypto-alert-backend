import axios from "axios";
import { getCoinMap } from "./coinMapService.js";

let priceCache = {};  // stores { key: { data, timestamp } }
const CACHE_DURATION = 60 * 1000; // 1 minute

export async function getLivePrices(symbols, currency = "usd") {
  const coinMap = await getCoinMap();
  const now = Date.now();

  // Create a unique cache key (e.g., "BTC,ETH_usd")
  const cacheKey = symbols.sort().join(",") + "_" + currency;

  // 1. If cache exists and still valid → return it
  if (
    priceCache[cacheKey] &&
    now - priceCache[cacheKey].timestamp < CACHE_DURATION
  ) {
    console.log("Returning cached prices for", cacheKey);
    return priceCache[cacheKey].data;
  }

  // 2. Map symbols (BTC → bitcoin, ETH → ethereum)
  const coinIds = symbols
  .filter(s => s) // remove empty strings
    .map((s) => coinMap[s.toUpperCase()])
    .filter(Boolean); // remove undefined

  if (coinIds.length === 0) return {};

  // 3. Fetch prices from CoinGecko in one request
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(
    ","
  )}&vs_currencies=${currency}`;
  const response = await axios.get(url);

  const data = response.data;

  // 4. Convert back → { BTC: 12345, ETH: 2000 }
  const prices = {};
  for (let symbol of symbols) {
    const id = coinMap[symbol.toUpperCase()];
    if (data[id] && data[id][currency]) {
      prices[symbol] = data[id][currency];
    }
  }

  // 5. Save in cache
  priceCache[cacheKey] = {
    data: prices,
    timestamp: now,
  };

  console.log("Fetched fresh prices for", cacheKey);

  return prices;
}

// const prices = await getLivePrices(["BTC", "ETH"], "usd");
// console.log(prices);
