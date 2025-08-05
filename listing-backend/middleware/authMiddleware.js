const jwt = require("jsonwebtoken");
const JWT_SECRET = "FVgK7RA3bW1zuwiHTMKAfdkVRoonD660VB4R+yl6etQ="; // ✅ Use correct secret

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // ✅ Console log decoded payload
    console.log("✅ Authenticated user:", req.user);

    next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = authMiddleware;
