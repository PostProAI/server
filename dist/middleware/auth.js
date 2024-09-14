"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        res.status(401).send("Access Denied");
        return false;
    }
    const tokenString = token.split(" ")[1];
    try {
        const verified = jwt.verify(tokenString, JWT_TOKEN_SECRET);
        req.user = verified;
        next();
    }
    catch (err) {
        res.status(200).send({ message: "Invalid Token", isInvalidToken: true });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map