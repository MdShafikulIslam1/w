import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import * as fs from "fs";

cloudinary.config({
  cloud_name: "dr8smmidd",
  api_key: "832324728442979",
  api_secret: "Bm3vsigyioVxJ2LGHF0sA2JzVgQ",
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadToDirectory = multer({ storage });


const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file.path, (error, result) => {
      fs.unlinkSync(file.path);
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export const FileUploadHelper = {
  uploadToCloudinary,
  uploadToDirectory,
};
