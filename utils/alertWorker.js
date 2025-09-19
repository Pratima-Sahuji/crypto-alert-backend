import cron from "node-cron";
import Alert from "../models/alertModel.js";
import { getLivePrices } from "./getLivePrice.js"; // adjust path if needed
import { getCoinMap } from "./coinMapService.js";

export const startAlertScheduler = (io) => {
  cron.schedule("*/30 * * * * *", async () => {
    try {
      console.log("⏳ Running alert scheduler...");

      // Get all active alerts
      const alerts = await Alert.find();
      if (!alerts.length) return console.log("No alerts to process.");

      const coinMap = await getCoinMap();

      // Group alerts by currency
      const grouped = {};
      alerts.forEach((a) => {
        if (!grouped[a.preferredCurrency]) grouped[a.preferredCurrency] = [];
        grouped[a.preferredCurrency].push(a);
      });

      for (const [currency, alertsInCurrency] of Object.entries(grouped)) {
        // Use alert.coinId as symbol and map to CoinGecko ID
        const symbols = alertsInCurrency.map(a => a.coinId.toUpperCase());
        const prices = await getLivePrices(symbols, currency);

        for (const alert of alertsInCurrency) {
          const symbol = alert.coinId.toUpperCase();
          const currentPrice = prices[symbol];
          if (!currentPrice) continue;

          // Check if alert should trigger
          let triggered = false;
          if (alert.condition === "above" && currentPrice > alert.targetPrice) triggered = true;
          else if (alert.condition === "below" && currentPrice < alert.targetPrice) triggered = true;

          if (triggered && !alert.triggered) {
            console.log(`🚨 Alert for ${symbol} at ${alert.targetPrice}: and current ${currentPrice} ${currency} for ${alert.user}`);
            io.to(alert.user.toString()).emit("alertTriggered", {
              coin: symbol,
              price: currentPrice,
              target: alert.targetPrice,
              condition: alert.condition,
              currency,
            });
            alert.triggered = true;
            await alert.save();
          }
          //  else {
          //   console.log(`No alert for ${symbol}: ${currentPrice} ${currency}`);
          // }
        }
      }
    } catch (err) {
      console.error("❌ Error in alert scheduler:", err.message);
    }
  });

  console.log("✅ Alert scheduler running every 30s...");
};
