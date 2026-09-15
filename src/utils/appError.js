export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const success = (res, statusCode, message, data = null) =>
  res.status(statusCode).json({ success: true, message, data });
