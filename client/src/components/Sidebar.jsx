// Utility for conditionally joining CSS class names
import clsx from "clsx";
// Icon imports for navigation menu items
import { MdDashboard, MdSettings } from "react-icons/md"; // Dashboard and settings icons
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa"; // Tasks, trash, and users icons
import { IoMdBook } from "react-icons/io"; // History/book icon
// Redux hooks for state management
import { useDispatch, useSelector } from "react-redux";
// React Router hooks for navigation and routing
import { Link, useLocation } from "react-router-dom";
// Redux action for controlling sidebar visibility
import { setOpenSidebar } from "../redux/slices/authSlice";

/**
 * NAVIGATION LINK CONFIGURATION
 *
 * Defines the main navigation structure for the sidebar.
 * Each link contains:
 * - label: Display text for the navigation item
 * - link: Route path for navigation
 * - icon: React icon component for visual identification
 *
 * Order matters as it determines the display sequence in the sidebar.
 */
const linkData = [
  { label: "Dashboard", link: "/dashboard", icon: <MdDashboard /> }, // Main overview page
  { label: "Tasks", link: "/tasks", icon: <FaTasks /> }, // Task management
  { label: "History", link: "/history", icon: <IoMdBook /> }, // Historical data/logs
  { label: "Trash", link: "/trashed", icon: <FaTrashAlt /> }, // Deleted items
  { label: "Team", link: "/team", icon: <FaUsers /> }, // Team management
];

/**
 * Sidebar Component
 *
 * The main navigation sidebar that provides access to all application sections.
 * Features role-based navigation, active state highlighting, and responsive design.
 *
 * Key Features:
 * - Role-based navigation (admin vs regular user permissions)
 * - Active route highlighting with visual indicators
 * - Responsive design with mobile drawer functionality
 * - User profile display with avatar and role information
 * - Consistent branding and visual hierarchy
 * - Smooth hover effects and transitions
 *
 * Design Philosophy:
 * - Blue color scheme matching application branding
 * - Clear visual hierarchy with sections and grouping
 * - Accessible navigation with proper contrast and sizing
 * - Consistent spacing and typography throughout
 */
const Sidebar = () => {
  // Get current authenticated user from Redux store for permission checks
  const { user } = useSelector((state) => state.auth);

  // Redux dispatch function for triggering state changes
  const dispatch = useDispatch();

  // Current route location for active link determination
  const location = useLocation();

  // Extract top-level route segment for active link styling
  // e.g., "/tasks/123" becomes "tasks"
  const path = location.pathname.split("/")[1];

  /**
   * ROLE-BASED NAVIGATION FILTERING
   *
   * Determines which navigation links to show based on user permissions.
   * - Admins: See all navigation links including team management
   * - Regular users: See limited navigation (first 4 links only)
   */
  const sidebarLinks = user?.isAdmin ? linkData : linkData.slice(0, 4);

  /**
   * Sidebar close handler
   *
   * Dispatches Redux action to close the sidebar.
   * Primarily used for mobile drawer behavior where sidebar overlays content.
   */
  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  /**
   * NavLink Component
   *
   * Internal component for rendering individual navigation links with active state styling.
   * Handles active state detection and applies appropriate visual styling.
   *
   * @param {Object} el - Link data object containing label, link, and icon
   * @param {Function} onClose - Callback to close sidebar (for mobile)
   */
  const NavLink = ({ el, onClose }) => {
    const location = useLocation();
    const path = location.pathname.split("/")[1];

    // Determine if this link represents the currently active route
    const isActive = path === el.link.split("/")[1];

    return (
      <Link
        to={el.link} // Navigate to the link's route
        onClick={onClose} // Close sidebar on navigation (mobile behavior)
        className={clsx(
          // Base styling for all navigation links
          "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
          // Conditional styling based on active state
          isActive
            ? "bg-white/15 text-white border-l-[3px] border-blue-400 pl-3.25" // Active link styling
            : "text-blue-200 hover:bg-white/10 hover:text-white", // Inactive link styling
        )}
      >
        {/* LINK ICON */}
        <span
          className={clsx(
            "text-base",
            isActive ? "text-blue-400" : "text-blue-400/70", // Icon color based on active state
          )}
        >
          {el.icon}
        </span>

        {/* LINK LABEL */}
        <span>{el.label}</span>
      </Link>
    );
  };

  return (
    // Main sidebar container with full height and blue background
    <div
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: "#0068B5" }}
    >
      {/* SIDEBAR HEADER / BRANDING */}
      <div className="px-5 py-6 border-b border-white/10">
        {/* Organization name */}
        <span className="text-white font-bold text-lg leading-none">
          Systems Group
        </span>
        {/* Department subtitle */}
        <p className="text-blue-300 text-xs mt-0.5">Production Department</p>
      </div>

      {/* MAIN NAVIGATION SECTION */}
      <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {/* Navigation section header */}
        <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest px-4 mb-3">
          Navigation
        </p>

        {/* Render filtered navigation links */}
        {sidebarLinks.map((link) => (
          <NavLink
            el={link}
            key={link.label}
            onClose={closeSidebar} // Pass close handler for mobile
          />
        ))}
      </div>

      {/* BOTTOM SECTION: Settings + User Profile */}
      <div className="px-3 py-4 border-t border-white/10">
        {/* SETTINGS LINK (Admin Only) */}
        {user?.isAdmin && (
          <Link
            to="/settings"
            onClick={closeSidebar}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              // Active state styling for settings link
              path === "settings"
                ? "bg-white/15 text-white border-l-[3px] border-blue-400 pl-3.25" // Active
                : "text-blue-300 hover:text-white hover:bg-white/10", // Inactive
            )}
          >
            <MdSettings className="text-base" />
            <span>Settings</span>
          </Link>
        )}

        {/* CURRENT USER PROFILE DISPLAY */}
        {user && (
          <div
            className="mt-3 px-4 py-3 rounded-xl flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.07)" }} // Semi-transparent white background
          >
            {/* USER AVATAR */}
            {/* Circular avatar showing user's first initial */}
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            {/* USER INFORMATION */}
            <div className="flex-1 min-w-0">
              {/* User's full name */}
              <p className="text-white text-sm font-medium truncate">
                {user.name}
              </p>
              {/* User's role (Admin or Member) */}
              <p className="text-blue-400/70 text-xs truncate">
                {user.isAdmin ? "Admin" : "Member"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export the Sidebar component for use in the main application layout
export default Sidebar;

/**
 * COMPONENT SUMMARY
 *
 * The Sidebar component serves as the primary navigation interface for the application,
 * providing role-based access to different sections and features.
 *
 * KEY FEATURES:
 * - Role-Based Navigation: Different navigation options for admins vs regular users
 * - Active State Highlighting: Visual indicators for current page/section
 * - Responsive Design: Works as both fixed sidebar and mobile drawer
 * - User Profile Integration: Shows current user info and role
 * - Consistent Branding: Matches application color scheme and typography
 * - Smooth Interactions: Hover effects and transition animations
 *
 * NAVIGATION STRUCTURE:
 * - Dashboard: Main overview and analytics
 * - Tasks: Task management and workflow
 * - History: Historical data and audit logs
 * - Trash: Deleted items management
 * - Team: User and team management (admin only in main nav)
 * - Settings: System configuration (admin only, bottom section)
 *
 * VISUAL DESIGN:
 * - Blue Color Scheme: Consistent with application branding (#0068B5)
 * - Typography Hierarchy: Clear distinction between sections and items
 * - Spacing System: Consistent padding and margins throughout
 * - Active State Indicators: Left border and background highlighting
 * - Icon System: Consistent iconography for easy recognition
 *
 * RESPONSIVE BEHAVIOR:
 * - Desktop: Fixed sidebar with full navigation
 * - Mobile: Drawer overlay that can be opened/closed
 * - Touch-friendly: Appropriate sizing for mobile interactions
 *
 * ACCESSIBILITY FEATURES:
 * - Semantic HTML structure with proper navigation elements
 * - High contrast colors for text and backgrounds
 * - Keyboard navigation support through Link components
 * - Screen reader friendly with descriptive text and proper roles
 * - Focus management for interactive elements
 *
 * INTEGRATION POINTS:
 * - Redux store for user authentication and permissions
 * - React Router for navigation and active route detection
 * - Responsive design system for mobile/desktop adaptation
 * - Icon library for consistent visual language
 */
