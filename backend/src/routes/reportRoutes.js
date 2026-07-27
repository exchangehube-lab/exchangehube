const express = require("express");
const authenticate = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const { validateId } = require("../middleware/validate");
const {
  updateReportStatus,
    deleteReport,
    } = require("../controllers/reportController");

    const router = express.Router();

    router.use(authenticate);
    router.use(requireAdmin);

    router.patch(
      "/:reportId/status",
        validateId("reportId"),
          updateReportStatus
          );

          router.delete(
            "/:reportId",
              validateId("reportId"),
                deleteReport
                );

                module.exports = router;