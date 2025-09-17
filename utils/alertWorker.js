import cron from "node-cron";
import Alert from "../models/alertModel.js";
import { getLivePrices  } from "./getLivePrice.js"; // adjust path if needed

// STEP 1: Central scheduler
export const startAlertScheduler = (io) => {
  // Runs every 30 seconds
  cron.schedule("*/30 * * * * *", async () => {
    try {
      console.log("⏳ Running alert scheduler...");

      // Get all alerts
      const alerts = await Alert.find();
      if (!alerts.length) return;

      // Group alerts by currency
      const grouped = {};
      alerts.forEach((a) => {
        if (!grouped[a.preferredCurrency]) {
          grouped[a.preferredCurrency] = [];
        }
        grouped[a.preferredCurrency].push(a);
      });

      // For each currency group → fetch prices (cached or fresh)
      for (const [currency, alertsInCurrency] of Object.entries(grouped)) {
        const symbols = [...new Set(alertsInCurrency.map((a) => a.symbol))];

        // ✅ Use cached live prices here
        const prices = await getLivePrices(symbols, currency);

        // Check alerts for this currency
        for (const alert of alertsInCurrency) {
          const currentPrice = prices[alert.symbol];
          if (!currentPrice) continue;

          let triggered = false;
          if (alert.condition === "above" && currentPrice > alert.targetPrice) {
            triggered = true;
          } else if (alert.condition === "below" && currentPrice < alert.targetPrice) {
            triggered = true;
          }

          if (triggered) {
            console.log(`🚨 Alert for ${alert.symbol}: ${currentPrice} ${currency}`);

            // Emit WebSocket event
            io.to(alert.userId.toString()).emit("alertTriggered", {
              coin: alert.symbol,
              price: currentPrice,
              target: alert.targetPrice,
              condition: alert.condition,
              currency,
            });
          }
        }
      }
    } catch (err) {
      console.error("❌ Error in alert scheduler:", err.message);
    }
  });

  console.log("✅ Alert scheduler running every 30s...");
};







// import Alert from "../models/alertModel.js";
// import axios from "axios";

// // Track last checked time for each alert
// const lastChecked = new Map();

// export const scheduleAlertCheck = async (alert) => {
//   try {
//     const now = Date.now();
//     const lastRun = lastChecked.get(alert._id) || 0;
//     const frequency = alert.frequency || 15; // in minutes
//     const diffMinutes = (now - lastRun) / 60000;

//     // Only check if enough time has passed
//     if (diffMinutes >= frequency) {
//       // Fetch live price from CoinGecko
//       const url = `https://api.coingecko.com/api/v3/simple/price?ids=${alert.coinId}&vs_currencies=${alert.preferredCurrency}`;
//       const { data } = await axios.get(url);

//       if (!data[alert.coinId]) {
//         console.warn(`Coin data not found for ${alert.coinId}`);
//       } else {
//         const currentPrice = data[alert.coinId][alert.preferredCurrency];
//         let alertTriggered = false;

//         if (alert.condition === "above" && currentPrice > alert.targetPrice) {
//           alertTriggered = true;
//         } else if (alert.condition === "below" && currentPrice < alert.targetPrice) {
//           alertTriggered = true;
//         }

//         if (alertTriggered) {
//           console.log(
//             `Alert triggered for ${alert.coinId}: Current price ${currentPrice} ${alert.preferredCurrency} is ${alert.condition} ${alert.targetPrice}`
//           );
//         }

//         lastChecked.set(alert._id, now);
//       }
//     }
//   } catch (error) {
//     console.error("Error checking alert:", error.message);
//   } finally {
//     // Schedule the next check according to the alert's frequency
//     const nextFrequency = (alert.frequency || 15) * 60 * 1000; // convert min to ms
//     setTimeout(() => scheduleAlertCheck(alert), nextFrequency);
//   }
// };

// // Start checking all alerts
//  const startAlerts = async () => {
//   const alerts = await Alert.find();
//   alerts.forEach((alert) => scheduleAlertCheck(alert));
// };

// export default startAlerts;
