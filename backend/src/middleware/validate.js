const validateId = (paramName) => {
      return (req, res, next) => {
          const id = req.params[paramName];

              if (!id || typeof id !== "string" || id.trim().length === 0) {
                    return res.status(400).json({
                            success: false,
                                    message: `Invalid ${paramName}`,
                                          });
                                              }

                                                  next();
                                                    };
                                                    };

                                                    module.exports = {
                                                      validateId,
                                                      };
