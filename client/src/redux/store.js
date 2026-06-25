// Redux Toolkit import for store configuration
import { configureStore } from "@reduxjs/toolkit";
// API slice import for RTK Query integration
import { apiSlice } from "./slices/apiSlice";
// Authentication slice reducer import
import authReducer from "./slices/authSlice";

/**
 * Redux Store Configuration - Central state management setup
 * 
 * @description
 * Configures the main Redux store with all necessary reducers and middleware.
 * Integrates RTK Query for API state management and authentication for user state.
 * 
 * Architecture decisions:
 * - Uses Redux Toolkit's configureStore for simplified setup
 * - Integrates RTK Query for efficient API state management
 * - Combines API and authentication state in single store
 * - Enables Redux DevTools for development debugging
 * 
 * Store structure:
 * - API slice: Manages all server state, caching, and API operations
 * - Auth slice: Handles user authentication and UI state
 * - Middleware: RTK Query middleware for API functionality
 * - DevTools: Development debugging and state inspection
 * 
 * Performance benefits:
 * - RTK Query provides intelligent caching and background updates
 * - Automatic request deduplication reduces server load
 * - Optimistic updates improve perceived performance
 * - Selective re-renders minimize unnecessary component updates
 */
const store = configureStore({
    reducer: {
        /**
         * RTK Query API Reducer Registration
         * 
         * Dynamic reducer path registration:
         * - Uses apiSlice.reducerPath for automatic path generation
         * - Typically resolves to 'api' as the state key
         * - Manages all API-related state including:
         *   - Cached query results and metadata
         *   - Loading states for active requests
         *   - Error states and retry information
         *   - Background update and invalidation tracking
         * 
         * State structure under 'api' key:
         * - queries: Cached query results with metadata
         * - mutations: Active mutation states and results
         * - provided: Cache tags for invalidation management
         * - subscriptions: Active query subscriptions
         * - config: RTK Query configuration and settings
         * 
         * Benefits of dynamic registration:
         * - Automatic integration with RTK Query ecosystem
         * - Consistent naming across different API slices
         * - Simplified store configuration and maintenance
         * - Built-in compatibility with RTK Query DevTools
         */
        [apiSlice.reducerPath]: apiSlice.reducer,

        /**
         * Authentication Reducer Registration
         * 
         * Manages user authentication and related UI state:
         * - User profile and authentication tokens
         * - Login/logout state and session management
         * - UI state like sidebar visibility
         * - Persistent authentication across browser sessions
         * 
         * State structure under 'auth' key:
         * - user: Complete user object with tokens and profile
         * - isSidebarOpen: Boolean for responsive sidebar control
         * 
         * Integration benefits:
         * - Centralized authentication state for entire application
         * - Automatic persistence through localStorage integration
         * - Clean separation from API state for maintainability
         * - Easy access through useSelector hooks in components
         */
        auth: authReducer,
    },

    /**
     * Middleware Configuration - Enhanced functionality for Redux store
     * 
     * @param {Function} getDefaultMiddleware - Redux Toolkit's default middleware factory
     * @returns {Array} Combined middleware array with defaults and RTK Query
     * 
     * Default middleware includes:
     * - redux-thunk: For async action creators and side effects
     * - Immutability check: Development-only validation of state mutations
     * - Serializability check: Development-only validation of serializable state
     * - Action creator check: Development-only validation of action creators
     * 
     * RTK Query middleware provides:
     * - Automatic cache management and invalidation
     * - Background refetching and data synchronization
     * - Request lifecycle management (pending, fulfilled, rejected)
     * - Subscription management for active queries
     * - Optimistic updates and error handling
     * 
     * Middleware benefits:
     * - Seamless API state management without manual cache handling
     * - Automatic background updates keep data fresh
     * - Built-in loading states and error handling
     * - Request deduplication prevents redundant API calls
     * - Intelligent cache invalidation based on tags
     */
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),

    /**
     * Redux DevTools Integration - Development debugging and inspection
     * 
     * Enables powerful debugging capabilities:
     * - Time-travel debugging through action history
     * - State inspection and modification
     * - Action dispatching and testing
     * - Performance monitoring and profiling
     * - RTK Query cache inspection and management
     * 
     * Development benefits:
     * - Visual state tree exploration
     * - Action replay and debugging
     * - Performance bottleneck identification
     * - API request monitoring and analysis
     * - Cache behavior visualization
     * 
     * Production considerations:
     * - Automatically disabled in production builds
     * - No performance impact on production applications
     * - Sensitive data protection through proper configuration
     * - Optional browser extension requirement for functionality
     */
    devTools: import.meta.env.DEV,
});

/**
 * Export configured store for application integration
 * 
 * Store integration points:
 * - React Provider: Wraps application root for state access
 * - Component hooks: useSelector and useDispatch for state interaction
 * - API hooks: Auto-generated RTK Query hooks for data fetching
 * - Middleware: Automatic API request handling and caching
 * 
 * Usage in application root:
 * import { Provider } from 'react-redux';
 * import store from './redux/store';
 * 
 * <Provider store={store}>
 *   <App />
 * </Provider>
 */
export default store;

/**
 * Redux Store Summary:
 * 
 * Core Architecture:
 * - Centralized state management with Redux Toolkit
 * - RTK Query integration for efficient API state management
 * - Authentication state with localStorage persistence
 * - Development tools for debugging and optimization
 * 
 * State Organization:
 * - API slice: All server state, caching, and API operations
 * - Auth slice: User authentication and UI state management
 * - Clear separation of concerns for maintainability
 * - Scalable structure supporting additional slices
 * 
 * Performance Optimizations:
 * - Intelligent caching with automatic invalidation
 * - Request deduplication and background updates
 * - Selective component re-renders through targeted subscriptions
 * - Optimistic updates for better user experience
 * 
 * Developer Experience:
 * - Redux DevTools integration for comprehensive debugging
 * - Auto-generated hooks for consistent API interactions
 * - Clear state structure with predictable updates
 * - TypeScript support for type safety (when applicable)
 * 
 * Middleware Benefits:
 * - RTK Query middleware handles complex API state automatically
 * - Default middleware provides development-time validations
 * - Async action support through redux-thunk integration
 * - Immutability and serializability checks for state integrity
 * 
 * Integration Capabilities:
 * - Seamless React component integration through hooks
 * - Automatic API request lifecycle management
 * - Persistent authentication across browser sessions
 * - Responsive UI state management for mobile/desktop
 * 
 * Scalability Features:
 * - Modular slice architecture for feature-based organization
 * - Dynamic reducer registration for code splitting
 * - Tag-based cache invalidation for complex data relationships
 * - Extensible middleware chain for additional functionality
 * 
 * Security Considerations:
 * - Authentication token management through secure patterns
 * - Automatic cleanup on authentication failures
 * - Development-only debugging tools for production safety
 * - State serialization validation for data integrity
 * 
 * Future Enhancement Opportunities:
 * - Additional slices for feature-specific state management
 * - Real-time updates through WebSocket middleware
 * - Offline support with request queuing
 * - Advanced caching strategies with TTL and background sync
 * - State persistence beyond authentication data
 * - Performance monitoring and analytics integration
 */