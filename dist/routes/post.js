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
const post_1 = __importDefault(require("../models/post"));
const projects_1 = __importDefault(require("../models/projects"));
const auth_1 = require("../middleware/auth");
const axios_1 = __importDefault(require("axios"));
const node_color_log_1 = __importDefault(require("node-color-log"));
const common_1 = require("../utils/common");
const FACEBOOK_API_ENDPOINT = process.env.FACEBOOK_API_ENDPOINT || 'https://graph.facebook.com/v20.0';
const app = express_1.default.Router();
app.use(express_1.default.json());
app.use(auth_1.authMiddleware);
// create new post
const savePost = (newPost) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield newPost.save();
    if (!post) {
        return false;
    }
    else {
        return true;
    }
});
app.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, image, caption, hashtags } = req.body;
    const postMediaToSingleChannel = (channel, project, post) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!project) {
            res.send({ status: "error", message: "Project not found" });
        }
        const postObject = post;
        if (channel === "facebook") {
            try {
                const params = {
                    access_token: project.connections.facebook.token,
                };
                // get Facebook page id
                const response1 = yield axios_1.default.get(`${FACEBOOK_API_ENDPOINT}/me/accounts`, {
                    params,
                });
                const pageId = (_a = response1.data.data[0]) === null || _a === void 0 ? void 0 : _a.id;
                if (!pageId) {
                    res.send({ status: "error", message: "No Facebook page found" });
                }
                // get instagram page id
                const response2 = yield axios_1.default.get(`${FACEBOOK_API_ENDPOINT}/${pageId}`, {
                    params: Object.assign(Object.assign({}, params), { fields: "instagram_business_account" }),
                });
                const instaId = response2.data.instagram_business_account.id;
                if (!instaId) {
                    res.send({ status: "error", message: "No Instagram account found" });
                }
                // create media container
                const response3 = yield axios_1.default.post(`${FACEBOOK_API_ENDPOINT}/${instaId}/media`, {}, {
                    params: Object.assign(Object.assign({}, params), { image_url: postObject.image, caption: postObject.caption }),
                });
                const containerId = response3.data.id;
                if (!containerId) {
                    res.send({ status: "error", message: "Error creating media container" });
                }
                node_color_log_1.default.success((0, common_1.getFormattedTime)(), `:: Project: ${postObject.projectId} :: Initiating Posting`);
                let counter = 0;
                // setTimer to check media container status
                const timer = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
                    // get media container status
                    const response4 = yield axios_1.default.get(`${FACEBOOK_API_ENDPOINT}/${containerId}`, {
                        params: Object.assign(Object.assign({}, params), { fields: "status_code" }),
                    });
                    const status = response4.data.status_code;
                    if (status === "FINISHED") {
                        clearInterval(timer);
                        // publish media container
                        const response5 = yield axios_1.default.post(`${FACEBOOK_API_ENDPOINT}/${instaId}/media_publish`, {}, {
                            params: Object.assign(Object.assign({}, params), { creation_id: containerId }),
                        });
                        if (response5.data.id) {
                            clearInterval(timer);
                            const newPost = new post_1.default(Object.assign(Object.assign({}, postObject), { isPosted: true }));
                            const post = yield savePost(newPost);
                            if (post) {
                                node_color_log_1.default.success((0, common_1.getFormattedTime)(), `:: Project: ${postObject.projectId} :: Posted to Facebook`);
                                res.send({ status: "success", message: "Posted to Facebook" });
                            }
                            else {
                                node_color_log_1.default.error((0, common_1.getFormattedTime)(), `::Project: ${postObject.projectId} :: Error posting to Facebook`);
                                res.send({ status: "error", message: "Error posting to Facebook" });
                            }
                        }
                        else {
                            node_color_log_1.default.error((0, common_1.getFormattedTime)(), `:: Project: ${postObject.projectId} :: Error posting to Facebook`);
                            res.send({ status: "error", message: "Error posting to Facebook" });
                        }
                    }
                    else {
                        if (counter === 12) {
                            clearInterval(timer);
                            const newPost = new post_1.default(Object.assign(Object.assign({}, postObject), { isPosted: false }));
                            const post = yield savePost(newPost);
                            if (post) {
                                node_color_log_1.default.error((0, common_1.getFormattedTime)(), `:: Project: ${postObject.projectId} :: Error in posting, saved as drafted`);
                                res.send({ status: "error", message: "Error in posting, saved as drafted" });
                            }
                            else {
                                node_color_log_1.default.error((0, common_1.getFormattedTime)(), `:: Project: ${postObject.projectId} :: Error in posting and saving`);
                                res.send({ status: "error", message: "Error in posting and saving" });
                            }
                        }
                        else {
                            counter++;
                            node_color_log_1.default.info((0, common_1.getFormattedTime)(), `:: Project: ${postObject.projectId} :: Checking status again...`);
                        }
                    }
                }), 1000);
            }
            catch (e) {
                res.send({ status: "error", message: "Error posting to Facebook" });
            }
        }
        else {
            res.send({ status: "error", message: "Channel not found" });
        }
    });
    if (!image && !projectId) {
        res.send({ status: "error", message: "Please provide image" });
    }
    else {
        const project = yield projects_1.default.findById(projectId);
        const post = {
            projectId,
            image,
            caption,
            hashtags,
        };
        postMediaToSingleChannel("facebook", project, post);
    }
}));
// get all posts
app.get("/getAllPosts/:id", (req, res) => {
    const { id } = req.params;
    post_1.default.find({ projectId: id })
        .then((posts) => {
        res.send(posts);
    })
        .catch((err) => {
        res.send(err);
    });
});
// get post by id
app.get("/:id", (req, res) => {
    const { id } = req.params;
    post_1.default.findById(id)
        .then((post) => {
        const response = post;
        if (response === null) {
            res.send({ status: "error", message: "Post not found" });
        }
        res.send(response);
    })
        .catch((err) => {
        res.send(err);
    });
});
// update post by id
app.put("/:id", (req, res) => {
    const { id } = req.params;
    const { caption, hashtags } = req.body;
    post_1.default.findByIdAndUpdate(id, { caption, hashtags }, { new: true })
        .then((post) => {
        res.send(post);
    })
        .catch((err) => {
        res.send(err);
    });
});
const postRouter = app;
exports.default = postRouter;
