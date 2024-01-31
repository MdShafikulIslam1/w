import { Router } from "express";
import {
  addImageMessage,
  addMessage,
  getInitialContactsWithMessages,
  getMessages,
} from "../controllers/MessageController.js";

import { FileUploadHelper } from "../utils/FileUploaderHelper.js";

const router = Router();

router.post("/add-message", addMessage);

router.get("/get-initial-contacts/:from", getInitialContactsWithMessages);

router.get("/get-messages/:from/:to", getMessages);

router.post(
  "/add-image-message",
  FileUploadHelper.uploadToDirectory.single("file"),
  (req, res, next) => {
    return addImageMessage(req, res, next);
  }
);
export default router;
