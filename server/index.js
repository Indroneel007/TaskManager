require("dotenv").config();
const express = require("express");
const connectDB = require("./db");

const app = express();
app.use(express.json());

// connect database
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("MongoDB is connected!");
});

const PORT = process.env.PORT || 5111;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
