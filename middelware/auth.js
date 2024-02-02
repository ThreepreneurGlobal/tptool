const jwt = require('jsonwebtoken');

const authenticateRole = (allowedRoles) => (req, res, next) => {
    try {
        const token = req.headers.authorization;

        console.log(token)
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
        }

        jwt.verify(token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', (err, decoded) => {
            
            if (err) {
                return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
            }

            if (allowedRoles.includes(decoded.role)) {
                req.user = decoded;
                next();
            } else {
                res.status(403).json({ success: false, message: 'Forbidden: Invalid user role' });
            }
        });
    } catch (error) {
        console.error('Error in authentication middleware:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = authenticateRole;
