import jwt from "jsonwebtoken";

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );

    req.user = {
      _id: decoded.id || decoded._id,
    };

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export default optionalAuth;