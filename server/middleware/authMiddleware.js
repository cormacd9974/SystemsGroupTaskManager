/**
 * AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 * 
 * This module provides security middleware for the task management API,
 * implementing JWT-based authentication and role-based authorization.
 * It ensures that only authenticated users can access protected routes
 * and that administrative functions are restricted to admin users.
 */

// THIRD-PARTY IMPORTS
import jwt from "jsonwebtoken";                    // JWT token verification and decoding
import User from "../models/userModel.js";         // User model for database lookups and validation

/**
 * ROUTE PROTECTION MIDDLEWARE
 * 
 * SECURITY IMPLEMENTATION: Validates JWT tokens and attaches authenticated user
 * context to requests. This middleware forms the foundation of the application's
 * security model by ensuring only valid, authenticated users can access protected resources.
 * 
 * TOKEN EXTRACTION STRATEGY: Supports Bearer token authentication via Authorization
 * header, following OAuth 2.0 and REST API security best practices for stateless
 * authentication in distributed systems.
 * 
 * USER CONTEXT INJECTION: Enriches request objects with user information needed
 * for authorization decisions, audit logging, and business logic throughout
 * the application without requiring additional database lookups.
 * 
 * ERROR HANDLING: Implements comprehensive error handling for various failure
 * scenarios including missing tokens, invalid signatures, expired tokens,
 * and database connectivity issues.
 */
const protectRoute = async(req, res, next) => {
    try{
        let token;

        // TOKEN EXTRACTION: Parse Bearer token from Authorization header
        // STANDARD FORMAT: "Bearer <jwt-token>" following RFC 6750 specification
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            // PARSING: Extract token portion after "Bearer " prefix
            token = req.headers.authorization.split(" ")[1];
        }

        // TOKEN VALIDATION AND USER CONTEXT SETUP
        if(token) {
            // JWT VERIFICATION: Validate token signature and expiration
            // SECURITY: Uses environment variable for secret to prevent hardcoding
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // USER LOOKUP: Fetch current user data for authorization context
            // PERFORMANCE: Select only necessary fields to minimize database load
            const user = await User.findById(decoded.userId).select("isAdmin email");
            if(!user) {
                return res.status(401).json({ status: false, message: "Not authorised. User not found."});
            }
            
            // REQUEST ENRICHMENT: Attach user context for downstream middleware and controllers
            // DESIGN: Provides consistent user data structure across all protected routes
            req.user = {
                email: user.email,                    // USER IDENTIFICATION: For logging and display
                isAdmin: user.isAdmin,                // AUTHORIZATION: Admin privilege flag
                userId: decoded.userId                // PRIMARY KEY: For database operations and ownership checks
            };
            
            // MIDDLEWARE CHAIN: Continue to next middleware or route handler
            next();
        } else {
            // AUTHENTICATION FAILURE: No token provided
            // SECURITY: Generic error message prevents information disclosure
            return res.status(401).json({
                status: false, 
                message: "Not authorised. Try again."
            });
        }
    } catch (error) {
        // ERROR LOGGING: Log authentication errors for security monitoring
        // PRODUCTION: Should use structured logging for security event tracking
        console.error(error);
        
        // AUTHENTICATION FAILURE: Handle various JWT and database errors
        // SECURITY SCENARIOS COVERED:
        // - Invalid JWT signature (tampered tokens)
        // - Expired tokens (session timeout)
        // - Malformed tokens (parsing errors)
        // - Database connectivity issues (user lookup failures)
        // - User account deletion (valid token, missing user)
        return res.status(401).json({
            status: false, 
            message: "Not authorised. Try again."
        });
    }
};

/**
 * ADMIN AUTHORIZATION MIDDLEWARE
 * 
 * ROLE-BASED ACCESS CONTROL: Implements administrative privilege checking
 * to restrict sensitive operations to authorized personnel only. This middleware
 * should be used after protectRoute to ensure user context is available.
 * 
 * SECURITY PRINCIPLE: Follows principle of least privilege by explicitly
 * checking admin status rather than assuming elevated permissions based
 * on other factors like user ID or email domain.
 * 
 * MIDDLEWARE CHAINING: Designed to work in conjunction with protectRoute
 * middleware, relying on the user context established by authentication
 * to make authorization decisions.
 * 
 * ADMINISTRATIVE OPERATIONS: Protects endpoints for:
 * - User management (create, update, delete users)
 * - System configuration and settings
 * - Bulk operations and data management
 * - Analytics and reporting with sensitive data
 * - Administrative dashboard features
 * 
 * USAGE PATTERN:
 * app.get('/admin/users', protectRoute, isAdminRoute, getUserList);
 */
const isAdminRoute = (req, res, next) => {
    // AUTHORIZATION CHECK: Verify user context exists and has admin privileges
    // DEPENDENCY: Requires protectRoute middleware to have run first
    if(req.user && req.user.isAdmin) {
        // AUTHORIZATION SUCCESS: User has admin privileges, continue processing
        next();
    } else {
        // AUTHORIZATION FAILURE: User lacks admin privileges
        // SECURITY SCENARIOS:
        // - Regular user attempting admin operation
        // - Missing user context (middleware order issue)
        // - Deactivated admin account
        // - Role change since token issuance
        return res.status(401).json({
            status: false, 
            message: "Not authorised. Try again."
        });
    }
};

// MIDDLEWARE EXPORTS
// Organized for common usage patterns and clear dependency relationships
export { 
    isAdminRoute,           // AUTHORIZATION: Admin-only route protection
    protectRoute            // AUTHENTICATION: General route protection with user context
};

/**
 * SECURITY CONSIDERATIONS & BEST PRACTICES:
 * 
 * 1. TOKEN SECURITY:
 *    - JWT secrets should be cryptographically strong and rotated regularly
 *    - Consider implementing token blacklisting for logout functionality
 *    - Use short expiration times with refresh token patterns for enhanced security
 * 
 * 2. ERROR HANDLING:
 *    - Generic error messages prevent information disclosure to attackers
 *    - Detailed errors should be logged server-side for debugging and monitoring
 *    - Consider rate limiting to prevent brute force attacks on protected endpoints
 * 
 * 3. PERFORMANCE OPTIMIZATION:
 *    - User lookups could be cached to reduce database load
 *    - Consider including more user data in JWT payload to reduce database queries
 *    - Implement connection pooling and query optimization for user lookups
 * 
 * 4. MONITORING & AUDITING:
 *    - Log all authentication failures for security monitoring
 *    - Track admin privilege usage for compliance and audit purposes
 *    - Implement alerting for suspicious authentication patterns
 * 
 * 5. FUTURE ENHANCEMENTS:
 *    - Multi-factor authentication support
 *    - Role-based permissions beyond simple admin/user distinction
 *    - Session management with concurrent login limits
 *    - API key authentication for service-to-service communication
 */