const { db } = require("../config/firebase");

const updateReportStatus = async (req, res, next) => {
  try {
      const { reportId } = req.params;
          const { status } = req.body;

              const allowedStatuses = ["pending", "reviewed", "resolved", "rejected"];

                  if (!allowedStatuses.includes(status)) {
                        return res.status(400).json({
                                success: false,
                                        message: "Invalid report status",
                                              });
                                                  }

                                                      await db.collection("reports").doc(reportId).update({ status });

                                                          res.json({
                                                                success: true,
                                                                      message: "Report status updated",
                                                                          });
                                                                            } catch (error) {
                                                                                next(error);
                                                                                  }
                                                                                  };

                                                                                  const deleteReport = async (req, res, next) => {
                                                                                    try {
                                                                                        const { reportId } = req.params;

                                                                                            await db.collection("reports").doc(reportId).delete();

                                                                                                res.json({
                                                                                                      success: true,
                                                                                                            message: "Report deleted",
                                                                                                                });
                                                                                                                  } catch (error) {
                                                                                                                      next(error);
                                                                                                                        }
                                                                                                                        };

                                                                                                                        module.exports = {
                                                                                                                          updateReportStatus,
                                                                                                                            deleteReport,
                                                                                                                            };