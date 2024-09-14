"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSchema = void 0;
const mongoose_1 = require("mongoose");
exports.postSchema = new mongoose_1.Schema({
    projectId: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        required: false,
        default: '',
    },
    hashtags: {
        type: String,
        required: false,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isPosted: {
        type: Boolean,
        default: false,
    },
});
const Post = (0, mongoose_1.model)('Post', exports.postSchema);
exports.default = Post;
