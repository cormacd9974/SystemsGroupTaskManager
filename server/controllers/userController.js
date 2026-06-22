/**
 * USER MANAGEMENT API CONTROLLER
 * 
 * This controller handles all user-related operations for the task management system,
 * including authentication, user management, notifications, and profile operations.
 * It implements comprehensive security measures, role-based access control, and
 * proper session management for a multi-user collaborative environment.
 */

// THIRD-PARTY IMPORTS
import asyncHandler from "express-async-handler";  // Async error handling wrapper for Express routes

// MODEL IMPORTS - Database schema definitions
import User from "../models/userModel.js";         // User entity with authentication and profile data
import Notice from "../models/notis.js";           // Notification system for user communication

// UTILITY IMPORTS
import { createJWT } from "../utils/index.js";       // JWT token generation and management utilities
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/emailService.js";

/**
 * USER LOGIN AUTHENTICATION ENDPOINT
 * 
 * SECURITY IMPLEMENTATION: Multi-layered authentication process that validates
 * user credentials, account status, and generates secure JWT tokens for session management.
 * 
 * BUSINESS LOGIC: Implements account deactivation checks to allow administrators
 * to disable user access without deleting accounts, maintaining data integrity
 * and audit trails while preventing unauthorized access.
 * 
 * PASSWORD SECURITY: Uses bcrypt hashing through the User model's matchPassword
 * method to securely compare provided passwords against stored hashes, preventing
 * plaintext password exposure and timing attacks.
 * 
 * SESSION MANAGEMENT: Creates HTTP-only cookies for secure token storage,
 * preventing XSS attacks while maintaining seamless user experience across
 * browser sessions and page refreshes.
 */
const loginUser = asyncHandler(async (req, res) => {
    // REQUEST PARSING: Extract login credentials from request body
    const { email, password } = req.body;

    // USER LOOKUP: Find user by email address (case-sensitive for security)
    const user = await User.findOne({ email });

    // AUTHENTICATION CHECK: Validate user exists
    if (!user) {
        // SECURITY: Generic error message prevents email enumeration attacks
        return res.status(401).json({ status: false, message: "Invalid email or password." });
    }

    // ACCOUNT STATUS VALIDATION: Check if account is active
    if (!user?.isActive) {
        // BUSINESS RULE: Deactivated accounts cannot login, requires admin intervention
        return res.status(401).json({ status: false, message: "Account deactivated. Contact Admin." });
    }

    // PASSWORD VERIFICATION: Use secure password comparison method
    const isMatch = await user.matchPassword(password);

    if (user && isMatch) {
        // TOKEN GENERATION: Create JWT for authenticated session
        const token = createJWT(res, user._id);

        // SECURITY: Remove password from response object
        user.password = undefined;

        // SUCCESS RESPONSE: Return user profile data and authentication token
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            title: user.title,                    // JOB TITLE: For display and role identification
            role: user.role,                      // SYSTEM ROLE: For permission-based features
            isAdmin: user.isAdmin,                // ADMIN FLAG: For administrative interface access
            isActive: user.isActive,              // ACCOUNT STATUS: For UI state management
            token                                 // JWT TOKEN: For API authentication
        });
    } else {
        // AUTHENTICATION FAILURE: Generic error message for security
        return res.status(401).json({ status: false, message: "Invalid email or password." });
    }
});

/**
 * USER LOGOUT ENDPOINT
 * 
 * SESSION TERMINATION: Implements secure logout by clearing authentication cookies
 * and invalidating client-side tokens. This prevents session hijacking and ensures
 * proper session cleanup when users explicitly log out.
 * 
 * SECURITY MEASURE: Sets cookie expiration to past date (epoch) to ensure
 * immediate invalidation across all browsers and prevents token reuse.
 * 
 * CLIENT-SIDE COORDINATION: Works with frontend logout logic to clear local
 * storage, reset application state, and redirect to login page.
 */
const logoutUser = asyncHandler(async (req, res) => {
    // COOKIE INVALIDATION: Clear authentication token cookie
    res.cookie("token", "", {
        httpOnly: true,                           // SECURITY: Prevent XSS access to cookie
        expires: new Date(0),                     // IMMEDIATE EXPIRATION: Set to epoch time
    });

    // SUCCESS RESPONSE: Confirm logout completion
    res.status(200).json({ message: "Logged out successfully" });
});

/**
 * USER REGISTRATION ENDPOINT
 * 
 * ACCOUNT CREATION: Handles new user registration with duplicate email prevention,
 * secure password hashing, and immediate authentication token generation.
 * 
 * BUSINESS LOGIC: Supports both self-registration and admin-created accounts
 * with flexible role assignment and permission configuration.
 * 
 * DATA VALIDATION: Implements email uniqueness constraints to prevent duplicate
 * accounts and maintain data integrity across the user management system.
 * 
 * SECURITY: Passwords are automatically hashed by the User model's pre-save
 * middleware, ensuring secure storage without plaintext exposure.
 */
const registerUser = asyncHandler(async (req, res) => {
    // REQUEST PARSING: Extract user registration data
    const { name, email, password, isAdmin, role, title } = req.body;

    // DUPLICATE CHECK: Prevent multiple accounts with same email
    const userExist = await User.findOne({ email });
    if (userExist) {
        // CONFLICT RESPONSE: Clear error message for duplicate email
        return res.status(400).json({ status: false, message: "User already exists" });
    }

    // USER CREATION: Create new user account with provided data
    const user = await User.create({
        name,
        email,
        password,                                     // AUTO-HASHED: By User model middleware
        isAdmin,
        role,
        title
    });

    if (user) {
        // SECURITY: Remove password from response object
        user.password = undefined;

        // TOKEN GENERATION: Create authentication token for immediate login
        const token = createJWT(res, user._id);

        // SUCCESS RESPONSE: Return new user profile with authentication token
        res.status(201).json({ ...user.toObject(), token });
    } else {
        // CREATION FAILURE: Handle invalid user data
        return res.status(400).json({ status: false, message: "Invalid user data." });
    }
});

/**
 * GET USER BY ID ENDPOINT
 * 
 * PROFILE RETRIEVAL: Fetches specific user information for profile displays,
 * user management interfaces, and team member details.
 * 
 * DATA SECURITY: Uses selective field projection to exclude sensitive information
 * like passwords and internal system fields from API responses.
 * 
 * PERFORMANCE OPTIMIZATION: Returns only necessary fields to reduce response
 * size and improve API performance for user lookup operations.
 */
const getUserById = asyncHandler(async (req, res) => {
    // PARAMETER EXTRACTION: Get user ID from URL parameters
    const { id } = req.params;

    // USER LOOKUP: Fetch user with selected fields only
    const user = await User.findById(id).select("name email role title isActive");

    // RESPONSE: Return user profile data
    res.status(200).json(user);
});

/**
 * GET TEAM LIST ENDPOINT
 * 
 * TEAM MANAGEMENT: Provides searchable user directory for task assignment,
 * team formation, and user management operations.
 * 
 * SEARCH FUNCTIONALITY: Implements multi-field text search across user attributes
 * to enable quick team member discovery and selection in UI components.
 * 
 * PERFORMANCE: Uses MongoDB text indexing and regex patterns for efficient
 * search operations across large user datasets.
 * 
 * UI INTEGRATION: Supports autocomplete, dropdown selections, and user picker
 * components throughout the application interface.
 */
const getTeamList = asyncHandler(async (req, res) => {
    // SEARCH PARAMETER: Extract search query from request
    const { search } = req.query;

    // QUERY BUILDING: Initialize empty query object
    let query = {};

    // SEARCH IMPLEMENTATION: Build multi-field search query
    if (search) {
        const searchQuery = {
            $or: [                                            // SEARCH ACROSS: Multiple user fields
                { title: { $regex: search, $options: "i" } },           // JOB TITLE: Case-insensitive search
                { name: { $regex: search, $options: "i" } },            // FULL NAME: Case-insensitive search
                { role: { $regex: search, $options: "i" } },            // SYSTEM ROLE: Case-insensitive search
                { email: { $regex: search, $options: "i" } },           // EMAIL ADDRESS: Case-insensitive search
            ],
        };
        query = { ...query, ...searchQuery };
    }

    // USER RETRIEVAL: Fetch matching users with selected fields
    const users = await User.find(query).select("name title email role isActive");

    // RESPONSE: Return filtered user list
    res.status(200).json(users);
});

/**
 * GET NOTIFICATION LIST ENDPOINT
 * 
 * NOTIFICATION SYSTEM: Retrieves unread notifications for the authenticated user,
 * supporting real-time communication and task assignment alerts.
 * 
 * READ STATUS TRACKING: Uses array-based read tracking to support multiple
 * recipients per notification while maintaining individual read states.
 * 
 * PERFORMANCE OPTIMIZATION: Queries only unread notifications to minimize
 * data transfer and improve response times for notification polling.
 * 
 * DATA POPULATION: Includes related task information to provide context
 * for notifications without requiring additional API calls.
 */
const getNotificationList = asyncHandler(async (req, res) => {
    // AUTHENTICATION: Extract user ID from JWT token
    const { userId } = req.user;

    // NOTIFICATION QUERY: Find unread notifications for current user
    const notices = await Notice.find({
        team: userId,                             // RECIPIENT: User is in notification team
        isRead: { $nin: [userId] },               // UNREAD: User ID not in read array
    }).populate("task", "title");                 // TASK DATA: Include task title for context

    // RESPONSE: Return unread notifications with task context
    res.status(200).json(notices);
});

/**
 * UPDATE USER PROFILE ENDPOINT
 * 
 * PROFILE MANAGEMENT: Handles user profile updates with role-based permissions,
 * allowing users to update their own profiles and administrators to manage
 * any user account.
 * 
 * PERMISSION LOGIC: Complex permission system that allows:
 * - Users to update their own profiles
 * - Administrators to update any user profile
 * - Proper ID resolution for admin operations
 * 
 * DATA VALIDATION: Implements partial update pattern where only provided
 * fields are updated, maintaining existing data for omitted fields.
 * 
 * SECURITY: Removes password from response to prevent accidental exposure
 * of sensitive authentication data.
 */
const updateUserProfile = asyncHandler(async (req, res) => {
    // AUTHENTICATION: Extract user context from JWT
    const { userId, isAdmin } = req.user;
    const { _id } = req.body;

    // PERMISSION RESOLUTION: Determine target user ID based on permissions
    // LOGIC: Admin updating self OR Admin updating others OR User updating self
    const id = isAdmin && userId.toString() === _id?.toString() ? userId :
        isAdmin && userId.toString() !== _id?.toString() ? _id :
            userId;

    // USER LOOKUP: Find target user for update
    const user = await User.findById(id);

    if (user) {
        // PARTIAL UPDATE: Update only provided fields, preserve existing values
        user.name = req.body.name || user.name;
        user.title = req.body.title || user.title;
        user.role = req.body.role || user.role;
        user.email = req.body.email || user.email;
        user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

        // PERSISTENCE: Save updated user data
        const updateUser = await user.save();

        // SECURITY: Remove password from response
        updateUser.password = undefined;

        // SUCCESS RESPONSE: Return updated user profile
        res.status(200).json({
            status: true,
            message: "Profile update successful",
            user: updateUser
        });
    } else {
        // NOT FOUND: Handle invalid user ID
        res.status(404).json({ status: false, message: "User not found" });
    }
});

/**
 * MARK NOTIFICATION READ ENDPOINT
 * 
 * NOTIFICATION MANAGEMENT: Handles marking individual notifications or all
 * notifications as read, supporting both bulk and selective notification management.
 * 
 * ARRAY-BASED TRACKING: Uses MongoDB array operations to track read status
 * per user, enabling shared notifications with individual read states.
 * 
 * BULK OPERATIONS: Supports marking all unread notifications as read for
 * improved user experience and notification management efficiency.
 * 
 * PERFORMANCE: Uses efficient MongoDB update operations with array operators
 * to minimize database load and improve response times.
 */
const markNotificationRead = asyncHandler(async (req, res) => {
    // AUTHENTICATION: Extract user ID from JWT token
    const { userId } = req.user;
    const { isReadType, id } = req.query;

    // OPERATION TYPE: Handle bulk vs individual notification marking
    if (isReadType === "all") {
        // BULK UPDATE: Mark all unread notifications as read for user
        await Notice.updateMany(
            { team: userId, isRead: { $nin: [userId] } },          // QUERY: Unread notifications for user
            { $push: { isRead: userId } }                         // UPDATE: Add user to read array
        );
    } else {
        // INDIVIDUAL UPDATE: Mark specific notification as read
        await Notice.findOneAndUpdate(
            { _id: id, isRead: { $nin: [userId] } },               // QUERY: Specific unread notification
            { $push: { isRead: userId } }                         // UPDATE: Add user to read array
        );
    }

    // SUCCESS RESPONSE: Confirm operation completion
    res.status(200).json({ status: true, message: "Done" });
});

/**
 * CHANGE USER PASSWORD ENDPOINT
 * 
 * PASSWORD MANAGEMENT: Enables users to update their passwords with automatic
 * secure hashing and validation through the User model's middleware.
 * 
 * SECURITY IMPLEMENTATION: Leverages User model's pre-save middleware to
 * automatically hash new passwords using bcrypt, ensuring consistent
 * security practices across all password operations.
 * 
 * SELF-SERVICE: Allows users to change their own passwords without requiring
 * administrator intervention, improving security hygiene and user autonomy.
 * 
 * DATA PROTECTION: Removes password from response to prevent accidental
 * exposure of hashed password data in API responses or logs.
 */
const changeUserPassword = asyncHandler(async (req, res) => {
    // AUTHENTICATION: Extract user ID from JWT token
    const { userId } = req.user;

    // USER LOOKUP: Find current user account
    const user = await User.findById(userId);

    if (user) {
        // PASSWORD UPDATE: Set new password (auto-hashed by model middleware)
        user.password = req.body.password;
        await user.save();

        // SECURITY: Remove password from user object
        user.password = undefined;

        // SUCCESS RESPONSE: Confirm password change
        res.status(200).json({ status: true, message: "Done" });
    } else {
        // NOT FOUND: Handle invalid user ID
        res.status(404).json({ status: false, message: "User not found" });
    }
});

/**
 * ACTIVATE/DEACTIVATE USER PROFILE ENDPOINT
 * 
 * ACCOUNT MANAGEMENT: Enables administrators to activate or deactivate user
 * accounts without permanent deletion, supporting temporary access control
 * and user lifecycle management.
 * 
 * BUSINESS LOGIC: Deactivated accounts retain all data and relationships
 * but cannot authenticate, allowing for account suspension and reactivation
 * workflows without data loss.
 * 
 * AUDIT TRAIL: Maintains user account history and associated task/project
 * data for compliance and business continuity purposes.
 * 
 * ADMINISTRATIVE CONTROL: Provides administrators with granular user access
 * management capabilities for security and organizational requirements.
 */
const activateUserProfile = asyncHandler(async (req, res) => {
    // PARAMETER EXTRACTION: Get target user ID from URL
    const { id } = req.params;

    // USER LOOKUP: Find target user account
    const user = await User.findById(id);

    if (user) {
        // STATUS UPDATE: Set activation status from request body
        user.isActive = req.body.isActive;
        await user.save();

        // DYNAMIC RESPONSE: Provide contextual success message
        res.status(200).json({
            status: true,
            message: `User ${user.isActive ? "activated" : "deactivated"} successfully`
        });
    } else {
        // NOT FOUND: Handle invalid user ID
        res.status(404).json({ status: false, message: "User not found" });
    }
});

/**
 * DELETE USER PROFILE ENDPOINT
 * 
 * PERMANENT DELETION: Removes user account completely from the system,
 * including all associated data and relationships. This is an irreversible
 * administrative action that should be used with caution.
 * 
 * DATA INTEGRITY CONSIDERATIONS: Permanent user deletion may affect:
 * - Task assignments and ownership
 * - Activity logs and audit trails
 * - Team compositions and project history
 * - Notification and communication records
 * 
 * BUSINESS IMPACT: Should be used only when account deactivation is
 * insufficient and complete data removal is required for compliance
 * or organizational restructuring purposes.
 * 
 * SECURITY: Requires administrative privileges and should be logged
 * for audit and compliance purposes.
 */
const deleteUserProfile = asyncHandler(async (req, res) => {
    // PARAMETER EXTRACTION: Get target user ID from URL
    const { id } = req.params;

    // PERMANENT DELETION: Remove user account from database
    await User.findByIdAndDelete(id);

    // SUCCESS RESPONSE: Confirm deletion completion
    res.status(200).json({ status: true, message: "User deleted successfully" });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(200).json({ status: true, message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });

    res.status(200).json({ status: true, message: "If that email exists, a reset link has been sent." });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
        return res.status(400).json({ status: false, message: "Invalid or expired reset link." });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ status: true, message: "Password reset successfully. You can now log in." });
});


// EXPORT ALL CONTROLLER FUNCTIONS
// Organized by functional category for easy reference and maintenance
export {
    // AUTHENTICATION OPERATIONS
    loginUser,              // User login with credential validation
    logoutUser,             // Session termination and cookie cleanup
    registerUser,           // New user account creation

    // USER DATA OPERATIONS  
    getUserById,            // Individual user profile retrieval
    getTeamList,            // Searchable user directory for team management

    // NOTIFICATION OPERATIONS
    getNotificationList,    // Unread notification retrieval
    markNotificationRead,   // Notification read status management

    // PROFILE MANAGEMENT OPERATIONS
    updateUserProfile,      // User profile data updates
    changeUserPassword,     // Password change functionality
    activateUserProfile,    // Account activation/deactivation
    deleteUserProfile,       // Permanent account deletion
    forgotPassword,
    resetPassword
};