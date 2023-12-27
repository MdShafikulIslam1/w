import express from "express";
import { checkUser } from "../controllers/AuthController.js";
const router = express.Router();

router.post("/check-user", checkUser);

export default router;