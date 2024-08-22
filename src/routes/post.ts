import express from "express";
import Post from "../models/post";
import { authMiddleware } from "../middleware/auth";

const app = express.Router();
app.use(express.json());
app.use(authMiddleware);

// create new post
app.post("/create", (req, res) => {
  const { projectId, image, caption, hashtags } = req.body;
  if (!image && !projectId) {
    res.send({ status: "error", message: "Please provide image" });
  } else {
    const newPost = new Post({
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
  Post.find({ projectId: id })
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
  Post.findById(id)
    .then((post: any) => {
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
  Post.findByIdAndUpdate(id, { caption, hashtags }, { new: true })
    .then((post) => {
      res.send(post);
    })
    .catch((err) => {
      res.send(err);
    });
});
const postRouter = app;
export default postRouter;
