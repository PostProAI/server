import express, { Express, Request, Response } from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import logger from "node-color-log";
import projectsRouter from "./routes/projects";
import postRouter from "./routes/post";
import openaiRouter from "./routes/openai";
import userRouter from "./routes/user";
import connectDB from "./utils/connectDB";
dotenv.config();

const APP_URL = process.env.APP_URL || "http://localhost:3000";

const app: Express = express();
const port = process.env.PORT || 5001;
const ENVIRONMENT = process.env.ENVIRONMENT;

app.use("/uploads", express.static(path.join(__dirname, "/routes/media")));
app.use(cors({ origin: APP_URL }));
connectDB();

const middleware = (req: Request, res: Response, next: any) => {
  if (ENVIRONMENT === "development") {
    logger.info(req.method, req.url, req.body);
  } else {
    logger.info(req.method, req.url);
  }
  next();
};
app.use(express.json());
app.use(middleware);

app.get("/", (req: Request, res: Response) => {
  res.send(`
    <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h1>PostProAI API Server</h1>
    <p>API is working fine</p>
    </div>`);
});

app.use("/projects", projectsRouter);
app.use("/openai", openaiRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});
