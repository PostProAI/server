import express from "express";
import Post from "../models/post";
import Project from "../models/projects";
import { authMiddleware } from "../middleware/auth";
import axios from "axios";
import logger from "node-color-log";
import { getFormattedTime } from "../utils/common";
const FACEBOOK_API_ENDPOINT = process.env.FACEBOOK_API_ENDPOINT || 'https://graph.facebook.com/v20.0';
const ENVIRONMENT = process.env.ENVIRONMENT;

const app = express.Router();
app.use(express.json());
app.use(authMiddleware);

// create new post
const savePost = async (newPost: any) => {
  const post = await newPost.save()
  if(!post) {
    return false;
  } else {
    return true;
  }
}
app.post("/create", async (req, res) => {
  const { projectId, image, caption, hashtags } = req.body;
  const postMediaToSingleChannel = async (channel: string, project: any, post: any) => {
    if(!project) {
      res.send({ status: "error", message: "Project not found" });
    }
    const postObject = post;

    if(ENVIRONMENT === "development") {
      const newPost = new Post({
        ...postObject,
        isPosted: true,
      });
      const post = await savePost(newPost);
      if (post) {
        logger.success(
          getFormattedTime(),
          `:: Project: ${postObject.projectId} :: Posted to Facebook`
        );
        res.send({ status: "success", message: "Posted to Facebook" });
      } else {
        logger.error(
          getFormattedTime(),
          `::Project: ${postObject.projectId} :: Error posting to Facebook`
        );
        res.send({ status: "error", message: "Error posting to Facebook" });
      }
    } else {
      if (channel === "facebook") {
        try {
          const params = {
            access_token: project.connections.facebook.token,
          };
    
          // get Facebook page id
          const response1 = await axios.get(
            `${FACEBOOK_API_ENDPOINT}/me/accounts`,
            {
              params,
            }
          );
          const pageId = response1.data.data[0]?.id;
          if (!pageId) {
            res.send({ status: "error", message: "No Facebook page found" });
          }
    
          // get instagram page id
          const response2 = await axios.get(`${FACEBOOK_API_ENDPOINT}/${pageId}`, {
            params: {
              ...params,
              fields: "instagram_business_account",
            },
          });
          const instaId = response2.data.instagram_business_account.id;
          if (!instaId) {
            res.send({ status: "error", message: "No Instagram account found" });
          }
    
          // create media container
          const response3 = await axios.post(
            `${FACEBOOK_API_ENDPOINT}/${instaId}/media`,
            {},
            {
              params: {
                ...params,
                image_url: postObject.image,
                caption: postObject.caption,
              },
            }
          );
          const containerId = response3.data.id;
          if (!containerId) {
            res.send({ status: "error", message: "Error creating media container" });
          }
    
          logger.success(
            getFormattedTime(),
            `:: Project: ${postObject.projectId} :: Initiating Posting`
          );
          let counter = 0;
          // setTimer to check media container status
          const timer = setInterval(async () => {
            // get media container status
            const response4 = await axios.get(
              `${FACEBOOK_API_ENDPOINT}/${containerId}`,
              {
                params: {
                  ...params,
                  fields: "status_code",
                },
              }
            );
            const status = response4.data.status_code;
            if (status === "FINISHED") {
              clearInterval(timer);
              // publish media container
              const response5 = await axios.post(
                `${FACEBOOK_API_ENDPOINT}/${instaId}/media_publish`,
                {},
                {
                  params: {
                    ...params,
                    creation_id: containerId,
                  },
                }
              );
              if (response5.data.id) {
                clearInterval(timer);
                const newPost = new Post({
                  ...postObject,
                  isPosted: true,
                });
                const post = await savePost(newPost);
                if (post) {
                  logger.success(
                    getFormattedTime(),
                    `:: Project: ${postObject.projectId} :: Posted to Facebook`
                  );
                  res.send({ status: "success", message: "Posted to Facebook" });
                } else {
                  logger.error(
                    getFormattedTime(),
                    `::Project: ${postObject.projectId} :: Error posting to Facebook`
                  );
                  res.send({ status: "error", message: "Error posting to Facebook" });
                }
              } else {
                logger.error(
                  getFormattedTime(),
                  `:: Project: ${postObject.projectId} :: Error posting to Facebook`
                );
                res.send({ status: "error", message: "Error posting to Facebook" });
              }
            } else {
              if (counter === 12) {
                clearInterval(timer);
                const newPost = new Post({
                  ...postObject,
                  isPosted: false,
                });
                const post = await savePost(newPost);
                if (post) {
                  logger.error(
                    getFormattedTime(),
                    `:: Project: ${postObject.projectId} :: Error in posting, saved as drafted`
                  );
                  res.send({ status: "error", message: "Error in posting, saved as drafted" });
                } else {
                  logger.error(
                    getFormattedTime(),
                    `:: Project: ${postObject.projectId} :: Error in posting and saving`
                  );
                  res.send({ status: "error", message: "Error in posting and saving" });
                }
              } else {
                counter++;
                logger.info(
                  getFormattedTime(),
                  `:: Project: ${postObject.projectId} :: Checking status again...`
                );
              }
            }
          }, 1000);
        } catch (e) {
          res.send({ status: "error", message: "Error posting to Facebook" });
        }
      } else {
        res.send({ status: "error", message: "Channel not found" });
      }
    }
  }

  if (!image && !projectId) {
    res.send({ status: "error", message: "Please provide image" });
  } else {
    const project = await Project.findById(projectId);
    const post = {
      projectId,
      image,
      caption,
      hashtags,
    }
    postMediaToSingleChannel("facebook", project, post);
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
