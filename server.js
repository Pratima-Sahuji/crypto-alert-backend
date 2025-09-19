import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import transactionRouter from "./routes/transactionRoutes.js";
import portfolioRouter from "./routes/portfolioRoutes.js";
import alertRouter from "./routes/alertsRoutes.js";
import { Server } from "socket.io";
import http from "http";
import { startAlertScheduler } from "./utils/alertWorker.js"; 
import { getCoinMap } from "./utils/coinMapService.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 8080;

// Middlewares
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);
app.use(cookieParser());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("hii");
});
app.use("/api/user", userRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/alerts", alertRouter);

// Start server after DB connection
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    // const map =  getCoinMap();
    // console.log(map["BTC"]); // should print "bitcoin"
    // console.log(map); // should print "ethereum"


    // Start alert scheduler with WebSocket
    startAlertScheduler(io);
  });
});
