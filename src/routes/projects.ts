import express from "express";
import Project from "../models/projects";

const app = express.Router();
app.use(express.json());

// create new project
app.post("/create", (req, res) => {
  const { title, description, openAIKey, captionLimit, postLimit, hashtags } = req.body;
  if (!title) {
    res.send({status: "error", message: "Please provide name and description"});
  } else {
    Project.find({ title }).then((project) => {
      if (project.length === 0) {
        const newProject = new Project({
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
app.get("/getAllProjects", (req, res) => {
  Project.find()
    .then((projects) => {
      res.send(projects);
    })
    .catch((err) => {
      res.send(err);
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
