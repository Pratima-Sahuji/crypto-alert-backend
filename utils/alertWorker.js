// import cron from "node-cron";
// import axios from "axios";
// import Alert from "../models/Alert.js";
// import User from "../models/User.js";

// // Run every 1 minute
// cron.schedule("* * * * *", async () => {
//   try {
//     console.log("🔍 Running alert worker...");

//     // 1. Fetch all active alerts and include user
//     const alerts = await Alert.find({ active: true }).populate("userId");
//     if (!alerts.length) {
//       console.log("✅ No active alerts");
//       return;
//     }

//     // 2. Group alerts by coin+currency
//     const alertsByCoinCurrency = {};
//     for (let alert of alerts) {
//       const currency = alert.userId?.preferredCurrency?.toLowerCase() || "usd";
//       const key = `${alert.coinId}_${currency}`;

//       if (!alertsByCoinCurrency[key]) alertsByCoinCurrency[key] = [];
//       alertsByCoinCurrency[key].push({ alert, currency });
//     }

//     // 3. Extract unique coins and currencies
//     const coinIds = [
//       ...new Set(Object.keys(alertsByCoinCurrency).map(k => k.split("_")[0]))
//     ];
//     const currencies = [
//       ...new Set(Object.values(alertsByCoinCurrency).map(a => a[0].currency))
//     ];

//     // 4. Fetch live prices from CoinGecko
//     const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(",")}&vs_currencies=${currencies.join(",")}`;
//     const { data } = await axios.get(url);

//     // 5. Check each alert condition
//     for (let key in alertsByCoinCurrency) {
//       const [coinId, currency] = key.split("_");
//       const price = data[coinId]?.[currency];

//       if (!price) {
//         console.log(`⚠️ Price not found for ${coinId} in ${currency}`);
//         continue;
//       }

//       for (let { alert } of alertsByCoinCurrency[key]) {
//         let triggered = false;

//         if (alert.condition === "above" && price >= alert.targetPrice)
//           triggered = true;
//         if (alert.condition === "below" && price <= alert.targetPrice)
//           triggered = true;

//         if (triggered) {
//           alert.triggered = true;
//           alert.active = false;
//           await alert.save();

//           // For now: log to console (later: send email/push)
//           console.log(
//             `🚨 Alert triggered for ${coinId} in ${currency}: Live ${price}, Target ${alert.targetPrice}`
//           );
//         }
//       }
//     }
//   } catch (err) {
//     console.error("❌ Error in alert worker:", err.message);
//   }
// });


// import Alert from "../models/alertModel.js";
// import axios from "axios";

// // Track last checked time for each alert
// const lastChecked = new Map();

// export const checkAlerts = async () => {
//   try {
//     const alerts = await Alert.find();

//     if (!alerts.length) return;

//     for (let alert of alerts) {
//       const now = Date.now();

//       // Default frequency = 15 mins if user hasn’t set
//       const frequency = alert.frequency || 15;

//       // Get last checked time
//       const lastRun = lastChecked.get(alert._id) || 0;
//       const diffMinutes = (now - lastRun) / 60000;

//       // Skip if not yet time
//       if (diffMinutes < frequency) continue;

//       // Fetch live price from CoinGecko
//       const url = `https://api.coingecko.com/api/v3/simple/price?ids=${alert.coinId}&vs_currencies=${alert.preferredCurrency}`;
//       const { data } = await axios.get(url);

//       if (!data[alert.coinId]) {
//                 console.warn(`Coin data not found for ${alert.coinId}`);
//         continue;
//       }

//       const currentPrice = data[alert.coinId][alert.preferredCurrency];

//       // Check if alert condition is met
//       let alertTriggered = false;
//       if (alert.condition === "above" && currentPrice > alert.targetPrice) {
//         alertTriggered = true;
//       } else if (alert.condition === "below" && currentPrice < alert.targetPrice) {
//         alertTriggered = true;
//       }

//       if (alertTriggered) {
//         // You can customize this: email, push notification, etc.
//         console.log(
//           `Alert triggered for ${alert.coinId}: Current price ${currentPrice} ${alert.preferredCurrency} is ${alert.condition} ${alert.targetPrice}`
//         );

//         // Optional: mark alert as sent in DB if one-time alert
//         // await Alert.findByIdAndUpdate(alert._id, { lastTriggered: now });
//       }

//       // Update last checked time
//       lastChecked.set(alert._id, now);
//     }
//   } catch (error) {
//     console.error("Error checking alerts:", error.message);
//   }
// };

import Alert from "../models/alertModel.js";
import axios from "axios";

// Track last checked time for each alert
const lastChecked = new Map();

export const scheduleAlertCheck = async (alert) => {
  try {
    const now = Date.now();
    const lastRun = lastChecked.get(alert._id) || 0;
    const frequency = alert.frequency || 15; // in minutes
    const diffMinutes = (now - lastRun) / 60000;

    // Only check if enough time has passed
    if (diffMinutes >= frequency) {
      // Fetch live price from CoinGecko
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${alert.coinId}&vs_currencies=${alert.preferredCurrency}`;
      const { data } = await axios.get(url);

      if (!data[alert.coinId]) {
        console.warn(`Coin data not found for ${alert.coinId}`);
      } else {
        const currentPrice = data[alert.coinId][alert.preferredCurrency];
        let alertTriggered = false;

        if (alert.condition === "above" && currentPrice > alert.targetPrice) {
          alertTriggered = true;
        } else if (alert.condition === "below" && currentPrice < alert.targetPrice) {
          alertTriggered = true;
        }

        if (alertTriggered) {
          console.log(
            `Alert triggered for ${alert.coinId}: Current price ${currentPrice} ${alert.preferredCurrency} is ${alert.condition} ${alert.targetPrice}`
          );
        }

        lastChecked.set(alert._id, now);
      }
    }
  } catch (error) {
    console.error("Error checking alert:", error.message);
  } finally {
    // Schedule the next check according to the alert's frequency
    const nextFrequency = (alert.frequency || 15) * 60 * 1000; // convert min to ms
    setTimeout(() => scheduleAlertCheck(alert), nextFrequency);
  }
};

// Start checking all alerts
 const startAlerts = async () => {
  const alerts = await Alert.find();
  alerts.forEach((alert) => scheduleAlertCheck(alert));
};

export default startAlerts;
