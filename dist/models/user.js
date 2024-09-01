"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
exports.userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: false,
    },
    profilePic: {
        type: String,
        required: false,
        default: "",
    },
    bio: {
        type: String,
        required: false,
        default: "",
    },
    followers: {
        type: Array,
        required: false,
        default: [],
    },
    following: {
        type: Array,
        required: false,
        default: [],
    },
    verified: {
        type: Boolean,
        required: false,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const User = (0, mongoose_1.model)("User", exports.userSchema);
exports.default = User;
