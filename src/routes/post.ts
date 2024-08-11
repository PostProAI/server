import express from "express";
import Post from "../models/post";

const app = express.Router();
app.use(express.json());

// create new post
app.post("/create", (req, res) => {
  const { projectId, image, caption, hashtags } = req.body;
  if (!image && !projectId) {
    res.send({status: "error", message: "Please provide image"});
  } else {
    // Post.find({ image }).then((post) => {
    //   if (post.length === 0) {
        const newPost = new Post({
          projectId,
          image,
          caption,
          hashtags,
        });
        newPost
          .save()
          .then((post) => {
            res.send({status: 'success', post});
          })
          .catch((err) => {
            res.send(err);
          });
  //     } else {
  //       res.status(200).send({ status: "error", message: "Post already exists", post: post[0] });
  //     }
  //   });
  }
});

// get all posts
app.get("/getAllPosts/:id", (req, res) => {
  const { id } = req.params;
  Post.find({projectId: id})
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
      const response = post
      if(response === null) {
        res.send({status: 'error', message: 'Post not found'})
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
