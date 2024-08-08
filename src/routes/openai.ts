import express from "express";
import axios, { AxiosError, AxiosResponse } from "axios";
import logger from "node-color-log";

const app = express.Router();
app.use(express.json());

app.post("/check_key", (req, res) => {
    axios.get('https://api.openai.com/v1/models', {
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

const openaiRouter = app;
export default openaiRouter;