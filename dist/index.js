"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_color_log_1 = __importDefault(require("node-color-log"));
const projects_1 = __importDefault(require("./routes/projects"));
const post_1 = __importDefault(require("./routes/post"));
const openai_1 = __importDefault(require("./routes/openai"));
const connectDB_1 = __importDefault(require("./utils/connectDB"));
dotenv_1.default.config();
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const app = (0, express_1.default)();
const port = process.env.PORT || 5001;
const ENVIRONMENT = process.env.ENVIRONMENT || "development";
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "/routes/media")));
app.use((0, cors_1.default)({ origin: APP_URL }));
(0, connectDB_1.default)();
const middleare = (req, res, next) => {
    if (ENVIRONMENT === "development") {
        node_color_log_1.default.info(req.method, req.url, req.body);
    }
    else {
        node_color_log_1.default.info(req.method, req.url);
    }
    next();
};
app.use(express_1.default.json());
app.use(middleare);
app.get("/", (req, res) => {
    res.send(`
    <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
    <h1>PostProAI API Server</h1>
    <p>API is working fine</p>
    </div>`);
});
app.use("/projects", projects_1.default);
app.use("/openai", openai_1.default);
app.use("/post", post_1.default);
app.listen(port, () => {
    node_color_log_1.default.info(`Server is running at http://localhost:${port}`);
});
