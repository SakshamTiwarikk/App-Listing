const jwt = require("jsonwebtoken");
const JWT_SECRET = "FVgK7RA3bW1zuwiHTMKAfdkVRoonD660VB4R+yl6etQ="; // Should be process.env.JWT_SECRET

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Use process.env.JWT_SECRET
    req.user = {
      id: decoded.id,
      company_id: decoded.companyId, // Map companyId from token to company_id
      email: decoded.email,
      userType: decoded.userType,
    };

    console.log(
      "✅ Authenticated user payload:",
      JSON.stringify(req.user, null, 2)
    );
    next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error.message);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = authMiddleware;
