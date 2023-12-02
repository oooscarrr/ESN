import {User} from '../models/User.js';

export const requirePrivilege = (privilege) => {
    return async (req, res, next) => {
        const { userId } = req;
        const user = await User.findById(userId);
        if (user.privilege >= privilege) {
            return next();
        } else {
            return res.redirect('/users');
        }
    }
}