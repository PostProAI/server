"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectSchema = void 0;
const mongoose_1 = require("mongoose");
exports.projectSchema = new mongoose_1.Schema({
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
    // status: {
    //   type: String,
    //   required: false,
    //   default: 'active',
    // },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Project = (0, mongoose_1.model)('Project', exports.projectSchema);
exports.default = Project;
