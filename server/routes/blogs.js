const express = require("express");
const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// POST /upload - create a blog (authenticated users)
router.post("/upload", authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required" });
    }

    const blog = await Blog.create({
      title,
      content,
      authorUid: req.user.uid,
      authorEmail: req.user.email || undefined,
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(500).json({ error: "Failed to create blog" });
  }
});

// GET /blogs - list all blogs
router.get("/blogs", async (_req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error("List blogs error:", err);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// GET /blogs/:id - get blog by id
router.get("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blog id" });
    }
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    console.error("Get blog error:", err);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
});

// PATCH /update/:id - update blog (admin, manager)
router.patch(
  "/update/:id",
  authenticate,
  authorize(["admin", "manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid blog id" });
      }

      const updates = {};
      if (typeof req.body.title === "string") updates.title = req.body.title;
      if (typeof req.body.content === "string") updates.content = req.body.content;
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const blog = await Blog.findByIdAndUpdate(id, updates, { new: true });
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      res.json(blog);
    } catch (err) {
      console.error("Update blog error:", err);
      res.status(500).json({ error: "Failed to update blog" });
    }
  }
);

// DELETE /delete/:id - delete blog (admin, manager)
router.delete(
  "/delete/:id",
  authenticate,
  authorize(["admin", "manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid blog id" });
      }
      const blog = await Blog.findByIdAndDelete(id);
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      res.json({ success: true, deletedId: id });
    } catch (err) {
      console.error("Delete blog error:", err);
      res.status(500).json({ error: "Failed to delete blog" });
    }
  }
);

module.exports = router;
