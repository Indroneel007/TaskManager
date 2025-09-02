require("dotenv").config();
const admin = require("../firebase");

// Usage: node scripts/setRole.js <uid> <role>
// Example: node scripts/setRole.js aBc123 admin
(async () => {
  try {
    const [,, uid, role] = process.argv;
    if (!uid || !role) {
      console.log("Usage: node scripts/setRole.js <uid> <role>");
      process.exit(1);
    }
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`✅ Role "${role}" set for UID: ${uid}`);
    console.log("NOTE: The user must refresh their ID token (sign out/in) to see the new role.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
