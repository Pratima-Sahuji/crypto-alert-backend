import Alert from "../models/alertModel.js";

// Create Alert
export const createAlert = async (req, res) => {
  try {
    const { coinId, targetPrice, condition, preferredCurrency, frequency } = req.body;

    if (!coinId || !targetPrice || !condition) {
      return res.status(400).json({ message: "coinId, targetPrice and condition are required" });
    }

    const alert = new Alert({
      user: req.userId, // from auth middleware
      coinId,
      targetPrice,
      condition,
      preferredCurrency: preferredCurrency || "usd",
      frequency: frequency || 1, // default = 1 min
    });

    await alert.save();
    res.status(201).json({ message: "Alert created successfully", alert });
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Alerts for User
export const getUserAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.userId });
    res.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Alert
export const deleteAlert = async (req, res) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting alert:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//get Alert by ID
export async function getAlert(req, res) {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, user: req.userId });
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Update alert
export async function updateAlert (req, res)  {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
