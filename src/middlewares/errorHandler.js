const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.isOperational ? error.message : "Internal server error";

  if (!error.isOperational && error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (!error.isOperational && error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  if (!error.isOperational && error.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
  }

  if (!error.isOperational && error.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON request body";
  }

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({ success: false, message, data: null });
};

export default errorHandler;
