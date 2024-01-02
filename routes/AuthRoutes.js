import express from "express";
import {
  checkUser,
  generateGegoCloudToken,
  getAllUsers,
  onboardUser,
} from "../controllers/AuthController.js";
const router = express.Router();

router.post("/check-user", checkUser);

router.post("/onboard-user", onboardUser);

router.get("/get-contacts", getAllUsers);

router.get("/generate-token/:userId", generateGegoCloudToken);

export default router;
