const express = require("express");
const admin = require("../firebase");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes here are admin-only
router.use(authenticate, authorize(["admin"]));

// POST /admin/users - create a Firebase user
// body: { email, password, displayName?, role?("admin"|"manager"|"member") }
router.post("/admin/users", async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const userRecord = await admin.auth().createUser({ email, password, displayName });

    if (role) {
      await admin.auth().setCustomUserClaims(userRecord.uid, { role });
    }

    const refreshed = await admin.auth().getUser(userRecord.uid);
    res.status(201).json({
      uid: refreshed.uid,
      email: refreshed.email,
      displayName: refreshed.displayName,
      role: refreshed.customClaims?.role || null,
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: err.message || "Failed to create user" });
  }
});

// PATCH /admin/users/:uid/role - set a user's role
// body: { role: "admin"|"manager"|"member"|null }
router.patch("/admin/users/:uid/role", async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body || {};

    // Allow clearing role by sending null
    const claims = role ? { role } : {};
    await admin.auth().setCustomUserClaims(uid, claims);

    const refreshed = await admin.auth().getUser(uid);
    res.json({
      uid: refreshed.uid,
      email: refreshed.email,
      role: refreshed.customClaims?.role || null,
    });
  } catch (err) {
    console.error("Set role error:", err);
    res.status(500).json({ error: err.message || "Failed to set role" });
  }
});

// DELETE /admin/users/:uid - delete a Firebase user
router.delete("/admin/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    await admin.auth().deleteUser(uid);
    res.json({ success: true, uid });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: err.message || "Failed to delete user" });
  }
});

module.exports = router;
