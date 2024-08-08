import express from "express";
import Project from "../models/projects";

const app = express.Router();
app.use(express.json());

// create new project
app.post("/create", (req, res) => {
  const { title, description, openAIKey } = req.body;
  if (!title) {
    res.send({status: "error", message: "Please provide name and description"});
  } else {
    Project.find({ title }).then((project) => {
      if (project.length === 0) {
        const newProject = new Project({
          title,
          description,
          openAIKey,
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
app.get("/getProjectById/:id", (req, res) => {
  const { id } = req.params;
  Project.findById(id)
    .then((project) => {
      res.send(project);
    })
    .catch((err) => {
      res.send(err);
    });
});

// update project by id
app.put("/updateProjectById/:id", (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  Project.findByIdAndUpdate(id, { title, description }, { new: true })
    .then((project) => {
      res.send(project);
    })
    .catch((err) => {
      res.send(err);
    });
});
const projectsRouter = app;
export default projectsRouter;
