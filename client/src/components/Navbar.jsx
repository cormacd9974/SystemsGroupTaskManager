// React hooks for state management and side effects
import { useState, useEffect } from "react";
// Icon imports for UI elements
import { MdOutlineSearch } from "react-icons/md"; // Search icon for search input
import { HiMenuAlt2 } from "react-icons/hi"; // Hamburger menu icon for mobile
import { useDispatch } from "react-redux"; // Redux hook for dispatching actions
import { setOpenSidebar } from "../redux/slices/authSlice"; // Redux action to control sidebar
// React Router hooks for navigation and URL management
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
// Component imports for navbar functionality
import NotificationPanel from "./NotificationPanel"; // Notifications dropdown component
import UserAvatar from "./UserAvatar"; // User profile avatar component
import { MdDarkMode, MdLightMode } from "react-icons/md"; // Dark/light mode toggle icons

/**
 * Navbar Component
 *
 * The main navigation bar that appears at the top of the application.
 * Provides navigation controls, search functionality, theme switching,
 * and user-related actions.
 *
 * Key Features:
 * - Responsive design with mobile hamburger menu
 * - Dynamic page title based on current route
 * - Search functionality with URL parameter synchronization
 * - Dark/light mode toggle with persistent state
 * - Notification panel integration
 * - User avatar and profile access
 * - Conditional search input based on current page
 *
 * Layout Structure:
 * - Left: Mobile menu + Page title + Search (conditional)
 * - Right: Dark mode toggle + Notifications + User avatar
 */
const Navbar = () => {
  /**
   * DARK MODE STATE MANAGEMENT
   *
   * Initialize dark mode state by checking if the HTML document
   * currently has the "dark" class applied. This ensures the
   * component state matches the actual DOM state on initial load.
   */
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );

  /**
   * Dark mode toggle handler
   *
   * Toggles the dark mode state and applies/removes the "dark" class
   * from the HTML document element. This class is used by Tailwind CSS
   * to apply dark mode styles throughout the application.
   */
  const toggleDark = () => {
    // Toggle the local state
    const isDark = !darkMode;
    setDarkMode(isDark);

    // Apply or remove the "dark" class from the root HTML element
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Redux dispatch function for triggering state changes
  const dispatch = useDispatch();

  // React Router hooks for navigation and URL management
  const navigate = useNavigate(); // Programmatic navigation
  const location = useLocation(); // Current route information
  const [searchParams] = useSearchParams(); // URL search parameters

  /**
   * SEARCH STATE MANAGEMENT
   *
   * Initialize search term from URL parameters to maintain search state
   * across page refreshes and direct URL access. Falls back to empty
   * string if no search parameter exists.
   */
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  /**
   * SEARCH URL SYNCHRONIZATION EFFECT
   *
   * Keeps the URL search parameters in sync with the search term state.
   * This allows users to bookmark search results and maintains search
   * state during navigation.
   */
  useEffect(() => {
    // Create new URLSearchParams object for building query string
    const params = new URLSearchParams();

    // Add search parameter only if search term exists
    if (searchTerm) {
      params.set("search", searchTerm);
    }

    // Construct new URL with current pathname and updated search parameters
    const newURL = `${location.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;

    // Navigate to new URL, replacing current history entry to avoid
    // creating a new entry for each keystroke
    navigate(newURL, { replace: true });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]); // Re-run effect when search term changes

  /**
   * PAGE NAME EXTRACTION AND FORMATTING
   *
   * Extract the current page name from the URL pathname and format it
   * for display in the navbar title.
   */

  // Extract page name from pathname (e.g., "/tasks" -> "tasks")
  const pageName = location.pathname.split("/")[1];

  // Format page name for display with proper capitalization
  const displayName = pageName
    ? pageName.charAt(0).toUpperCase() + pageName.slice(1) // Capitalize first letter
    : "Dashboard"; // Default to "Dashboard" for root path

  return (
    // MAIN NAVBAR CONTAINER
    // Sticky positioning keeps navbar at top during scroll
    <div className="flex justify-between items-center bg-white border-b border-gray-100 px-5 py-3.5 sticky z-10 top-0 shadow-sm">
      {/* LEFT SECTION: Mobile Menu + Title + Search */}
      <div className="flex items-center gap-4">
        {/* MOBILE MENU BUTTON */}
        {/* Only visible on mobile screens (hidden on md+ screens) */}
        <button
          onClick={() => dispatch(setOpenSidebar(true))} // Open sidebar via Redux action
          className="text-gray-500 hover:text-blue-600 block md:hidden p-1.5 rounded-lg hover:bg-blue-50"
        >
          <HiMenuAlt2 size={22} />
        </button>

        {/* PAGE TITLE SECTION */}
        {/* Hidden on mobile, visible on medium+ screens */}
        <div className="hidden md:block">
          {/* Dynamic page title based on current route */}
          <h1 className="text-lg font-bold text-gray-900 capitalize">
            {displayName}
          </h1>
          {/* Static subtitle for organizational context */}
          <p className="text-xs text-gray-400">
            Systems Group-Production Department
          </p>
        </div>

        {/* SEARCH INPUT */}
        {/* Conditionally rendered - hidden on specific pages */}
        {!["/dashboard", "/team", "/settings"].includes(location.pathname) && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl py-2 px-3.5 w-56 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            {/* Search icon */}
            <MdOutlineSearch className="text-gray-400 text-lg shrink-0" />

            {/* Search input field */}
            <input
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input
              value={searchTerm} // Controlled input
              type="text"
              placeholder="Search tasks..."
              className="flex-1 outline-none bg-transparent placeholder:text-gray-400 text-sm text-gray-800"
            />
          </div>
        )}
      </div>

      {/* RIGHT SECTION: Theme Toggle + Notifications + User Avatar */}
      <div className="flex items-center gap-3">
        {/* DARK MODE TOGGLE BUTTON */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
        >
          {/* Icon changes based on current theme */}
          {
            darkMode ? (
              <MdLightMode size={20} /> // Light mode icon when in dark mode
            ) : (
              <MdDarkMode size={20} />
            ) // Dark mode icon when in light mode
          }
        </button>

        {/* NOTIFICATION PANEL */}
        {/* Dropdown component for displaying notifications */}
        <NotificationPanel />

        {/* USER AVATAR */}
        {/* Component for user profile access and account menu */}
        <UserAvatar />
      </div>
    </div>
  );
};

// Export the Navbar component for use in the main application layout
export default Navbar;

/**
 * COMPONENT SUMMARY
 *
 * The Navbar component serves as the primary navigation interface for the application,
 * providing essential functionality and user controls in a responsive design.
 *
 * KEY FEATURES:
 * - Responsive Design: Adapts layout for mobile and desktop screens
 * - Dynamic Content: Page titles and search visibility based on current route
 * - Search Integration: URL-synchronized search with real-time updates
 * - Theme Management: Dark/light mode toggle with DOM manipulation
 * - Navigation Controls: Mobile sidebar toggle and user account access
 * - Notification System: Integrated notification panel for user alerts
 *
 * RESPONSIVE BEHAVIOR:
 * - Mobile: Shows hamburger menu, hides page title, compact layout
 * - Desktop: Shows full page title with subtitle, expanded search input
 * - Search input conditionally hidden on certain pages for better UX
 *
 * STATE MANAGEMENT:
 * - Local state for search term and dark mode
 * - Redux integration for sidebar control
 * - URL parameter synchronization for search persistence
 * - DOM manipulation for theme application
 *
 * ACCESSIBILITY CONSIDERATIONS:
 * - Semantic button elements with proper hover states
 * - Focus management for search input with visual indicators
 * - Icon-based controls with appropriate sizing
 * - Keyboard navigation support through standard HTML elements
 *
 * INTEGRATION POINTS:
 * - Redux store for sidebar state management
 * - React Router for navigation and URL management
 * - Child components for notifications and user profile
 * - Tailwind CSS for responsive design and theming
 */
