require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const { authenticate, authorize } = require("./middleware/auth");
const cors = require("cors");

const blogRoutes = require("./routes/blogs");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(express.json());
app.use(cors());

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

  app.get("/manager", authenticate, authorize(["manager"]), (req, res) => {
    res.json({ message: "Hello Manager!" });
  });

// Mount app routes
app.use(blogRoutes);
app.use(adminRoutes);

const PORT = process.env.PORT || 5111;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
