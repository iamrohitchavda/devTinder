export const success = (res, statusCode, message, data = null) =>
  res.status(statusCode).json({ success: true, message, data });

export const failure = (res, statusCode, message) =>
  res.status(statusCode).json({ success: false, message, data: null });
