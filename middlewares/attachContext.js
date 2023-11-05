/**
 * @description Attach context(as in the actual value) to res.locals based on the request url, as well as the context module so that it can be used in the view
 */
import * as contextModule from '../shared/context.js';
export default async (req, res, next) => {
    const url = req.originalUrl;
    res.locals.context = contextModule.urlToContext(url);
    res.locals.contextModule = contextModule;
    return next();
}