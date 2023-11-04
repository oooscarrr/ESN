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
        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(data.id);
        res.locals.user = user;
        req.userId = data.id;
        return next();
    } catch {
        return next();
    }
}