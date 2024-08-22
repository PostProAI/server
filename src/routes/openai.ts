import express from "express";
import axios, { AxiosError, AxiosResponse } from "axios";
import fs from "fs";
import path from "path";
import logger from "node-color-log";
import dotenv from "dotenv";
import { authMiddleware } from "../middleware/auth";
dotenv.config();
const OPEN_AI_ENDPOINT = process.env.OPEN_AI_ENDPOINT;
const ENVIRONMENT = process.env.ENVIRONMENT || "development";

const app = express.Router();
app.use(express.json());
app.use(authMiddleware);

// Function to save a PNG image from a Buffer or Base64 string
async function saveImage(
  data: any,
  folderPath: string,
  uniqueName: string,
  isBase64 = false
) {
  const filePath = path.join(__dirname, folderPath, uniqueName);

  // check the directory exists, if not create it
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // If the data is in Base64 format, convert it to a Buffer
  const buffer = isBase64 ? Buffer.from(data, "base64") : data;

  // Write the buffer to a file
  try {
    fs.writeFileSync(filePath, buffer);
    return true;
  } catch (error) {
    console.error("Error saving image", error);
    return false;
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

  if (ENVIRONMENT === "development")
    // for development
    res.json({
      status: "success",
      message: "Image Generated successfully",
      data: {
        url: `uploads/${req.body.projectId}/1723893252644-816159603.png`,
      },
    });
  else {
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
            Date.now() + "-" + Math.round(Math.random() * 1e9) + ".png";
          const uploadResult: any = await saveImage(
            data,
            `media/${req.body.projectId}`,
            uniqueName,
            true
          );
          if (!uploadResult) {
            res.json({ status: "error", message: "Failed to save image" });
            return;
          }
          res.json({
            status: "success",
            message: "Image Generated successfully",
            data: {
              url: `uploads/${req.body.projectId}/${uniqueName}`,
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
