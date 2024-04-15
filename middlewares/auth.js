const jwt = require('jsonwebtoken');
function verifyToken(req, res, next) {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: 'Unauthorized access' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = verifyToken;