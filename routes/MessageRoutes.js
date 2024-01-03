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

// TODO:implement audio or voice message (try to with cloudinary)

//const const uploadAudio = multer({dest:"uploads/recordings"})
// router.post(
//   "/add-audio-message",
//   FileUploadHelper.uploadToDirectory.single("file"),
//   (req, res, next) => {
//     return addAudioMessage(req, res, next);
//   }
// );

// router.post("/add-audio-message", uploadAudio.single("audio"), addAudioMessage);
