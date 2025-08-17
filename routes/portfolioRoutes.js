
import {Router} from "express";
import { getPortfolio } from "../controllers/portfolioController.js";
const portfolioRouter = Router();
import auth from "../middlewares/auth.js";
// const Transaction = require("../models/Transaction");
// const calculatePortfolio = require("../utils/portfolioCalculator.js");

portfolioRouter.get("/", auth ,getPortfolio);
    

export default portfolioRouter;
