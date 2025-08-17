import {Router} from "express";
import { addTransaction, deleteTransaction, getTransactionById, getTransactions, updateTransaction } from "../controllers/transactionController.js";
const transactionRouter = Router();
import auth from "../middlewares/auth.js";

transactionRouter.post("/add", auth ,addTransaction);
transactionRouter.get("/",auth, getTransactions);
// transactionRouter.get("/:id", getTransactionById);
transactionRouter.put("/update/:id", auth , updateTransaction);
transactionRouter.delete("/delete/:id",auth, deleteTransaction);
transactionRouter.get("/:id",auth, getTransactionById);

export default transactionRouter;