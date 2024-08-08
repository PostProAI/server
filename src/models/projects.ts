import { Schema, model } from "mongoose";

export const projectSchema = new Schema({
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

const Project = model('Project', projectSchema);
export default Project;
