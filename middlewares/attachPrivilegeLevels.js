/**
 * @description Attach the enum of privilege levels to res.locals to be used in the view
 */
import { PrivilegeLevel } from '../models/User.js';
const attachPrivilegeLevel = async (req, res, next) => {
    res.locals.PrivilegeLevel = PrivilegeLevel;
    return next();
}

export default attachPrivilegeLevel;