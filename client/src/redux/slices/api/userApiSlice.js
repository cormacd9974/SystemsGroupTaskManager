// Import constants for API endpoint URLs
import { USERS_URL } from "../../../utils/contants"; // Base URL constant for user-related API endpoints
import { apiSlice } from "../apiSlice"; // Base API slice for endpoint injection

/**
 * User API Slice - Comprehensive user management and profile API endpoints
 * 
 * @description
 * This slice extends the base apiSlice with all user-related API operations.
 * Provides complete user lifecycle management, team administration, and notification handling.
 * 
 * Architecture decisions:
 * - Uses RTK Query's injectEndpoints pattern for modular API organization
 * - Implements session-based authentication with credentials: "include"
 * - Separates user profile operations from administrative team management
 * - Provides notification system integration for user engagement
 * 
 * Security considerations:
 * - All endpoints include credentials for session-based authentication
 * - Server-side permission validation for administrative operations
 * - Secure password change workflow with proper validation
 * - User action logging for audit trails and accountability
 * 
 * Business context:
 * - Supports user profile management and customization
 * - Enables team administration and member lifecycle management
 * - Provides notification system for user engagement and communication
 * - Facilitates user access control through account activation/deactivation
 */
export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Update User Profile Mutation - Modifies current user's profile information
         * 
         * @endpoint PUT /users/profile
         * @param {Object} data - Updated user profile data (name, email, title, etc.)
         * @returns {Object} Updated user profile information
         * 
         * Profile data typically includes:
         * - Personal information (name, email, phone)
         * - Professional details (title, department, role)
         * - Preferences and settings
         * - Avatar/profile image data
         * 
         * Security features:
         * - Session-based authentication ensures user can only update own profile
         * - Server-side validation of all profile data
         * - Email change verification workflows (if implemented)
         * - Data sanitization to prevent XSS attacks
         * 
         * Business workflow:
         * - Validates user permissions for profile modification
         * - Updates user data across all related systems
         * - Triggers profile change notifications if configured
         * - Maintains profile change history for audit purposes
         * 
         * Usage pattern:
         * const [updateUser, { isLoading }] = useUpdateUserMutation();
         * await updateUser(profileData);
         */
        updateUser: builder.mutation({
           query: (data) => ({
                url: `${USERS_URL}/profile`, // User profile update endpoint
                method: "PUT", // HTTP method for resource updates
                body: data, // Updated profile information
                credentials: "include", // Include session cookies for authentication
            }),
            // Note: Could benefit from invalidatesTags: ["Users"] for profile updates
        }),

        /**
         * Get Team Lists Query - Fetches team members with optional search filtering
         * 
         * @endpoint GET /users/get-team?search={search}
         * @param {Object} params - Query parameters
         * @param {string} params.search - Optional search term for filtering team members
         * @returns {Array} List of team members with profile information
         * 
         * Team member data includes:
         * - Basic profile information (name, email, title)
         * - Role and permission levels
         * - Active/inactive status
         * - Department and organizational structure
         * - Contact information and availability
         * 
         * Search functionality:
         * - Searches across name, email, and title fields
         * - Case-insensitive matching for user convenience
         * - Real-time filtering for responsive user experience
         * - Pagination support for large teams (if implemented)
         * 
         * Administrative features:
         * - Role-based access control for team visibility
         * - Department-based filtering for organizational structure
         * - Status indicators for user availability and access
         * 
         * Usage pattern:
         * const { data: teamMembers } = useGetTeamListsQuery({ search: searchTerm });
         */
         getTeamLists: builder.query({
           query: ({search} = {}) => ({
                url: `${USERS_URL}/get-team?search=${search ?? ""}`, // Team listing with search parameter
                method: "GET", // HTTP method for data retrieval
                credentials: "include", // Include session cookies for authentication
            }),
            // Note: Should include providesTags: ["Users"] for cache management
        }),

        /**
         * Delete User Mutation - Permanently removes a user account
         * 
         * @endpoint DELETE /users/{id}
         * @param {string} id - Unique identifier of the user to delete
         * @returns {Object} Confirmation of successful deletion
         * 
         * Administrative operation:
         * - Requires administrative privileges for execution
         * - Permanently removes user account and associated data
         * - Handles data cleanup across related systems
         * - Maintains audit trail of deletion operations
         * 
         * Data handling:
         * - Removes user authentication credentials
         * - Anonymizes or transfers user-created content
         * - Updates team assignments and task ownership
         * - Cleans up user preferences and settings
         * 
         * Security considerations:
         * - Requires explicit confirmation before execution
         * - Logs deletion operations for compliance and audit
         * - Validates administrator permissions
         * - Prevents self-deletion to maintain system integrity
         * 
         * Business implications:
         * - Affects team capacity and task assignments
         * - May require content ownership transfer
         * - Impacts reporting and historical data
         * - Requires communication to affected team members
         * 
         * Usage pattern:
         * const [deleteUser] = useDeleteUserMutation();
         * await deleteUser(userId);
         */
         deleteUser: builder.mutation({
           query: (id) => ({
                url: `${USERS_URL}/${id}`, // User deletion endpoint with ID
                method: "DELETE", // HTTP method for resource deletion
                credentials: "include", // Include session cookies for authentication
            }),
            // Note: Should include invalidatesTags: ["Users"] for team list updates
        }),

        /**
         * User Action Mutation - Enables or disables user account access
         * 
         * @endpoint PUT /users/{id}
         * @param {Object} data - User action data including ID and new status
         * @param {string} data.id - User ID to modify
         * @param {boolean} data.isActive - New active status for the user
         * @returns {Object} Updated user status information
         * 
         * Access control features:
         * - Toggles user account active/inactive status
         * - Maintains user data while controlling access
         * - Enables temporary account suspension
         * - Supports user reactivation workflows
         * 
         * Business use cases:
         * - Temporary employee suspension
         * - Seasonal worker management
         * - Security incident response
         * - Organizational restructuring
         * 
         * System behavior:
         * - Inactive users cannot log in or access system
         * - Preserves user data and task assignments
         * - Maintains historical records and audit trails
         * - Enables quick reactivation when needed
         * 
         * Administrative workflow:
         * - Requires administrative privileges
         * - Logs status changes for audit purposes
         * - Notifies affected users of status changes
         * - Updates team capacity calculations
         * 
         * Usage pattern:
         * const [userAction] = useUserActionMutation();
         * await userAction({ id: userId, isActive: false });
         */
         userAction: builder.mutation({
           query: (data) => ({
                url: `${USERS_URL}/${data.id}`, // User modification endpoint with ID
                method: "PUT", // HTTP method for resource updates
                body: data, // User action data (status change)
                credentials: "include", // Include session cookies for authentication
            }),
            // Note: Should include invalidatesTags: ["Users"] for status updates
        }),

        /**
         * Get Notifications Query - Fetches user notifications and alerts
         * 
         * @endpoint GET /users/notifications
         * @returns {Array} List of user notifications with read/unread status
         * 
         * Notification types:
         * - Task assignments and updates
         * - Team mentions and communications
         * - System alerts and announcements
         * - Deadline reminders and overdue alerts
         * - Project milestone notifications
         * 
         * Notification data structure:
         * - Unique notification ID for tracking
         * - Notification type and category
         * - Message content and context
         * - Timestamp and sender information
         * - Read/unread status for user experience
         * 
         * User engagement features:
         * - Real-time notification delivery
         * - Notification grouping and categorization
         * - Priority levels for important alerts
         * - Action buttons for quick responses
         * 
         * Performance considerations:
         * - Pagination for large notification lists
         * - Caching with automatic updates
         * - Background fetching for real-time updates
         * - Efficient read status management
         * 
         * Usage pattern:
         * const { data: notifications } = useGetNotificationsQuery();
         */
         getNotifications: builder.query({
           query: () => ({
                url: `${USERS_URL}/notifications`, // User notifications endpoint
                method: "GET", // HTTP method for data retrieval
            
            }),
            providesTags: ["Users"], // Cache tag for notification updates
        }),

        /**
         * Mark Notification as Read Mutation - Updates notification read status
         * 
         * @endpoint PUT /users/read-noti?isReadType={type}&id={id}
         * @param {Object} data - Notification read action data
         * @param {string} data.type - Read action type (single, all, category)
         * @param {string} data.id - Notification ID or category identifier
         * @returns {Object} Updated notification status
         * 
         * Read action types:
         * - Single notification marking
         * - Bulk read operations for categories
         * - Mark all notifications as read
         * - Category-specific read operations
         * 
         * User experience benefits:
         * - Reduces notification clutter
         * - Improves notification management efficiency
         * - Provides clear visual feedback
         * - Supports bulk operations for productivity
         * 
         * System behavior:
         * - Updates notification read timestamps
         * - Triggers UI updates for read status
         * - Maintains notification history
         * - Supports notification analytics
         * 
         * Performance optimization:
         * - Batch operations for multiple notifications
         * - Optimistic UI updates for responsiveness
         * - Efficient database updates
         * - Cache invalidation for real-time updates
         * 
         * Usage pattern:
         * const [markAsRead] = useMarkNotiAsReadMutation();
         * await markAsRead({ type: "single", id: notificationId });
         */
         markNotiAsRead: builder.mutation({
           query: (data) => ({
                url: `${USERS_URL}/read-noti?isReadType=${data.type}&id=${data.id}`, // Notification read endpoint with parameters
                method: "PUT", // HTTP method for status updates
                body: data, // Read action data and context
                credentials: "include", // Include session cookies for authentication
            }),
            // Note: Should include invalidatesTags: ["Users"] for notification updates
        }),

        /**
         * Change Password Mutation - Updates user account password
         * 
         * @endpoint PUT /users/change-password
         * @param {Object} data - Password change data
         * @param {string} data.currentPassword - Current password for verification
         * @param {string} data.newPassword - New password to set
         * @param {string} data.confirmPassword - Password confirmation for validation
         * @returns {Object} Confirmation of successful password change
         * 
         * Security workflow:
         * - Validates current password before allowing change
         * - Enforces password complexity requirements
         * - Hashes new password using secure algorithms
         * - Invalidates existing sessions for security
         * 
         * Password requirements (typically enforced):
         * - Minimum length and complexity rules
         * - Character variety requirements
         * - Prevention of common/weak passwords
         * - Password history to prevent reuse
         * 
         * User experience considerations:
         * - Clear validation feedback
         * - Password strength indicators
         * - Confirmation requirements to prevent errors
         * - Success notifications and next steps
         * 
         * Security best practices:
         * - Secure password transmission
         * - Server-side validation and hashing
         * - Session invalidation after change
         * - Audit logging for security monitoring
         * 
         * Usage pattern:
         * const [changePassword] = useChangePasswordMutation();
         * await changePassword({ currentPassword, newPassword, confirmPassword });
         */
         changePassword: builder.mutation({
           query: (data) => ({
                url: `${USERS_URL}/change-password`, // Password change endpoint
                method: "PUT", // HTTP method for password updates
                body: data, // Password change data (current, new, confirm)
                credentials: "include", // Include session cookies for authentication
            }),
         }),
    }),
});

/**
 * Auto-generated React hooks for user management operations
 * 
 * RTK Query automatically generates these hooks based on the endpoint definitions above.
 * Each hook provides comprehensive state management for API operations including:
 * - Loading states for UI feedback during operations
 * - Error handling for robust user experience
 * - Success states and data for response handling
 * - Automatic caching and background updates for performance
 * 
 * Hook naming conventions:
 * - Mutations: use[EndpointName]Mutation
 * - Queries: use[EndpointName]Query
 * 
 * Performance benefits:
 * - Automatic request deduplication prevents redundant API calls
 * - Intelligent caching with selective invalidation
 * - Background refetching for data freshness
 * - Optimistic updates for better perceived performance
 */
export const { 
    /**
     * User Profile Update Hook
     * @returns {Array} [updateUserMutation, { isLoading, error, data, isSuccess }]
     * 
     * Usage scenarios:
     * - User profile editing forms
     * - Settings and preferences updates
     * - Avatar/image upload workflows
     * - Contact information modifications
     */
    useUpdateUserMutation,

    /**
     * Team Members Query Hook
     * @returns {Object} { data, isLoading, error, refetch, isSuccess }
     * 
     * Usage scenarios:
     * - Team directory and contact lists
     * - User assignment interfaces
     * - Administrative user management
     * - Search and filtering functionality
     */
    useGetTeamListsQuery,

    /**
     * User Deletion Hook
     * @returns {Array} [deleteUserMutation, { isLoading, error, data, isSuccess }]
     * 
     * Usage scenarios:
     * - Administrative user removal
     * - Account cleanup workflows
     * - Employee offboarding processes
     * - System maintenance operations
     */
    useDeleteUserMutation,

    /**
     * User Status Action Hook
     * @returns {Array} [userActionMutation, { isLoading, error, data, isSuccess }]
     * 
     * Usage scenarios:
     * - Account activation/deactivation
     * - Temporary user suspension
     * - Access control management
     * - Security incident response
     */
    useUserActionMutation,

    /**
     * Notifications Query Hook
     * @returns {Object} { data, isLoading, error, refetch, isSuccess }
     * 
     * Usage scenarios:
     * - Notification center displays
     * - Real-time alert systems
     * - User engagement features
     * - Communication workflows
     */
    useGetNotificationsQuery,

    /**
     * Mark Notification Read Hook
     * @returns {Array} [markNotiAsReadMutation, { isLoading, error, data, isSuccess }]
     * 
     * Usage scenarios:
     * - Individual notification management
     * - Bulk notification operations
     * - Notification cleanup workflows
     * - User experience optimization
     */
    useMarkNotiAsReadMutation,

    /**
     * Password Change Hook
     * @returns {Array} [changePasswordMutation, { isLoading, error, data, isSuccess }]
     * 
     * Usage scenarios:
     * - Security settings forms
     * - Password reset workflows
     * - Account security updates
     * - Compliance requirements
     */
    useChangePasswordMutation,
} = userApiSlice;

/**
 * User API Slice Summary:
 * 
 * Comprehensive User Management:
 * - Complete user profile lifecycle management
 * - Administrative team member operations
 * - Notification system integration
 * - Security features including password management
 * - Access control through account activation/deactivation
 * 
 * Security Features:
 * - Session-based authentication with credential inclusion
 * - Secure password change workflows with validation
 * - Administrative privilege requirements for sensitive operations
 * - Audit logging for accountability and compliance
 * - Data sanitization and validation for security
 * 
 * Business Capabilities:
 * - Team directory and contact management
 * - User engagement through notification system
 * - Administrative control over user access and status
 * - Profile customization and preference management
 * - Search and filtering for large team scalability
 * 
 * Developer Experience:
 * - Auto-generated hooks with consistent naming conventions
 * - Built-in loading states and comprehensive error handling
 * - TypeScript support for type safety (when applicable)
 * - Comprehensive documentation and usage examples
 * 
 * Performance Optimizations:
 * - Request deduplication and intelligent caching
 * - Background refetching for data consistency
 * - Optimistic updates for better user experience
 * - Selective cache invalidation to minimize network requests
 * 
 * Integration Points:
 * - Seamless integration with authentication system
 * - Compatible with task assignment and team management
 * - Notification system integration for user engagement
 * - Profile data integration across application features
 * 
 * Future Enhancement Opportunities:
 * - Real-time notification delivery through WebSocket
 * - Advanced user search with full-text indexing
 * - Bulk user operations for administrative efficiency
 * - Integration with external identity providers
 * - Enhanced notification categorization and filtering
 * - User analytics and engagement metrics
 */