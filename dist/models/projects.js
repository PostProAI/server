"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectSchema = void 0;
const mongoose_1 = require("mongoose");
exports.projectSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
        default: '',
    },
    openAIKey: {
        type: String,
        required: true,
        default: '',
    },
    captionLimit: {
        type: Number,
        required: false,
        default: 100,
    },
    postLimit: {
        type: Number,
        required: false,
        default: 10,
    },
    hashtags: {
        type: Boolean,
        required: false,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    connections: {
        facebook: {
            isEnabled: { type: Boolean, default: false },
            token: { type: String, default: '' },
        },
    },
});
const Project = (0, mongoose_1.model)('Project', exports.projectSchema);
exports.default = Project;
//# sourceMappingURL=projects.js.map