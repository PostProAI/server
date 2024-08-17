"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_color_log_1 = __importDefault(require("node-color-log"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const OPEN_AI_ENDPOINT = process.env.OPEN_AI_ENDPOINT;
const ENVIRONMENT = process.env.ENVIRONMENT || "development";
const app = express_1.default.Router();
app.use(express_1.default.json());
// Function to save a PNG image from a Buffer or Base64 string
function saveImage(data_1, folderPath_1, uniqueName_1) {
    return __awaiter(this, arguments, void 0, function* (data, folderPath, uniqueName, isBase64 = false) {
        const filePath = path_1.default.join(__dirname, folderPath, uniqueName);
        // check the directory exists, if not create it
        const directory = path_1.default.dirname(filePath);
        if (!fs_1.default.existsSync(directory)) {
            fs_1.default.mkdirSync(directory, { recursive: true });
        }
        // If the data is in Base64 format, convert it to a Buffer
        const buffer = isBase64 ? Buffer.from(data, "base64") : data;
        // Write the buffer to a file
        try {
            fs_1.default.writeFileSync(filePath, buffer);
            return true;
        }
        catch (error) {
            console.error("Error saving image", error);
            return false;
        }
    });
}
app.post("/check_key", (req, res) => {
    axios_1.default
        .get(`${OPEN_AI_ENDPOINT}/v1/models`, {
        headers: {
            Authorization: `Bearer ${req.body.openAIKey}`,
        },
    })
        .then((response) => {
        // logger.info('Response Check_key: ', response.data);
        if (response.data.data.length > 0) {
            res.json({ status: "success", message: "Key is valid" });
        }
        else {
            res.json({ status: "error", message: "Key is invalid" });
        }
    })
        .catch((err) => {
        var _a;
        node_color_log_1.default.error("Error Check_key: ", (_a = err.response) === null || _a === void 0 ? void 0 : _a.data);
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
        axios_1.default
            .post(`${OPEN_AI_ENDPOINT}/v1/images/generations`, payload, {
            headers: {
                Authorization: `Bearer ${req.body.openAIKey}`,
            },
        })
            .then((response) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            node_color_log_1.default.info("Response createPost openai: ", response.data);
            if (((_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                const data = response.data.data[0].b64_json;
                // Generate a unique filename
                const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ".png";
                const uploadResult = yield saveImage(data, `media/${req.body.projectId}`, uniqueName, true);
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
            }
            else {
                res.json({ status: "error", message: "Key is invalid" });
            }
        }))
            .catch((err) => {
            var _a;
            node_color_log_1.default.info("Error createPost openai: ", err);
            node_color_log_1.default.error("Error createPost openai: ", (_a = err.response) === null || _a === void 0 ? void 0 : _a.data);
            res.json({ status: "error", message: "Key is invalid" });
        });
    }
});
const openaiRouter = app;
exports.default = openaiRouter;
