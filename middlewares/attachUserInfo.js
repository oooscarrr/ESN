import jwt from "jsonwebtoken";
import {User} from "../models/User.js";
/**
 * @description Attach user info to res.locals
 */
export default async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next();
    }
    try {
        const data = jwt.verify(token, "SecB3Rocks");
        const user = await User.findById(data.id);
        res.locals.user = user;
        return next();
    } catch {
        return next();
    }
}