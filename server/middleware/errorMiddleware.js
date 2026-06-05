/**
 * ERROR HANDLING MIDDLEWARE
 * 
 * This module provides centralized error handling for the task management API,
 * implementing consistent error responses, security-conscious error disclosure,
 * and proper HTTP status code management. It ensures graceful error handling
 * across all application endpoints while maintaining security best practices.
 */

/**
 * 404 ROUTE NOT FOUND MIDDLEWARE
 * 
 * ROUTING FALLBACK: Catches requests to undefined endpoints and creates
 * standardized 404 errors. This middleware should be placed after all
 * valid route definitions to serve as a catch-all for unmatched URLs.
 * 
 * ERROR CONTEXT: Includes the requested URL in the error message to
 * provide helpful debugging information while maintaining security
 * by not exposing internal application structure.
 * 
 * MIDDLEWARE CHAIN: Creates an Error object and passes it to the next
 * middleware (errorHandler) rather than sending a response directly,
 * ensuring consistent error formatting across the application.
 * 
 * USER EXPERIENCE: Provides clear feedback when users or API clients
 * attempt to access non-existent endpoints, improving API usability
 * and debugging experience for developers.
 * 
 * SECURITY CONSIDERATION: Prevents information disclosure about
 * internal routes while still providing useful error context for
 * legitimate debugging and development purposes.
 */
const routeNotFound = (req, res, next) => {
    // ERROR CREATION: Generate descriptive error with request context
    // INFORMATION: Include original URL for debugging without exposing internals
    const error = new Error(`Route not found: ${req.originalUrl}`);
    
    // STATUS CODE: Set 404 status for proper HTTP semantics
    res.status(404);
    
    // MIDDLEWARE CHAIN: Pass error to centralized error handler
    // DESIGN: Ensures consistent error formatting and response structure
    next(error);
};

/**
 * CENTRALIZED ERROR HANDLER MIDDLEWARE
 * 
 * ERROR STANDARDIZATION: Provides consistent error response format across
 * the entire application, ensuring predictable API behavior for client
 * applications and improving developer experience.
 * 
 * SECURITY IMPLEMENTATION: Implements environment-aware error disclosure,
 * showing detailed stack traces in development while hiding sensitive
 * information in production to prevent security vulnerabilities.
 * 
 * DATABASE ERROR HANDLING: Includes specialized handling for common
 * MongoDB errors, particularly CastError for invalid ObjectIds, which
 * are frequent in REST APIs with resource ID parameters.
 * 
 * HTTP SEMANTICS: Properly manages HTTP status codes, defaulting to 500
 * for unhandled errors while preserving status codes set by previous
 * middleware or route handlers.
 * 
 * PRODUCTION SAFETY: Removes stack traces in production environments
 * to prevent information disclosure while maintaining error context
 * for legitimate debugging and user feedback.
 */
const errorHandler = (err, req, res, next) => {
    // STATUS CODE RESOLUTION: Use existing status or default to 500
    // LOGIC: Preserve status codes set by previous middleware/controllers
    // DEFAULT: 500 (Internal Server Error) for unhandled exceptions
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // ERROR MESSAGE: Extract message from Error object
    let message = err.message;

    // MONGODB ERROR HANDLING: Special case for invalid ObjectId errors
    // COMMON SCENARIO: Client requests resource with malformed ID parameter
    // BUSINESS LOGIC: Convert technical database errors to user-friendly 404s
    if(err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 404;                         // NOT FOUND: Invalid ID format
        message = "Resource not found";           // USER-FRIENDLY: Generic resource error
    }

    // STANDARDIZED ERROR RESPONSE: Consistent JSON error format
    res.status(statusCode).json({
        message,                                  // ERROR DESCRIPTION: User-facing error message
        // ENVIRONMENT-AWARE STACK TRACES:
        // DEVELOPMENT: Include full stack trace for debugging
        // PRODUCTION: Hide stack trace to prevent information disclosure
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

// MIDDLEWARE EXPORTS
// Ordered by typical usage in Express middleware chain
export {
    routeNotFound,          // 404 HANDLER: Should be registered after all routes
    errorHandler           // ERROR HANDLER: Should be the last middleware registered
};

/**
 * IMPLEMENTATION GUIDELINES & BEST PRACTICES:
 * 
 * 1. MIDDLEWARE ORDER:
 *    - Register routeNotFound after all valid route definitions
 *    - Register errorHandler as the final middleware in the chain
 *    - Ensure proper middleware sequencing for error propagation
 * 
 * 2. ERROR CLASSIFICATION:
 *    - 400-499: Client errors (bad requests, authentication, authorization)
 *    - 500-599: Server errors (application bugs, database issues, external service failures)
 *    - Use appropriate status codes for different error scenarios
 * 
 * 3. SECURITY CONSIDERATIONS:
 *    - Never expose sensitive information in error messages
 *    - Log detailed errors server-side while sending generic messages to clients
 *    - Implement rate limiting to prevent error-based information disclosure attacks
 * 
 * 4. MONITORING & LOGGING:
 *    - Log all 500-level errors for debugging and monitoring
 *    - Track error patterns for application health monitoring
 *    - Implement alerting for critical error thresholds
 * 
 * 5. CLIENT INTEGRATION:
 *    - Provide consistent error response format for client error handling
 *    - Include error codes or types for programmatic error handling
 *    - Consider internationalization for error messages in multi-language applications
 * 
 * 6. DEVELOPMENT WORKFLOW:
 *    - Use detailed stack traces in development for faster debugging
 *    - Implement error boundary components in React for graceful UI error handling
 *    - Test error scenarios thoroughly in development and staging environments
 * 
 * 7. PRODUCTION CONSIDERATIONS:
 *    - Implement comprehensive error logging and monitoring
 *    - Use error tracking services (Sentry, Rollbar) for production error management
 *    - Regularly review error logs for application improvement opportunities
 * 
 * 8. COMMON ERROR SCENARIOS TO HANDLE:
 *    - Database connection failures
 *    - Invalid request data validation errors
 *    - Authentication and authorization failures
 *    - External API integration errors
 *    - File upload and processing errors
 *    - Rate limiting and quota exceeded errors
 */