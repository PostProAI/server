import { Schema, model } from "mongoose";

export const userSchema = new Schema({
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

const User = model("User", userSchema);
export default User;
