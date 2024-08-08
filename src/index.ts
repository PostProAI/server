import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import logger from "node-color-log";
import projectsRouter from "./routes/projects";
import openaiRouter from "./routes/openai";
import connectDB from "./utils/connectDB";
dotenv.config();

const APP_URL = process.env.APP_URL || 'http://localhost:3000';


const app: Express = express();
const port = process.env.PORT || 5001;

app.use(cors({ origin: APP_URL }));
connectDB();

const middleare = (req: Request, res: Response, next: any) => {
  logger.info(req.method, req.url);
  next();
}
app.use(express.json());
app.use(middleare)

app.get("/", (req: Request, res: Response) => {
  res.send(`
    <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h1>PostProAI API Server</h1>
    <p>API is working fine</p>
    </div>`);
});

app.use('/projects', projectsRouter);
app.use('/openai', openaiRouter);

app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});