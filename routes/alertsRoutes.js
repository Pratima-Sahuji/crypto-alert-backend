import {Router} from "express";
const alertRouter = Router();
import {
  createAlert,
  getUserAlerts,
  getAlert,
  updateAlert,
  deleteAlert
} from "../controllers/alertController.js";

import auth from "../middlewares/auth.js";



alertRouter.post("/",auth, createAlert);
alertRouter.get("/", auth,getUserAlerts);
alertRouter.get("/:id",auth, getAlert);
alertRouter.put("/:id", auth, updateAlert);
alertRouter.delete("/:id",auth , deleteAlert);

export default alertRouter;
