import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/joinCommunity');
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = data.id;
        return next();
    } catch {
        return res.redirect('/joinCommunity');
    }
}
