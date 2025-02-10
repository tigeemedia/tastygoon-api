const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Debug: Log the Authorization header
  console.log("Authorization Header Received:", authHeader);

  // Check if token is provided
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized: No token provided or improperly formatted header",
    });
  }

  // Extract token from the Authorization header
  const token = authHeader.split(" ")[1];
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Debug: Log decoded token
    console.log("Decoded Token:", decoded);

    req.user = decoded; // Attach user info to request object
    next();
  } catch (err) {
    // Handle invalid or expired token
    console.error("Token verification error:", err.message);
    return res.status(403).json({
      message: "Forbidden: Invalid or expired token",
      error: err.message,
    });
  }
};

module.exports = authenticateToken;
