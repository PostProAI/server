"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projects_1 = __importDefault(require("../models/projects"));
const app = express_1.default.Router();
app.use(express_1.default.json());
// create new project
app.post("/create", (req, res) => {
    const { title, description, openAIKey } = req.body;
    if (!title) {
        res.send({ status: "error", message: "Please provide name and description" });
    }
    else {
        projects_1.default.find({ title }).then((project) => {
            if (project.length === 0) {
                const newProject = new projects_1.default({
                    title,
                    description,
                    openAIKey,
                });
                newProject
                    .save()
                    .then((project) => {
                    res.send({ status: 'success', project });
                })
                    .catch((err) => {
                    res.send(err);
                });
            }
            else {
                res.status(200).send({ status: "error", message: "Project already exists", project: project[0] });
            }
        });
    }
});
// get all projects
app.get("/getAllProjects", (req, res) => {
    projects_1.default.find()
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
    projects_1.default.findById(id)
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
    projects_1.default.findByIdAndUpdate(id, { title, description }, { new: true })
        .then((project) => {
        res.send(project);
    })
        .catch((err) => {
        res.send(err);
    });
});
const projectsRouter = app;
exports.default = projectsRouter;
