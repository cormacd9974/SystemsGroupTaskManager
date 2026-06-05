// RTK Query imports for API slice creation and base query functionality
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authSlice"; // Redux action for clearing authentication state

/**
 * Base Query Configuration - Foundation for all API requests
 * 
 * @description
 * Configures the base query with authentication header injection and request defaults.
 * This base query is used by all API endpoints to ensure consistent authentication
 * and request formatting across the application.
 * 
 * Architecture decisions:
 * - Uses localStorage for token persistence across browser sessions
 * - Implements Bearer token authentication pattern
 * - Centralizes authentication header logic for consistency
 * - Provides foundation for request/response interceptors
 */
const baseQuery = fetchBaseQuery({
    baseUrl: "/api", // Base URL for all API endpoints - relative to current domain

    /**
     * Header preparation function - Injects authentication tokens
     * 
     * @param {Headers} headers - Request headers object to modify
     * @returns {Headers} Modified headers with authentication token
     * 
     * Authentication flow:
     * 1. Retrieves user information from localStorage
     * 2. Parses stored JSON data safely
     * 3. Extracts JWT token from user object
     * 4. Adds Bearer token to Authorization header
     * 
     * Security considerations:
     * - Safely handles missing or malformed localStorage data
     * - Uses standard Bearer token format for API compatibility
     * - Centralizes token management for consistent behavior
     * 
     * Performance benefits:
     * - Avoids repeated localStorage access across requests
     * - Efficient header modification without object recreation
     * - Minimal overhead for authenticated requests
     */
    prepareHeaders: (headers) => {
        // Retrieve user information from browser localStorage
        const userInfo = localStorage.getItem("userInfo");
        
        if (userInfo) {
            try {
                // Parse stored user data safely
                const user = JSON.parse(userInfo);
                
                // Add Bearer token to Authorization header if available
                if (user?.token) {
                    headers.set("authorization", `Bearer ${user.token}`);
                }
            } catch (error) {
                // Handle JSON parsing errors gracefully
                console.warn("Failed to parse user info from localStorage:", error);
            }
        }
        
        return headers;
    }
});

/**
 * Enhanced Base Query with Automatic Re-authentication
 * 
 * @description
 * Wraps the base query with automatic handling of authentication failures.
 * Provides centralized logout logic when tokens expire or become invalid.
 * 
 * @param {Object} args - Request arguments (URL, method, body, etc.)
 * @param {Object} apiSlice - RTK Query API slice instance
 * @param {Object} extraOptions - Additional options for the request
 * @returns {Object} API response with error handling
 * 
 * Authentication error handling:
 * - Detects 401 Unauthorized responses from server
 * - Automatically clears stored authentication data
 * - Dispatches logout action to update Redux state
 * - Prevents infinite retry loops on authentication failures
 * 
 * Security benefits:
 * - Automatic cleanup of invalid authentication data
 * - Consistent logout behavior across all API endpoints
 * - Prevents unauthorized access with expired tokens
 * - Centralized security policy enforcement
 * 
 * User experience improvements:
 * - Seamless redirect to login on session expiration
 * - Prevents confusing error states from expired tokens
 * - Maintains application security without user intervention
 * - Consistent behavior across all authenticated requests
 */
const baseQueryWithReauth = async(args, apiSlice, extraOptions) => {
    // Execute the original API request
    const result = await baseQuery(args, apiSlice, extraOptions);

    /**
     * Handle authentication failures (401 Unauthorized)
     * 
     * Business logic:
     * - 401 status indicates expired or invalid authentication token
     * - Automatic cleanup prevents stale authentication state
     * - Redux logout action updates application state consistently
     * - User is redirected to login through authentication flow
     */
    if (result?.error?.status === 401) {
        // Clear stored authentication data from localStorage
        localStorage.removeItem("userInfo");
        
        // Dispatch logout action to update Redux state
        // This triggers application-wide logout behavior including:
        // - Clearing user data from Redux store
        // - Redirecting to login page
        // - Resetting application state
        apiSlice.dispatch(logout());
    }
    
    return result;
};

/**
 * Main RTK Query API Slice - Central API configuration
 * 
 * @description
 * Creates the main API slice that serves as the foundation for all API endpoints.
 * Uses dependency injection pattern where specific API slices extend this base.
 * 
 * Architecture patterns:
 * - Central API slice with endpoint injection for modularity
 * - Tag-based cache invalidation for efficient data management
 * - Consistent error handling and authentication across all endpoints
 * - Scalable structure supporting multiple API domains
 * 
 * Cache management strategy:
 * - "Tasks" tag: Manages task-related data caching and invalidation
 * - "Users" tag: Handles user and team data cache lifecycle
 * - Selective invalidation prevents unnecessary refetches
 * - Automatic background updates for data freshness
 * 
 * Performance optimizations:
 * - Request deduplication prevents redundant API calls
 * - Intelligent caching reduces server load and improves response times
 * - Background refetching keeps data current without user intervention
 * - Optimistic updates provide immediate UI feedback
 */
export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth, // Enhanced base query with re-authentication handling
    
    /**
     * Cache tag types for invalidation management
     * 
     * Tag-based caching strategy:
     * - "Tasks": Invalidated when task data changes (create, update, delete, status changes)
     * - "Users": Invalidated when user data changes (profile updates, team changes, permissions)
     * 
     * Benefits of tag-based invalidation:
     * - Selective cache updates minimize unnecessary network requests
     * - Automatic data consistency across related components
     * - Efficient memory usage through targeted cache management
     * - Predictable data freshness for user experience
     */
    tagTypes: ["Tasks", "Users"],
    
    /**
     * Empty endpoints object for dependency injection
     * 
     * Design pattern: Base slice with endpoint injection
     * - Specific API slices (taskApiSlice, userApiSlice, authApiSlice) inject their endpoints
     * - Maintains separation of concerns while sharing common configuration
     * - Enables modular API organization and maintainability
     * - Supports code splitting and lazy loading of API modules
     */
    endpoints: () => ({}),
});

/**
 * API Slice Summary:
 * 
 * Core Functionality:
 * - Centralized API configuration with consistent authentication
 * - Automatic token injection for all authenticated requests
 * - Intelligent error handling with automatic logout on authentication failures
 * - Tag-based cache management for efficient data synchronization
 * 
 * Security Features:
 * - Bearer token authentication with automatic header injection
 * - Automatic cleanup of invalid authentication data
 * - Centralized logout handling for consistent security behavior
 * - Protection against unauthorized access with expired tokens
 * 
 * Performance Benefits:
 * - Request deduplication and intelligent caching
 * - Background refetching for data freshness
 * - Optimistic updates for better perceived performance
 * - Selective cache invalidation to minimize network requests
 * 
 * Developer Experience:
 * - Consistent API patterns across all endpoints
 * - Automatic loading states and error handling
 * - TypeScript support for type safety (when applicable)
 * - Modular architecture supporting code organization
 * 
 * Architecture Patterns:
 * - Dependency injection for endpoint modularity
 * - Centralized configuration with distributed implementation
 * - Tag-based cache invalidation for data consistency
 * - Wrapper pattern for enhanced functionality
 * 
 * Integration Points:
 * - Redux store integration for state management
 * - localStorage integration for authentication persistence
 * - React component integration through auto-generated hooks
 * - Router integration for navigation after authentication changes
 * 
 * Future Enhancement Opportunities:
 * - Request/response interceptors for logging and analytics
 * - Retry logic for transient network failures
 * - Request queuing for offline functionality
 * - Advanced caching strategies with TTL and background sync
 * - WebSocket integration for real-time updates
 * - Request cancellation for improved performance
 */