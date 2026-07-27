const authService = require("../services/authService");

const getMe = async (req, res, next) => {
  try {
      const user = await authService.getUser(req.user.uid);

          res.json({
                success: true,
                      user,
                          });
                            } catch (error) {
                                next(error);
                                  }
                                  };

                                  module.exports = {
                                    getMe,
                                    };