import express from "express";
import axios, { AxiosError, AxiosResponse } from "axios";
import logger from "node-color-log";
import dotenv from "dotenv";
dotenv.config();
const OPEN_AI_ENDPOINT = process.env.OPEN_AI_ENDPOINT;

const app = express.Router();
app.use(express.json());


app.post("/check_key", (req, res) => {
    axios.get(`${OPEN_AI_ENDPOINT}/v1/models`, {
        headers: {
            Authorization: `Bearer ${req.body.openAIKey}`,
        }
    }).then((response: AxiosResponse) => {
        // logger.info('Response Check_key: ', response.data);
        if(response.data.data.length > 0) {
            res.json({status: 'success', message: 'Key is valid'});
        } else {
            res.json({status: 'error', message: 'Key is invalid'});
        }
    }).catch((err: AxiosError) => {
        logger.error('Error Check_key: ', err.response?.data);
        res.json({status: 'error', message: 'Key is invalid'});
    });
});

app.post("/createPost", (req, res) => {
    const payload = {
        model: "dall-e-3",
        prompt: req.body.prompt,
        size: "1024x1024",
        n: 1,
        // style: "natural"
    };
    // for production
    // axios.post(`${OPEN_AI_ENDPOINT}/v1/images/generations`, payload, {
    //     headers: {
    //         Authorization: `Bearer ${req.body.openAIKey}`,
    //     }
    // }).then((response: AxiosResponse) => {
    //     // logger.info('Response Check_key: ', response.data);
    //     if(response?.data?.data?.length > 0) {
    //         res.json({status: 'success', message: "Image Generated successfully", data: response.data.data[0]});
    //     } else {
    //         res.json({status: 'error', message: 'Key is invalid'});
    //     }
    // }).catch((err: AxiosError) => {
    //     logger.error('Error Check_key: ', err.response?.data);
    //     res.json({status: 'error', message: 'Key is invalid'});
    // });
    
    // for development
    // res.json({status: 'success', message: "Image Generated successfully", data: {url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-xk9wNX3TJjAt0uiKqqqvfmxO/user-aHUkxwkRI9aTPcZDXTkmLerY/img-08nCk0xx45GWV57q8cwdkq3S.png?st=2024-08-10T13%3A18%3A44Z&se=2024-08-10T15%3A18%3A44Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-08-10T07%3A27%3A51Z&ske=2024-08-11T07%3A27%3A51Z&sks=b&skv=2023-11-03&sig=P4GFWUUCVaHTGeFC306TIYVobgO0COlSXEkCBrG5%2B0Y%3D'}});
    res.json({status: 'success', message: "Image Generated successfully", data: {url: 'https://global.discourse-cdn.com/openai1/original/4X/0/0/9/009f9039cf2b47d79785495e3b21c3dd97080b42.jpeg'}});
});

const openaiRouter = app;
export default openaiRouter;