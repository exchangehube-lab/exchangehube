const express = require("express");
const authenticate = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const {
  updateReportStatus,
    deleteReport,
    } = require("../controllers/reportController");

    const router = express.Router();

    router.use(authenticate);
    router.use(requireAdmin);

    router.patch("/:reportId/status", updateReportStatus);
    router.delete("/:reportId", deleteReport);

    module.exports = router;