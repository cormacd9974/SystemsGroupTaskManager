// Import the base API slice for endpoint injection
import { apiSlice } from "../apiSlice";

/**
 * Authentication API Slice - Handles all authentication-related API operations
 * 
 * @description
 * This slice extends the base apiSlice with authentication-specific endpoints.
 * Uses RTK Query's injectEndpoints pattern for modular API organization.
 * 
 * Architecture decisions:
 * - Extends base apiSlice rather than creating separate slice for consistency
 * - Uses mutation endpoints for all auth operations (login, logout, register)
 * - Includes credentials in all requests for session/cookie management
 * - Follows RESTful API conventions with appropriate HTTP methods
 * 
 * Security considerations:
 * - credentials: "include" ensures cookies/sessions are sent with requests
 * - POST methods used for all operations to avoid credential exposure in URLs
 * - Server-side session management through cookie-based authentication
 * - No client-side token storage reduces XSS attack surface
 * 
 * Integration patterns:
 * - Auto-generated hooks follow useXxxMutation naming convention
 * - Mutations provide loading states, error handling, and optimistic updates
 * - Seamless integration with Redux store and component state management
 */
export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Login Mutation - Authenticates user credentials and establishes session
         * 
         * @endpoint POST /user/login
         * @param {Object} data - User credentials (email, password)
         * @returns {Object} User data and authentication tokens/session info
         * 
         * Security features:
         * - Credentials included for session cookie establishment
         * - POST method prevents credential exposure in browser history
         * - Server validates credentials and creates secure session
         * 
         * Usage pattern:
         * const [login, { isLoading, error }] = useLoginMutation();
         * const handleLogin = async (credentials) => {
         *   try {
         *     const result = await login(credentials).unwrap();
         *     // Handle successful login
         *   } catch (err) {
         *     // Handle login error
         *   }
         * };
         */
        login: builder.mutation({
            query: (data) => ({
                url: "/user/login", // Authentication endpoint
                method: "POST", // Secure method for credential transmission
                body: data, // User credentials (email, password)
                credentials: "include", // Include cookies for session management
            }),
        }),

        /**
         * Logout Mutation - Terminates user session and clears authentication
         * 
         * @endpoint POST /user/logout
         * @returns {Object} Confirmation of successful logout
         * 
         * Security features:
         * - Server-side session invalidation
         * - Cookie clearing for complete logout
         * - POST method for secure logout operation
         * 
         * Business logic:
         * - Invalidates server-side session/tokens
         * - Clears authentication cookies
         * - Provides confirmation of successful logout
         * 
         * Usage pattern:
         * const [logout, { isLoading }] = useLogoutMutation();
         * const handleLogout = async () => {
         *   try {
         *     await logout().unwrap();
         *     // Redirect to login page or update UI state
         *   } catch (err) {
         *     // Handle logout error (rare but possible)
         *   }
         * };
         */
        logout: builder.mutation({
            query: () => ({
                url: "/user/logout", // Logout endpoint
                method: "POST", // Secure method for logout operation
                credentials: "include", // Include cookies for session identification
            }),
        }),

        /**
         * Register Mutation - Creates new user account with provided information
         * 
         * @endpoint POST /user/register
         * @param {Object} data - New user registration data (name, email, password, etc.)
         * @returns {Object} Created user data and initial authentication session
         * 
         * Business workflow:
         * - Validates user input data on server
         * - Creates new user account in database
         * - Optionally establishes initial authentication session
         * - Returns user data for immediate application use
         * 
         * Security considerations:
         * - Server-side validation of all input data
         * - Password hashing and secure storage
         * - Email verification workflows (if implemented)
         * - Rate limiting to prevent abuse
         * 
         * Usage pattern:
         * const [register, { isLoading, error }] = useRegisterMutation();
         * const handleRegister = async (userData) => {
         *   try {
         *     const result = await register(userData).unwrap();
         *     // Handle successful registration
         *   } catch (err) {
         *     // Handle registration errors (validation, conflicts, etc.)
         *   }
         * };
         */
        register: builder.mutation({
            query: (data) => ({
                url: "/user/register", // User registration endpoint
                method: "POST", // Secure method for user data transmission
                body: data, // New user registration information
                credentials: "include", // Include cookies for potential immediate session
            }),
        }),
    }),
});

/**
 * Auto-generated React hooks for authentication operations
 * 
 * RTK Query automatically generates these hooks based on the endpoint definitions above.
 * Each hook provides:
 * - Mutation function for triggering the API call
 * - Loading state (isLoading) for UI feedback
 * - Error state for error handling
 * - Success state and data for handling responses
 * 
 * Hook naming convention: use[EndpointName]Mutation
 * 
 * Benefits of auto-generated hooks:
 * - Consistent API across all endpoints
 * - Built-in loading and error states
 * - Automatic request deduplication
 * - Optimistic updates and cache management
 * - TypeScript support (when using TypeScript)
 */
export const {
    /**
     * Login mutation hook
     * @returns {Array} [loginMutation, { isLoading, error, data, isSuccess }]
     * 
     * Usage in components:
     * - Trigger login with loginMutation(credentials)
     * - Show loading spinner with isLoading
     * - Display errors with error state
     * - Handle success with isSuccess and data
     */
    useLoginMutation,

    /**
     * Logout mutation hook
     * @returns {Array} [logoutMutation, { isLoading, error, isSuccess }]
     * 
     * Usage in components:
     * - Trigger logout with logoutMutation()
     * - Show loading state during logout process
     * - Handle any logout errors
     * - Confirm successful logout
     */
    useLogoutMutation,

    /**
     * Registration mutation hook
     * @returns {Array} [registerMutation, { isLoading, error, data, isSuccess }]
     * 
     * Usage in components:
     * - Trigger registration with registerMutation(userData)
     * - Show loading during account creation
     * - Display validation or conflict errors
     * - Handle successful account creation
     */
    useRegisterMutation,
} = authApiSlice;

/**
 * API Slice Summary:
 * 
 * Purpose:
 * - Centralizes all authentication-related API operations
 * - Provides consistent interface for login, logout, and registration
 * - Integrates seamlessly with Redux store and React components
 * 
 * Security Features:
 * - Cookie-based session management with credentials: "include"
 * - POST methods for all operations to prevent credential exposure
 * - Server-side session validation and management
 * - Secure logout with session invalidation
 * 
 * Developer Experience:
 * - Auto-generated hooks with consistent naming convention
 * - Built-in loading states for UI feedback
 * - Comprehensive error handling capabilities
 * - TypeScript support for type safety (when applicable)
 * 
 * Integration Points:
 * - Extends base apiSlice for consistent caching and middleware
 * - Works with Redux auth slice for state management
 * - Integrates with React Router for navigation after auth operations
 * - Compatible with toast notifications for user feedback
 * 
 * Performance Considerations:
 * - RTK Query caching reduces redundant requests
 * - Automatic request deduplication
 * - Optimistic updates for better perceived performance
 * - Efficient re-rendering through selective subscriptions
 * 
 * Future Enhancements:
 * - Password reset functionality
 * - Email verification endpoints
 * - Two-factor authentication support
 * - Social login integrations
 * - Refresh token management (if moving away from cookies)
 */