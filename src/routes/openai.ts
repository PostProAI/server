import express from "express";
import axios, { AxiosError, AxiosResponse } from "axios";
import fs from "fs";
import path from "path";
import logger from "node-color-log";
import dotenv from "dotenv";
import { authMiddleware } from "../middleware/auth";
import { uploadFile } from "../utils/common";
import config from "../utils/firebase.config";
import { initializeApp } from "firebase/app";
dotenv.config();
const OPEN_AI_ENDPOINT = process.env.OPEN_AI_ENDPOINT;
const ENVIRONMENT = process.env.ENVIRONMENT;
const TEST_IMAGE_URL = process.env.TEST_IMAGE_URL;

const app = express.Router();
app.use(express.json());
app.use(authMiddleware);

if(ENVIRONMENT != "development") {
  //Initialize a firebase application
  initializeApp(config.firebaseConfig);
}

// Function to save a JPEG image from a Buffer or Base64 string
async function saveImage(
  data: any,
  folderPath: string,
  uniqueName: string,
  isBase64 = false
) {
  
  
  // If the data is in Base64 format, convert it to a Buffer
  const buffer = isBase64 ? Buffer.from(data, "base64") : data;
  
  if(ENVIRONMENT === "development") {
    // 1. save file on server
    // -------------------------
      // Generate the file path
      const filePath = path.join(__dirname, folderPath, uniqueName);

      // check the directory exists, if not create it
      const directory = path.dirname(filePath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      // Write the buffer to a file
      try {
        fs.writeFileSync(filePath, buffer);
        return {
          status: "success",
          message: "Image saved successfully",
          url: `${TEST_IMAGE_URL}`,
        };
      } catch (error) {
        logger.error("Error saving image", error);
        return { status: "error", message: "Failed to save image" };
      }
    //-------------------------
  } else {
    // 2. save file on firebase
    // -------------------------
    const res = await uploadFile(uniqueName, buffer, folderPath);
    if(res.downloadURL) {
      return {
        status: "success",
        message: "Image saved successfully",
        url: res.downloadURL,
      };
    } else {
      return {
        status: "error",
        message: "Failed to save image",
      };
    }
    //-------------------------
  }
}

app.post("/check_key", (req, res) => {
  axios
    .get(`${OPEN_AI_ENDPOINT}/v1/models`, {
      headers: {
        Authorization: `Bearer ${req.body.openAIKey}`,
      },
    })
    .then((response: AxiosResponse) => {
      if (response.data.data.length > 0) {
        res.json({ status: "success", message: "Key is valid" });
      } else {
        res.json({ status: "error", message: "Key is invalid" });
      }
    })
    .catch((err: AxiosError) => {
      logger.error("Error Check_key: ", err.response?.data);
      res.json({ status: "error", message: "Key is invalid" });
    });
});

app.post("/createPost", (req, res) => {
  const payload = {
    model: "dall-e-3",
    prompt: req.body.prompt,
    size: "1024x1024",
    n: 1,
    response_format: "b64_json",
    // style: "natural"
  };

  if (ENVIRONMENT === "development") {
    // for development
    res.json({
      status: "success",
      message: "Image Generated successfully",
      data: {
        url: `${TEST_IMAGE_URL}`,
      },
    });
  } else {
    // for production
    axios
      .post(`${OPEN_AI_ENDPOINT}/v1/images/generations`, payload, {
        headers: {
          Authorization: `Bearer ${req.body.openAIKey}`,
        },
      })
      .then(async (response: AxiosResponse) => {
        logger.info("Response createPost openai: ", response.data);
        if (response?.data?.data?.length > 0) {
          const data = response.data.data[0].b64_json;
          // Generate a unique filename
          const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9) + ".jpeg";
          const uploadResult: any = await saveImage(
            data,
            `PostProAI/${req.body.projectId}`,
            uniqueName,
            true
          );
          if (uploadResult.status === "error") {
            res.json({ status: "error", message: "Failed to save image" });
            return;
          }
          res.json({
            status: "success",
            message: "Image Generated successfully",
            data: {
              url: uploadResult.url,
            },
          });
        } else {
          res.json({ status: "error", message: "Key is invalid" });
        }
      })
      .catch((err: AxiosError) => {
        logger.info("Error createPost openai: ", err);
        logger.error("Error createPost openai: ", err.response?.data);
        res.json({ status: "error", message: "Key is invalid" });
      });
  }
});

const openaiRouter = app;
export default openaiRouter;
