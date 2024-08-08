"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const node_color_log_1 = __importDefault(require("node-color-log"));
const app = express_1.default.Router();
app.use(express_1.default.json());
app.post("/check_key", (req, res) => {
    axios_1.default.get('https://api.openai.com/v1/models', {
        headers: {
            Authorization: `Bearer ${req.body.openAIKey}`,
        }
    }).then((response) => {
        // logger.info('Response Check_key: ', response.data);
        if (response.data.data.length > 0) {
            res.json({ status: 'success', message: 'Key is valid' });
        }
        else {
            res.json({ status: 'error', message: 'Key is invalid' });
        }
    }).catch((err) => {
        var _a;
        node_color_log_1.default.error('Error Check_key: ', (_a = err.response) === null || _a === void 0 ? void 0 : _a.data);
        res.json({ status: 'error', message: 'Key is invalid' });
    });
});
const openaiRouter = app;
exports.default = openaiRouter;
