// middlewares/auth.js
const admin = require("../firebase");

// 1) Verify Firebase ID token from "Authorization: Bearer <token>"
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // contains uid, email, and custom claims (e.g., role)
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// 2) Role-based guard; roles like ["admin", "manager"]
const authorize = (roles = []) => (req, res, next) => {
  const role = req.user?.role;
  if (!role || !roles.includes(role)) {
    return res.status(403).json({ error: "Forbidden: insufficient rights" });
  }
  next();
};

module.exports = { authenticate, authorize };
