require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const { authenticate, authorize } = require("./middlewares/auth");

const app = express();
app.use(express.json());

// connect database
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("MongoDB is connected!");
});

app.get("/me", authenticate, (req, res) => {
    res.json({
      message: "Authenticated!",
      uid: req.user.uid,
      email: req.user.email || null,
      role: req.user.role || "none",
    });
  });
  
  // Admin-only route:
  app.get("/admin", authenticate, authorize(["admin"]), (req, res) => {
    res.json({ message: "Hello Admin!" });
  });

const PORT = process.env.PORT || 5111;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
