const express = require("express");
const authenticate = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const {
  updateUserStatus,
    deleteUser,
    } = require("../controllers/adminController");

    const router = express.Router();

    router.use(authenticate);
    router.use(requireAdmin);

    router.patch("/users/:userId/status", updateUserStatus);
    router.delete("/users/:userId", deleteUser);

    module.exports = router;