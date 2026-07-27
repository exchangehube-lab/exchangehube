const express = require("express");
const authenticate = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const {
  updateBotStatus,
    deleteBot,
    } = require("../controllers/botController");

    const router = express.Router();

    router.use(authenticate);
    router.use(requireAdmin);

    router.patch("/:botId/status", updateBotStatus);
    router.delete("/:botId", deleteBot);

    module.exports = router;