import { Schema, model } from "mongoose";

export const postSchema = new Schema({
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
});

const Post = model('Post', postSchema);
export default Post;
