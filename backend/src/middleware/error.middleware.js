export const errorHandler = (err, req, res, next) => {
  if (err.name === "MulterError") {
    err.statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      err.message = "File is too large. Maximum size allowed is 5MB.";
    }
  }

  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
