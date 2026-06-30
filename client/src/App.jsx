/**
 * MAIN APPLICATION COMPONENT - TASK MANAGEMENT SYSTEM
 * 
 * This is the root component that orchestrates the entire application structure,
 * handling authentication-based routing, responsive layout management, and
 * global UI components. It implements a protected route pattern where
 * authenticated users see the main application while unauthenticated users
 * are redirected to login.
 */

// THIRD-PARTY IMPORTS
import { Toaster } from "sonner";                    // Toast notification system for user feedback
import { IoMdClose } from "react-icons/io";          // Close icon for mobile sidebar
import { useDispatch, useSelector } from "react-redux"; // Redux state management hooks
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";                           // React Router for client-side routing

// INTERNAL COMPONENT IMPORTS
import Sidebar from "./components/Sidebar";          // Main navigation sidebar component
import Navbar from "./components/Navbar";            // Top navigation bar with user controls
import ErrorBoundary from "./components/ErrorBoundary"; // Error handling wrapper component

// REDUX ACTION IMPORTS
import { setOpenSidebar } from "./redux/slices/authSlice"; // Action to control mobile sidebar visibility

// PAGE COMPONENT IMPORTS - Lazy loading could be implemented here for performance
import { Dashboard, History, Login, TaskDetail, Tasks, Team, Trash, Users, ForgotPassword, ResetPassword } from "./pages";

/**
 * PROTECTED LAYOUT COMPONENT
 * 
 * AUTHENTICATION PATTERN: Implements route protection by checking user authentication
 * status from Redux store. This ensures sensitive application data is only accessible
 * to authenticated users and provides seamless redirect experience.
 * 
 * RESPONSIVE DESIGN STRATEGY: Uses CSS Grid/Flexbox with Tailwind classes to create
 * a responsive layout that adapts from mobile (stacked) to desktop (side-by-side).
 * The sidebar is hidden on mobile and shown as an overlay when needed.
 * 
 * LAYOUT ARCHITECTURE:
 * - Desktop: Fixed sidebar (256px) + flexible main content area
 * - Mobile: Full-width content with overlay sidebar when opened
 * 
 * ACCESSIBILITY: Maintains focus management and keyboard navigation through
 * proper semantic structure and React Router's built-in accessibility features.
 */
function Layout() {
  // AUTHENTICATION STATE: Get current user from Redux store for route protection
  const { user } = useSelector((state) => state.auth);
  
  // LOCATION TRACKING: Capture current location for post-login redirect functionality
  // This enables "return to intended page" UX after authentication
  const location = useLocation();

  // CONDITIONAL RENDERING: Show app layout for authenticated users, redirect others to login
  // The 'state' prop preserves the intended destination for post-login navigation
  return user ? (
    // MAIN APPLICATION LAYOUT CONTAINER
    // Uses flexbox for responsive behavior: column on mobile, row on desktop
    <div className='w-full h-screen flex flex-col md:flex-row overflow-hidden'>
      
      {/* DESKTOP SIDEBAR SECTION
          DESIGN DECISIONS:
          - Fixed width (256px/w-64) for consistent navigation experience
          - Hidden on mobile (md:block) to maximize content space
          - Sticky positioning ensures sidebar stays visible during scroll
          - shrink-0 prevents sidebar from compressing when content is wide */}
      <div className='w-64 h-screen shrink-0 hidden md:block sticky top-0'>
        <Sidebar />
      </div>

      {/* MOBILE SIDEBAR OVERLAY COMPONENT
          Rendered separately to handle mobile-specific interaction patterns */}
      <MobileSidebar />

      {/* MAIN CONTENT AREA
          LAYOUT STRATEGY:
          - flex-1 allows content to fill remaining space after sidebar
          - Nested flex column for navbar + scrollable content structure
          - overflow-hidden prevents layout issues with long content */}
      <div className='flex-1 flex flex-col overflow-hidden bg-gray-50'>
        
        {/* TOP NAVIGATION BAR
            Contains user controls, search, notifications, etc. */}
        <Navbar />
        
        {/* SCROLLABLE CONTENT AREA
            PERFORMANCE: overflow-y-auto enables smooth scrolling for long content
            SPACING: Responsive padding (p-5 on mobile, 2xl:px-8 on large screens)
            OUTLET: React Router outlet renders the current page component */}
        <div className='flex-1 overflow-y-auto p-5 2xl:px-8'>
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    // AUTHENTICATION REDIRECT: Send unauthenticated users to login
    // 'replace' prevents back button from returning to protected route
    // 'state.from' enables redirect back to intended page after login
    <Navigate to="/log-in" state={{ from: location }} replace />
  );
}

/**
 * MOBILE SIDEBAR OVERLAY COMPONENT
 * 
 * MOBILE UX PATTERN: Implements standard mobile navigation pattern with:
 * - Full-screen backdrop for focus and context
 * - Slide-in sidebar panel
 * - Touch-friendly close interactions
 * - Proper z-index layering
 * 
 * INTERACTION DESIGN:
 * - Backdrop click closes sidebar (common mobile pattern)
 * - Sidebar content click is prevented from bubbling to backdrop
 * - Dedicated close button for explicit dismissal
 * - Semi-transparent backdrop (bg-black/50) maintains context
 * 
 * ACCESSIBILITY CONSIDERATIONS:
 * - Fixed positioning with high z-index ensures proper layering
 * - Click event handling respects user intent
 * - Close button has adequate touch target size
 */
const MobileSidebar = () => {
  // SIDEBAR STATE: Get mobile sidebar visibility from Redux store
  const { isSidebarOpen } = useSelector((state) => state.auth);
  
  // DISPATCH HOOK: For triggering sidebar close action
  const dispatch = useDispatch();
  
  // CLOSE HANDLER: Centralized function for sidebar dismissal
  const closeSidebar = () => dispatch(setOpenSidebar(false));

  // EARLY RETURN: Don't render DOM elements when sidebar is closed
  // This improves performance and prevents unnecessary event listeners
  if (!isSidebarOpen) return null;

  return (
    // BACKDROP OVERLAY
    // INTERACTION: Click backdrop to close (standard mobile UX pattern)
    // STYLING: Semi-transparent black overlay with high z-index for proper layering
    // RESPONSIVE: Only shown on mobile devices (md:hidden)
    <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={closeSidebar}>
      
      {/* SIDEBAR PANEL CONTAINER
          EVENT HANDLING: stopPropagation prevents backdrop click when clicking inside sidebar
          This allows users to interact with sidebar content without accidentally closing it */}
      <div className="w-72 h-full" onClick={e => e.stopPropagation()}>
        
        {/* SIDEBAR CONTENT: Same component used in desktop layout for consistency */}
        <Sidebar />
        
        {/* CLOSE BUTTON
            POSITIONING: Absolute positioning in top-right corner
            STYLING: Semi-transparent with hover effect for better UX
            ACCESSIBILITY: Adequate padding for touch targets (p-1 = 4px padding) */}
        <button 
          onClick={closeSidebar} 
          className="absolute top-4 right-4 text-white/70 hover:text-white p-1"
        >
          <IoMdClose size={22} />
        </button>
      </div>
    </div>
  );
};

/**
 * ROOT APPLICATION COMPONENT
 * 
 * APPLICATION ARCHITECTURE: Serves as the main entry point that coordinates:
 * - Global error handling through ErrorBoundary
 * - Client-side routing configuration
 * - Global UI components (toasts, modals, etc.)
 * - Theme management (dark mode - currently commented out)
 * 
 * ROUTING STRATEGY: Uses nested routes with Layout component as parent
 * to share common UI elements (sidebar, navbar) across protected pages
 * while keeping login page separate and unprotected.
 * 
 * ERROR HANDLING: ErrorBoundary wrapper catches JavaScript errors anywhere
 * in the component tree and displays fallback UI instead of crashing.
 */
const App = () => {
  
  /* DARK MODE IMPLEMENTATION (CURRENTLY DISABLED)
     
     TECHNICAL APPROACH: Would use localStorage persistence and Tailwind's
     dark mode classes for theme switching. Implementation ready for future activation.
     
     const [darkMode, setDarkMode] = useState(false);

     useEffect(() => {
       if (darkMode) {
         document.documentElement.classList.add("dark");
       } else {
         document.documentElement.classList.remove("dark");
       }
     }, [darkMode]);
  */

  return (
    // ERROR BOUNDARY: Catches and handles JavaScript errors gracefully
    // Prevents entire app crashes and provides user-friendly error messages
    <ErrorBoundary>
      
      {/* MAIN APPLICATION CONTAINER
          STYLING: Full viewport dimensions with light gray background
          The min-h-screen ensures content fills viewport even with little content */}
      <main className='w-full min-h-screen bg-gray-50'>
        
        {/* ROUTING CONFIGURATION
            PATTERN: Nested routes with protected Layout wrapper */}
        <Routes>
          
          {/* PROTECTED ROUTES GROUP
              All routes under Layout require authentication
              Layout component handles the auth check and redirect logic */}
          <Route element={<Layout />}>
            
            {/* ROOT REDIRECT: Automatically redirect root path to dashboard
                UX DECISION: Provides immediate value by showing main functionality */}
            <Route index path='/' element={<Navigate to='/dashboard' />} />
            
            {/* MAIN APPLICATION PAGES
                Each route corresponds to a major feature area of the task management system */}
            <Route path='/dashboard' element={<Dashboard />} />      {/* Overview and metrics */}
            <Route path='/tasks' element={<Tasks />} />              {/* Task list and management */}
            <Route path='/team' element={<Team />} />                {/* Team member management */}
            <Route path='/history' element={<History />} />          {/* Activity and audit logs */}
            <Route path='/trashed' element={<Trash />} />            {/* Deleted items recovery */}
            <Route path='/task/:id' element={<TaskDetail />} />      {/* Individual task details */}
            <Route path='/settings' element={<Users />} />           {/* User and system settings */}
          </Route>

          {/* PUBLIC AUTHENTICATION ROUTE
              LOGIN PAGE: Accessible without authentication
              Handles user sign-in and registration flows */}
          <Route path="/log-in" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>

        {/* GLOBAL TOAST NOTIFICATION SYSTEM
            POSITIONING: Top-center for visibility without blocking content
            STYLING: richColors enables semantic color coding (success, error, warning)
            UX: Provides non-intrusive feedback for user actions across the app */}
        <Toaster richColors position="top-center" />
        
      </main>
    </ErrorBoundary>
  );
};

/* DARK MODE TOGGLE BUTTON (FUTURE IMPLEMENTATION)
   
   DESIGN: Fixed positioning in bottom-right corner for easy access
   STYLING: Circular button with brand color and emoji icons
   ACCESSIBILITY: Would need proper ARIA labels and keyboard support
   
   <button
     onClick={() => setDarkMode(!darkMode)}
     className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white"
     style={{backgroundColor: "#0068B5"}}
   >
     {darkMode ? "☀️" : "🌙"}
   </button>
*/

export default App;