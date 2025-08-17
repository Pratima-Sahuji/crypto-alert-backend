import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import transactionRouter from "./routes/transactionRoutes.js";
import portfolioRouter from "./routes/portfolioRoutes.js"; 
import alertRouter from "./routes/alertsRoutes.js";
import "./utils/alertWorker.js";
// import { checkAlerts } from "./utils/alertWorker.js";
import startAlerts from "./utils/alertWorker.js";   

dotenv.config();
connectDB().then(() =>{
    app.listen(PORT, ()=>{
        startAlerts(); // Start the alert worker
        // checkAlerts(); // Initial check for alerts
    console.log(`server is running on port ${PORT} `)
    })
})

const app = express();
app.use (cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
}));
app.use(cookieParser()); 
app.use(express.json());

const PORT = 8080 || process.env.PORT;

// app.listen(PORT, ()=>{
//     console.log(`server is running on port ${PORT} `)
// })

app.get("/", (req, res)=>{
    // console.log("hii");
    res.send("hii")
})

app.use("/api/user", userRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/portfolio", portfolioRouter); 
app.use("/api/alerts", alertRouter);
 
// checkAlerts();
// setInterval(checkAlerts,  60 * 1000); // Check alerts every 15 minutes