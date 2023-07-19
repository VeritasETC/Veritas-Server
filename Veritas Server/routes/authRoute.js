import express from "express";
import { signin } from "../controllers/authController.js";
import { isLoggedIn, isOrginazation } from "../middlewares/isLoggedIn.js";
const router = express.Router();

router.post("/auth/signin", signin);

export default router;
