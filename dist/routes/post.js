"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_1 = __importDefault(require("../models/post"));
const auth_1 = require("../middleware/auth");
const app = express_1.default.Router();
app.use(express_1.default.json());
app.use(auth_1.authMiddleware);
// create new post
app.post("/create", (req, res) => {
    const { projectId, image, caption, hashtags } = req.body;
    if (!image && !projectId) {
        res.send({ status: "error", message: "Please provide image" });
    }
    else {
        const newPost = new post_1.default({
            projectId,
            image,
            caption,
            hashtags,
        });
        newPost
            .save()
            .then((post) => {
            res.send({ status: "success", post });
        })
            .catch((err) => {
            res.send(err);
        });
    }
});
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
