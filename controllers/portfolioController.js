// routes/portfolio.js
// const express = require("express");
// const portfolioRouter = express.Router();
import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";
import calculatePortfolio from "../utils/portfolioCalculator.js";
import { getLivePrices } from "../utils/getLivePrice.js"; // Adjust path as needed


export async function getPortfolio (req, res){
  try {
    const userId = req.userId; 
    const user = await User.findById(userId);

    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 }).lean(); // newest first

    // console.log('Found transactions:', transactions);

  
    const portfolio = {};
    // const livePrices = { BTC: 200, ETH: 1500 }; 
    for (let tx of transactions) {
      if (!portfolio[tx.coinSymbol]) portfolio[tx.coinSymbol] = [];
      portfolio[tx.coinSymbol].push(tx);
    }

     const symbols = Object.keys(portfolio);

    const livePrices = await getLivePrices(symbols, user.preferredCurrency);
    // console.log("Live Prices:", livePrices);

    const result = {};
    for (let symbol of symbols) {
      const livePrice = livePrices[symbol] || 0; // Default to 0 if price not found
      console.log(`Calculating for ${symbol} with live price:`, livePrice); 
      result[symbol] = calculatePortfolio(portfolio[symbol], livePrice);
    }

    return res.json(result);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


