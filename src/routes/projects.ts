import express from "express";
import Project from "../models/projects";
import { authMiddleware } from "../middleware/auth";

const app = express.Router();
app.use(express.json());
app.use(authMiddleware);

// create new project
app.post("/create", (req: any, res) => {
  const { title, description, openAIKey, captionLimit, postLimit, hashtags } = req.body;
  if (!title) {
    res.send({status: "error", message: "Please provide name and description"});
  } else {
    Project.find({ title }).then((project) => {
      if (project.length === 0) {
        const newProject = new Project({
          userId: req?.user?.id,
          title,
          description,
          openAIKey,
          captionLimit,
          postLimit,
          hashtags,
        });
        newProject
          .save()
          .then((project) => {
            res.send({status: 'success', project});
          })
          .catch((err) => {
            res.send(err);
          });
      } else {
        res.status(200).send({ status: "error", message: "Project already exists", project: project[0] });
      }
    });
  }
});

// get all projects
app.get("/getAllProjects", (req: any, res) => {
  const user = req?.user;
  Project.find({userId: user.id})
    .then((projects) => {
      res.send({status: "success", projects});
    })
    .catch((err) => {
      res.send({status: 'error', message: 'No Projects'});
    });
});

// get project by id
app.get("/:id", (req, res) => {
  const { id } = req.params;
  Project.findById(id)
    .then((project: any) => {
      const response = project
      if(!response) {
        res.send({status: 'error', message: 'Project not found'})
      } else {
        res.send(response);
      }
    })
    .catch((err) => {
      res.send(err);
    });
});

// update project by id
app.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, openAIKey, captionLimit, postLimit, hashtags } = req.body;
  if (!title) {
    res.send({status: "error", message: "Please provide name and description"});
  } else {
    Project.findByIdAndUpdate(id, { 
      title,
      description,
      openAIKey,
      captionLimit,
      postLimit,
      hashtags,
     }, { new: true })
      .then((project) => {
        res.send({status: 'success', project});
      })
      .catch((err) => {
        res.send(err);
      });
  }
});

// delete project by id
app.delete("/:id", (req, res) => {
  const { id } = req.params;
  Project.findByIdAndDelete(id)
    .then(() => {
      res.send({status: 'success', message: 'Project deleted successfully'});
    })
    .catch((err) => {
      res.send(err);
    });
});
const projectsRouter = app;
export default projectsRouter;
