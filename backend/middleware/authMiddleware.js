const JWT = require('jsonwebtoken');

const AuthenticationMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).send({
                message: 'Auth failed: No authorization header provided',
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).send({
                message: 'Auth failed: Token not found',
            });
        }

        JWT.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: 'Auth failed: Invalid token',
                });
            }

            // Add user details to the request for further use
            req.userId = decoded.userId;
            req.username = decoded.username;

            next(); // Call the next middleware or route handler
        });
    } catch (error) {
        return res.status(401).send({
            message: 'Auth failed: An unexpected error occurred',
        });
    }
};

module.exports = AuthenticationMiddleware;
