import express from "express";
import { checkUser, onboardUser } from "../controllers/AuthController.js";
const router = express.Router();

router.post("/check-user", checkUser);

router.post("/onboard-user", onboardUser);

export default router;
