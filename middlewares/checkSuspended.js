import {app} from '../app.js';
export default (req, res, next) => {
    if (!app.locals.suspended) {
        return next();
    }
    else if (req.userId === app.locals.suspension_initiator) {
        return next();
    }
    else {
        return res.sendStatus(503);
    }
}
