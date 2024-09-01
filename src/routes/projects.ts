import express from "express";
import Project from "../models/projects";
import { authMiddleware } from "../middleware/auth";
import axios from "axios";
const FACEBOOK_API_ENDPOINT = process.env.FACEBOOK_API_ENDPOINT || 'https://graph.facebook.com/v20.0';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

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
const getFacebookConnection: any = async (token: any) => {
  try {
    const response = await axios.get(`${FACEBOOK_API_ENDPOINT}/me?&access_token=${token}`)
    if(response.data.name) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}
const getConnections = async (id: string, connection: string, token: string) => {
  switch(connection) {
    case 'facebook':
      const isEnabled: boolean = await getFacebookConnection(token);
      if(!isEnabled) {
        Project.findByIdAndUpdate(id, {
          connections: {
            facebook: {
              isEnabled: false,
              token: ''
            }
          }
        }, { new: true })
        return false
      } else {
        return true
      }
    default:
      return false;
  }
}
app.get("/:id", (req, res) => {
  const { id } = req.params;
  Project.findById(id)
    .then(async (project: any) => {
      const response = project
      if(!response) {
        res.send({status: 'error', message: 'Project not found'})
      } else {
        const facebookConnection = await getConnections(id, 'facebook', response.connections.facebook.token);
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
    })
    .catch((err) => {
      res.send(err);
    });
});

//get instagram long lived token from short lived token
const updateInstagramToken = async (token: string): Promise<string> => {
  let long_lived_token = token;
  try {
    const response = await axios.get(`${FACEBOOK_API_ENDPOINT}/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${token}`);
    long_lived_token = response.data.access_token;
  } catch (err) {
    console.log('updateInstagramToken: ', err);
  }
  return long_lived_token;
}

//update accessTokens
const updateToken = async (id: string, connection: string, token: string, res: any) => {
  let updated_token = token;
  switch(connection) {
    case 'facebook':
      updated_token = await updateInstagramToken(token);
      break;
    default:
      return updated_token = token;
  }
  const project: any = Project.findOne({id});
  Project.findByIdAndUpdate(id, { 
    connections: {
      ...project.connections,
      [`${connection}`]: {
        isEnabled: true,
        token: updated_token
      }
    }
  }, { new: true })
    .then((project) => {
      res.send({status: 'success', connection});
    })
    .catch((err) => {
      res.send({status: 'error', message: 'Error updating token'});
    });
}
app.post("/:id/set_access", async (req, res) => {
  const { id } = req.params;
  const { token, connection } = req.body;
  await updateToken(id, connection, token, res);
});

// update project by id
app.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, openAIKey, captionLimit, postLimit, hashtags, connections } = req.body;
  const project: any = Project.findOne({id});
  Project.findByIdAndUpdate(id, { 
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
    .then((project: any) => {
      res.send({status: 'success', project: {
        id: project._id,
        title: project.title,
        description: project.description,
        connections: {
          facebook: project.connections.facebook.isEnabled,
        }
      }});
    })
    .catch((err) => {
      res.send(err);
    });
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
