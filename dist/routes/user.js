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
const user_1 = __importDefault(require("../models/user"));
const auth_1 = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;
const app = express_1.default.Router();
app.use(express_1.default.json());
// login user route
const generateToken = (user) => {
    try {
        return jwt.sign({ id: user._id.toString(), email: user.email }, JWT_TOKEN_SECRET, { expiresIn: "1h" });
    }
    catch (error) {
        console.error("Error in generating token", error);
    }
};
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .send({ status: "error", message: "Missing required fields" });
    }
    else {
        user_1.default.find({ email, password })
            .then((user) => __awaiter(void 0, void 0, void 0, function* () {
            if (user.length > 0) {
                const token = yield generateToken(user[0]);
                if (token) {
                    res.status(200).json({
                        status: "success",
                        message: "User logged in successfully",
                        token: token || null,
                    });
                }
                else {
                    res.send({ status: "error", message: "Can't login user at the moment" });
                }
            }
            else {
                res.send({ status: "error", message: "Invalid credentials" });
            }
        }))
            .catch((err) => {
            res.status(500).send({ status: "error", message: err.message });
        });
    }
});
app.post("/create", (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .send({ status: "error", message: "Missing required fields" });
    }
    else {
        user_1.default.find({ email })
            .then((user) => {
            if (user.length > 0) {
                res.send({ status: "error", message: "User already exists" });
            }
            else {
                user_1.default.create({ email, password })
                    .then((user) => {
                    res.send({
                        status: "success",
                        message: "User created successfully",
                        data: { email: user.email },
                    });
                })
                    .catch((err) => {
                    res.status(500).send({ status: "error", message: err.message });
                });
            }
        })
            .catch((err) => {
            res.status(500).send({ status: "error", message: err.message });
        });
    }
});
app.get("/", auth_1.authMiddleware, (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.status(400).send({ status: "error", message: "Missing ID" });
    }
    else {
        user_1.default.findById(id)
            .then((user) => {
            if (user) {
                res.send({
                    status: "success",
                    user: { username: user.username, email: user.email, profilePic: user.profilePic, bio: user.bio, followers: user.followers, following: user.following, verified: user.verified, createdAt: user.createdAt },
                });
            }
            else {
                res.send({ status: "error", message: "User not found" });
            }
        })
            .catch((err) => {
            res.status(500).send({ status: "error", message: err.message });
        });
    }
});
app.get("/:id", (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).send({ status: "error", message: "Missing ID" });
    }
    else {
        user_1.default.findById(id)
            .then((user) => {
            if (user) {
                res.send({
                    status: "success",
                    message: "User created successfully",
                    data: { username: user.username, email: user.email },
                });
            }
            else {
                res.send({ status: "error", message: "User not found" });
            }
        })
            .catch((err) => {
            res.status(500).send({ status: "error", message: err.message });
        });
    }
});
app.put("/:id", (req, res) => {
    const { id } = req.params;
    const { username, email, password, profilePic, bio, followers, following, verified, createdAt, } = req.body;
    if (!username || !email) {
        res.send({ status: "error", message: "Please provide details to update" });
    }
    else {
        user_1.default.findByIdAndUpdate(id, {
            username,
            email,
            password,
            profilePic,
            bio,
            followers,
            following,
            verified,
            createdAt,
        }, { new: true })
            .then((user) => {
            res.send({ status: "success", user });
        })
            .catch((err) => {
            res.send(err);
        });
    }
});
app.delete("/:id", (req, res) => {
    const { id } = req.params;
    user_1.default.findByIdAndDelete(id)
        .then(() => {
        res.send({ status: "success", message: "User deleted successfully" });
    })
        .catch((err) => {
        res.send(err);
    });
});
exports.default = app;
