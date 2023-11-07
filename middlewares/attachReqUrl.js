/**
 * @description Attach request url to res.locals
 */
export default async (req, res, next) => {
    res.locals.reqUrl = req.originalUrl;
    return next();
}