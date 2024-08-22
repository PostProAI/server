import { Schema, model } from "mongoose";

export const projectSchema = new Schema({
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
});

const Project = model('Project', projectSchema);
export default Project;
