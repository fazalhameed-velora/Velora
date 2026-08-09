const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging (server-side only)
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Determine status code
  let statusCode = err.statusCode || 500;
  let message = 'Internal Server Error';

  // Handle specific error types with safe messages
  if (err.name === 'CastError' || err.name === 'BSONTypeError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'A record with this value already exists';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Invalid input data';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication required';
  } else if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 400;
      message = 'File too large';
    } else {
      statusCode = 400;
      message = 'File upload error';
    }
  } else if (err.message) {
    // Only use the error message if it's safe (not in production)
    message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  }

  // Prevent header injection
  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
