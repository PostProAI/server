"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projects_1 = __importDefault(require("../models/projects"));
const auth_1 = require("../middleware/auth");
const axios_1 = __importDefault(require("axios"));
const FACEBOOK_API_ENDPOINT = process.env.FACEBOOK_API_ENDPOINT || 'https://graph.facebook.com/v20.0';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const app = express_1.default.Router();
app.use(express_1.default.json());
app.use(auth_1.authMiddleware);
// create new project
app.post("/create", (req, res) => {
    const { title, description, openAIKey, captionLimit, postLimit, hashtags } = req.body;
    if (!title) {
        res.send({ status: "error", message: "Please provide name and description" });
    }
    else {
        projects_1.default.find({ title }).then((project) => {
            var _a;
            if (project.length === 0) {
                const newProject = new projects_1.default({
                    userId: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id,
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
    const user = req === null || req === void 0 ? void 0 : req.user;
    projects_1.default.find({ userId: user.id })
        .then((projects) => {
        res.send({ status: "success", projects });
    })
        .catch((err) => {
        res.send({ status: 'error', message: 'No Projects' });
    });
});
// get project by id
const getFacebookConnection = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`${FACEBOOK_API_ENDPOINT}/me?&access_token=${token}`);
        if (response.data.name) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (err) {
        return false;
    }
});
const getConnections = (id, connection, token) => __awaiter(void 0, void 0, void 0, function* () {
    switch (connection) {
        case 'facebook':
            const isEnabled = yield getFacebookConnection(token);
            if (!isEnabled) {
                projects_1.default.findByIdAndUpdate(id, {
                    connections: {
                        facebook: {
                            isEnabled: false,
                            token: ''
                        }
                    }
                }, { new: true });
                return false;
            }
            else {
                return true;
            }
        default:
            return false;
    }
});
app.get("/:id", (req, res) => {
    const { id } = req.params;
    projects_1.default.findById(id)
        .then((project) => __awaiter(void 0, void 0, void 0, function* () {
        const response = project;
        if (!response) {
            res.send({ status: 'error', message: 'Project not found' });
        }
        else {
            const facebookConnection = yield getConnections(id, 'facebook', response.connections.facebook.token);
            res.send({
                id: response._id,
                title: response.title,
                description: response.description,
                captionLimit: response.captionLimit,
                postLimit: response.postLimit,
                connections: {
                    facebook: facebookConnection,
                },
            });
        }
    }))
        .catch((err) => {
        res.send(err);
    });
});
//get instagram long lived token from short lived token
const updateInstagramToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let long_lived_token = token;
    try {
        const response = yield axios_1.default.get(`${FACEBOOK_API_ENDPOINT}/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${token}`);
        long_lived_token = response.data.access_token;
    }
    catch (err) {
        console.log('updateInstagramToken: ', err);
    }
    return long_lived_token;
});
//update accessTokens
const updateToken = (id, connection, token, res) => __awaiter(void 0, void 0, void 0, function* () {
    let updated_token = token;
    switch (connection) {
        case 'facebook':
            updated_token = yield updateInstagramToken(token);
            break;
        default:
            return updated_token = token;
    }
    const project = projects_1.default.findOne({ id });
    projects_1.default.findByIdAndUpdate(id, {
        connections: Object.assign(Object.assign({}, project.connections), { [`${connection}`]: {
                isEnabled: true,
                token: updated_token
            } })
    }, { new: true })
        .then((project) => {
        res.send({ status: 'success', connection });
    })
        .catch((err) => {
        res.send({ status: 'error', message: 'Error updating token' });
    });
});
app.post("/:id/set_access", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { token, connection } = req.body;
    yield updateToken(id, connection, token, res);
}));
// update project by id
app.put("/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, openAIKey, captionLimit, postLimit, hashtags, connections } = req.body;
    const project = projects_1.default.findOne({ id });
    projects_1.default.findByIdAndUpdate(id, {
        title: title ? title : project.title,
        description: description ? description : project.description,
        openAIKey: openAIKey ? openAIKey : project.openAIKey,
        captionLimit: captionLimit ? captionLimit : project.captionLimit,
        postLimit: postLimit ? postLimit : project.postLimit,
        hashtags: hashtags ? hashtags : project.hashtags,
        connections: connections ? {
            facebook: {
                isEnabled: connections.facebook,
                token: connections.facebook ? project.connections.facebook.token : '',
            },
        } : {
            facebook: project.connections.facebook,
        }
    }, { new: true })
        .then((project) => {
        res.send({ status: 'success', project: {
                id: project._id,
                title: project.title,
                description: project.description,
                connections: {
                    facebook: project.connections.facebook.isEnabled,
                }
            } });
    })
        .catch((err) => {
        res.send(err);
    });
});
// delete project by id
app.delete("/:id", (req, res) => {
    const { id } = req.params;
    projects_1.default.findByIdAndDelete(id)
        .then(() => {
        res.send({ status: 'success', message: 'Project deleted successfully' });
    })
        .catch((err) => {
        res.send(err);
    });
});
const projectsRouter = app;
exports.default = projectsRouter;
