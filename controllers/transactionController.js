import Transaction from "../models/transactionModel.js"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import bcryptjs from "bcryptjs";

//add Transaction
export async function addTransaction(req, res) {
  try {
    const userId = req.userId; // From auth middleware

    const { coinSymbol, coinName, transactionType, quantity, price } = req.body;

    if (!coinSymbol || !coinName || !transactionType || !quantity || !price) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "All fields are required",
      });
    }

    const data = new Transaction({
      user: userId, // ✅ Link to logged-in user
      coinSymbol,
      coinName,
      transactionType,
      quantity,
      price,
    });

    await data.save();

    return res.status(201).json({
      success: true,
      error: false,
      message: "Transaction added successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
}

//get all Transactions
export async function getTransactions(req, res) {
  try {
    const userId = req.userId; // from auth middleware
        console.log('UserID from auth:', userId); // Debug log

    const data = await Transaction.find({ user: userId }).sort({ createdAt: -1 }); // newest first
      console.log('Found transactions:', data); // Debug log

    return res.status(200).json({
      success: true,
      error: false,
      count: data.length,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
}

//get by id
export async function getTransactionById(req, res) {
  try {
    const userId = req.userId; // from auth middleware
    const { id } = req.params; // transaction ID from URL

    // Find transaction by ID and make sure it belongs to the logged-in user
    const transaction = await Transaction.findOne({ _id: id, user: userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Transaction not found or you are not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      data: transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
}

// Update Transaction
export async function updateTransaction(req, res) {
  try {
    const userId = req.userId; // from auth middleware
    const { id } = req.params; // transaction ID
    const { coinSymbol, coinName, transactionType, quantity, price } = req.body;

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, user: userId }, // make sure it belongs to logged-in user
      { coinSymbol, coinName, transactionType, quantity, price },
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Transaction not found or you are not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
}

// Delete Transaction
export async function deleteTransaction(req, res) {
  try {
    const userId = req.userId; // from auth middleware
    const { id } = req.params; // transaction ID

    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: id,
      user: userId, // security check
    });

    if (!deletedTransaction) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Transaction not found or you are not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
}

