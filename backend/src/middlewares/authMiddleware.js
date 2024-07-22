const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'Testing18';

function AuthMiddleware(req, res, next) {
  let token = req.headers["authorization"];
  token = String(token).replace('Bearer ', '');
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized" });
      } else {
        return next();
      }
    });
  } else {
    return res.status(401).send({ message: "No token provided" });
  }
}

module.exports = AuthMiddleware;
