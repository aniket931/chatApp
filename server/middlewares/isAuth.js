import { sendResponse } from "../helpers/sendRes.js";
import jwt from "jsonwebtoken";

async function isAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return sendResponse(res, 401, "Access Denied");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req._id = decoded.id;
        next();

    } catch (error) {
        return sendResponse(res, 500, "Server ERR");
    }
};

export { isAuth };