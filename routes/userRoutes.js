import {Router} from "express";
const userRouter = Router();
import { registerUser, loginUser, logoutUser, updateUser, deleteUser} from "../controllers/userController.js";
import auth from "../middlewares/auth.js";

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get("/logout", auth ,logoutUser );
userRouter.put("/update", auth, updateUser );
userRouter.delete("/delete",auth, deleteUser);

export default userRouter;