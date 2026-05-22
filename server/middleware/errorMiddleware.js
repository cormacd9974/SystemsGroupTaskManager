// Middleware for handling unmatched routes
const routeNotFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Centralized error-handling middleware
const errorHandler = (err, req, res, next) => {
    // Default to 500 unless a status code has already been set
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle invalid MongoDB ObjectId errors
    if(err.name === "CastError" && err.kind === "ObjectId") {
        statusCode=404;
        message= "Resource not found";
    }

    // Send formatted error response
    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === "production" ? null: err.stack,
    });
};

export {routeNotFound, errorHandler};