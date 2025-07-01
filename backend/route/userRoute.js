import express from "express";
import { checkAuth, login, logout, signUp, updateProfile } from "../controller/userController.js";
import { protectRoute } from "../middleware/auth.js";
const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", login);
userRouter.get("/logout", logout);
userRouter.put("/updateProfile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;