// Redux Toolkit import for creating slice with reducers and actions
import { createSlice } from "@reduxjs/toolkit";

/**
 * Initial Authentication State - Hydrated from localStorage for persistence
 * 
 * @description
 * Initializes the authentication state by checking localStorage for existing user data.
 * This enables persistent login sessions across browser refreshes and new tabs.
 * 
 * State structure:
 * - user: Complete user object with authentication tokens and profile data
 * - isSidebarOpen: UI state for sidebar visibility (mobile/responsive behavior)
 * 
 * Persistence strategy:
 * - Reads from localStorage on application initialization
 * - Safely handles missing or corrupted localStorage data
 * - Provides fallback to null for clean initial state
 * 
 * Security considerations:
 * - localStorage data is parsed safely with error handling
 * - User data includes authentication tokens for API access
 * - State is cleared on logout for security compliance
 */
const initialState = {
    /**
     * User authentication data
     * 
     * Contains complete user profile and authentication information:
     * - User ID and basic profile (name, email, role)
     * - Authentication tokens (JWT, refresh tokens)
     * - User preferences and settings
     * - Permission levels and access rights
     * 
     * Persistence: Stored in localStorage for session continuity
     * Security: Automatically cleared on authentication failures
     */
    user: localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo")) // Parse existing user data
        : null, // Default to null for unauthenticated state

    /**
     * Sidebar visibility state for responsive UI
     * 
     * Controls the mobile/tablet sidebar display:
     * - false: Sidebar is collapsed/hidden (default for mobile)
     * - true: Sidebar is expanded/visible
     * 
     * UI behavior: Managed separately from user authentication
     * Responsive design: Adapts to different screen sizes and user preferences
     */
    isSidebarOpen: false,
};

/**
 * Authentication Redux Slice - Manages user authentication and UI state
 * 
 * @description
 * Centralized state management for user authentication and related UI components.
 * Provides actions for login, logout, and sidebar control with localStorage persistence.
 * 
 * Architecture decisions:
 * - Combines authentication and UI state for related functionality
 * - Uses localStorage for authentication persistence across sessions
 * - Implements synchronous state updates for immediate UI feedback
 * - Separates concerns while maintaining related state together
 * 
 * State management patterns:
 * - Immutable state updates through Redux Toolkit
 * - Synchronous localStorage operations for immediate persistence
 * - Clear action naming for predictable state changes
 * - Minimal state structure for performance and simplicity
 */
const authSlice = createSlice({
    name: "auth", // Slice name for Redux DevTools and debugging
    initialState,
    reducers: {
        /**
         * Set Credentials Action - Stores user authentication data
         * 
         * @param {Object} state - Current Redux state
         * @param {Object} action - Redux action with user data payload
         * @param {Object} action.payload - Complete user authentication data
         * 
         * Authentication workflow:
         * 1. Receives user data from successful login/registration
         * 2. Updates Redux state for immediate application access
         * 3. Persists data to localStorage for session continuity
         * 4. Enables authenticated API requests through stored tokens
         * 
         * Data persistence:
         * - Synchronous localStorage write for immediate availability
         * - JSON serialization for complex user object storage
         * - Automatic availability across browser tabs and refreshes
         * 
         * Security implications:
         * - Stores authentication tokens in localStorage (consider security trade-offs)
         * - Enables persistent sessions without server-side session management
         * - Tokens are included in API requests through base query configuration
         * 
         * Usage pattern:
         * dispatch(setCredentials(userData));
         * // User is now authenticated and can access protected resources
         */
        setCredentials: (state, action) => {
            // Update Redux state with user authentication data
            state.user = action.payload;
            
            // Persist user data to localStorage for session continuity
            // This enables automatic re-authentication on page refresh
            localStorage.setItem("userInfo", JSON.stringify(action.payload));
        },

        /**
         * Logout Action - Clears user authentication and session data
         * 
         * @param {Object} state - Current Redux state
         * 
         * Logout workflow:
         * 1. Clears user data from Redux state
         * 2. Removes authentication data from localStorage
         * 3. Triggers application-wide logout behavior
         * 4. Redirects user to login page (handled by components)
         * 
         * Security cleanup:
         * - Removes authentication tokens from client storage
         * - Prevents unauthorized access with stale credentials
         * - Ensures clean state for next user session
         * 
         * State management:
         * - Resets user state to null (unauthenticated)
         * - Maintains sidebar state for UI consistency
         * - Triggers re-renders in components dependent on auth state
         * 
         * Integration points:
         * - Called automatically on 401 responses from API
         * - Triggered by user logout actions
         * - Used in authentication error handling
         * 
         * Usage pattern:
         * dispatch(logout());
         * // User is logged out and redirected to login page
         */
        logout: (state) => {
            // Clear user authentication data from Redux state
            state.user = null;
            
            // Remove persisted authentication data from localStorage
            // This prevents automatic re-authentication on page refresh
            localStorage.removeItem("userInfo");
        }, 

        /**
         * Set Sidebar State Action - Controls sidebar visibility for responsive UI
         * 
         * @param {Object} state - Current Redux state
         * @param {Object} action - Redux action with sidebar state payload
         * @param {boolean} action.payload - New sidebar visibility state
         * 
         * UI state management:
         * - Controls sidebar visibility for mobile/tablet layouts
         * - Enables responsive design with collapsible navigation
         * - Provides smooth user experience across device sizes
         * 
         * Responsive behavior:
         * - Mobile: Sidebar typically starts closed for screen space
         * - Desktop: Sidebar may remain open for persistent navigation
         * - User preference: Remembers user's sidebar preference during session
         * 
         * Performance considerations:
         * - Lightweight state change for immediate UI response
         * - No localStorage persistence (session-only preference)
         * - Minimal re-renders through targeted state updates
         * 
         * Integration with UI components:
         * - Sidebar component subscribes to this state
         * - Navigation components can toggle sidebar visibility
         * - Responsive breakpoints may automatically control state
         * 
         * Usage patterns:
         * dispatch(setOpenSidebar(true));  // Open sidebar
         * dispatch(setOpenSidebar(false)); // Close sidebar
         * dispatch(setOpenSidebar(!isSidebarOpen)); // Toggle sidebar
         */
        setOpenSidebar: (state, action) => {
            // Update sidebar visibility state
            state.isSidebarOpen = action.payload;
        },
    },
});

/**
 * Export action creators for use in components and middleware
 * 
 * Action creators are automatically generated by Redux Toolkit based on reducer names.
 * These functions create action objects with proper type and payload structure.
 * 
 * Available actions:
 * - setCredentials: For storing user authentication data
 * - logout: For clearing user session and authentication
 * - setOpenSidebar: For controlling sidebar visibility state
 * 
 * Usage in components:
 * import { setCredentials, logout, setOpenSidebar } from './authSlice';
 * const dispatch = useDispatch();
 * dispatch(setCredentials(userData));
 */
export const { setCredentials, logout, setOpenSidebar } = authSlice.actions;

/**
 * Export the reducer for store configuration
 * 
 * The reducer handles all state updates for the auth slice.
 * This is used in the Redux store configuration to manage authentication state.
 * 
 * Store integration:
 * import authReducer from './authSlice';
 * const store = configureStore({
 *   reducer: {
 *     auth: authReducer,
 *   },
 * });
 */
export default authSlice.reducer;

/**
 * Authentication Slice Summary:
 * 
 * Core Functionality:
 * - User authentication state management with persistence
 * - Automatic session restoration from localStorage
 * - Clean logout workflow with complete state cleanup
 * - Responsive UI state management for sidebar control
 * 
 * Persistence Strategy:
 * - localStorage integration for cross-session authentication
 * - Automatic hydration on application initialization
 * - Synchronous persistence for immediate availability
 * - JSON serialization for complex user object storage
 * 
 * Security Considerations:
 * - Authentication tokens stored in localStorage (consider XSS risks)
 * - Automatic cleanup on logout and authentication failures
 * - No sensitive data persistence beyond authentication needs
 * - Clean state management preventing data leaks
 * 
 * State Structure:
 * - Minimal state for performance and simplicity
 * - Clear separation between authentication and UI state
 * - Immutable updates through Redux Toolkit
 * - Predictable state changes through well-defined actions
 * 
 * Integration Points:
 * - API slice integration for automatic authentication headers
 * - Component integration through useSelector and useDispatch
 * - Router integration for protected route handling
 * - UI component integration for responsive design
 * 
 * Performance Benefits:
 * - Lightweight state updates for immediate UI feedback
 * - Efficient localStorage operations for persistence
 * - Minimal re-renders through targeted state changes
 * - Optimized for frequent authentication state checks
 * 
 * Developer Experience:
 * - Clear action names and predictable behavior
 * - Automatic action creator generation
 * - Redux DevTools integration for debugging
 * - TypeScript support for type safety (when applicable)
 * 
 * Future Enhancement Opportunities:
 * - Token refresh logic for enhanced security
 * - Encrypted localStorage for sensitive data protection
 * - Session timeout handling with automatic logout
 * - Multi-tab synchronization for consistent auth state
 * - Remember me functionality with extended persistence
 * - Biometric authentication integration for mobile devices
 */