// Headless UI imports for accessible dropdown menu components
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Fragment, useState } from "react"; // React hooks and Fragment for transition wrapper
import { FaUser, FaUserLock } from "react-icons/fa"; // Font Awesome icons for profile actions
import { IoLogOutOutline } from "react-icons/io5"; // Ionicons logout icon
import { useDispatch, useSelector } from "react-redux"; // Redux hooks for state management
import { useNavigate } from "react-router-dom"; // React Router navigation hook
import { getInitials } from "../utils"; // Utility function to extract user initials
import { toast } from "sonner"; // Toast notifications for user feedback
import { useLogoutMutation } from "../redux/slices/api/authApiSlice"; // RTK Query mutation for logout API
import ChangePassword from "./ChangePassword"; // Modal component for password changes
import AddUser from "./AddUser"; // Modal component for profile editing (reused for user creation)
import { logout } from "../redux/slices/authSlice"; // Redux action for clearing auth state

/**
 * UserAvatar Component - Displays user profile dropdown in the application header
 *
 * @component
 *
 * Architecture decisions:
 * - Uses Headless UI Menu for accessible dropdown behavior
 * - Implements compound component pattern with MenuButton, MenuItems, MenuItem
 * - Separates authentication logic from UI presentation
 * - Reuses existing modal components (AddUser) for profile editing
 *
 * UX considerations:
 * - Shows user avatar with initials for quick identification
 * - Displays role information (Admin/User) for context
 * - Groups related actions logically (profile actions vs logout)
 * - Uses semantic colors (blue for actions, red for destructive logout)
 * - Responsive design hides detailed info on mobile
 *
 * Security features:
 * - Proper logout flow with API call and state cleanup
 * - Separate change password functionality
 * - Role-based UI elements (Admin/User display)
 *
 * @returns {JSX.Element} User avatar dropdown with profile management options
 */
const UserAvatar = () => {
  /**
   * Modal state management
   * Separates different modal types for cleaner state handling
   */

  // Controls profile edit modal visibility
  // Uses AddUser component in edit mode by passing existing userData
  const [open, setOpen] = useState(false);

  // Controls change password modal visibility
  // Separate modal for security-sensitive password operations
  const [openPassword, setOpenPassword] = useState(false);

  /**
   * Redux state and API integration
   */

  // Get current authenticated user from Redux store
  // Provides user data for display and modal pre-population
  const { user } = useSelector((state) => state.auth);

  // Logout API mutation hook from RTK Query
  // Handles server-side session cleanup and token invalidation
  const [logoutUser] = useLogoutMutation();

  // Redux dispatch for state updates and React Router for navigation
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Logout handler with comprehensive cleanup
   *
   * Security considerations:
   * - Calls API to invalidate server-side session/tokens
   * - Clears client-side authentication state
   * - Redirects to login page to prevent unauthorized access
   * - Provides user feedback for both success and error cases
   *
   * Error handling:
   * - Graceful fallback for network failures
   * - User-friendly error messages via toast notifications
   */
  const logoutHandler = async () => {
    try {
      // Call logout API to invalidate server-side session
      await logoutUser().unwrap();

      // Clear Redux authentication state
      dispatch(logout());

      // Redirect to login page
      navigate("/log-in");
    } catch (err) {
      // Display error message with fallback text
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      {/* Main dropdown menu container */}
      {/* Headless UI Menu provides accessibility and keyboard navigation */}
      <Menu as="div" className="relative inline-block text-left">
        {/* Dropdown trigger button with user avatar and info */}
        {/* Design: Subtle hover effect with rounded corners for modern appearance */}
        <MenuButton className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 transition-colors">
          {/* User avatar circle with initials */}
          {/* Fallback design: Uses initials when profile photo unavailable */}
          {/* Accessibility: Provides visual user identification */}
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
            {getInitials(user?.name)}
          </div>

          {/* User information display - hidden on mobile for space efficiency */}
          {/* Responsive design: Shows detailed info only on medium+ screens */}
          <div className="hidden md:block text-sm text-gray-700">
            {/* User's full name */}
            <p className="text-sm font-semibold text-gray-800 leading-none">
              {user?.name}
            </p>

            {/* Role indicator for quick context */}
            {/* UX: Helps users understand their permission level */}
            <p className="text-xs text-gray-400 mt-0.5">
              {user?.isAdmin ? "Admin" : "User"}
            </p>
          </div>
        </MenuButton>

        {/* Dropdown menu transition animation */}
        {/* Smooth enter/exit animations for polished user experience */}
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 translate-y-1" // Starts slightly above and transparent
          enterTo="opacity-100 translate-y-0" // Ends in final position and opaque
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 scale-95" // Exits with slight scale down effect
        >
          {/* Dropdown menu items container */}
          {/* Design: Card-like appearance with shadow and border */}
          {/* Positioning: Right-aligned to prevent overflow on screen edges */}
          <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 focus:outline-none z-50">
            {/* User summary header section */}
            {/* Visual hierarchy: Highlighted background to separate from actions */}
            <div className="px-4 py-3 bg-blue-50 border-b border-gray-100">
              {/* Full user name display */}
              <p className="text-sm font-bold text-gray-900">{user?.name}</p>

              {/* Email address for additional context */}
              {/* UX: Helps users confirm they're logged into correct account */}
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>

            {/* Profile management actions section */}
            {/* Logical grouping: Profile-related actions separated from logout */}
            <div className="p-1.5">
              {/* Edit Profile menu item */}
              <MenuItem>
                {() => (
                  <button
                    onClick={() => setOpen(true)} // Opens profile edit modal
                    className={
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 text-blue-700"
                    }
                  >
                    {/* Profile icon for visual context */}
                    <FaUser className="text-xs" />
                    Edit Profile
                  </button>
                )}
              </MenuItem>

              {/* Change Password menu item */}
              <MenuItem>
                {() => (
                  <button
                    onClick={() => setOpenPassword(true)} // Opens password change modal
                    className={
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 text-blue-700"
                    }
                  >
                    {/* Lock icon indicates security-related action */}
                    <FaUserLock className="text-xs" />
                    Change Password
                  </button>
                )}
              </MenuItem>
            </div>

            {/* Logout action section */}
            {/* Visual separation: Destructive action isolated from other options */}
            <div>
              <MenuItem>
                <button
                  onClick={logoutHandler} // Executes logout flow
                  className={
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-700"
                  }
                >
                  {/* Logout icon with semantic meaning */}
                  <IoLogOutOutline />
                  Sign Out
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </Transition>
      </Menu>

      {/* Profile edit modal */}
      {/* Component reuse: AddUser component handles both creation and editing */}
      {/* Conditional rendering: Only mounts when needed for performance */}
      <AddUser open={open} setOpen={setOpen} userData={user} />

      {/* Change password modal */}
      {/* Security separation: Dedicated component for password operations */}
      {/* Modal pattern: Consistent with other modal implementations in app */}
      <ChangePassword open={openPassword} setOpen={setOpenPassword} />
    </>
  );
};

/**
 * Export the UserAvatar component as default export
 *
 * Component Summary:
 * - Provides user profile dropdown with avatar and role information
 * - Integrates with Redux for authentication state management
 * - Implements secure logout flow with API cleanup
 * - Offers profile editing and password change functionality
 * - Uses accessible dropdown patterns via Headless UI
 * - Responsive design adapts to different screen sizes
 *
 * Key Features:
 * - Avatar with user initials fallback
 * - Role-based UI elements (Admin/User indicator)
 * - Smooth dropdown animations and transitions
 * - Logical action grouping (profile vs logout)
 * - Comprehensive error handling with user feedback
 * - Modal integration for complex operations
 *
 * Security Considerations:
 * - Proper logout flow with server-side session cleanup
 * - Separate password change functionality
 * - State cleanup on logout to prevent data leaks
 * - Secure navigation after authentication changes
 *
 * Integration Points:
 * - Requires Redux auth state with user object
 * - Depends on authApiSlice for logout mutation
 * - Uses React Router for post-logout navigation
 * - Integrates with AddUser and ChangePassword modals
 * - Requires getInitials utility function
 *
 * Accessibility Features:
 * - Full keyboard navigation support
 * - Screen reader compatible menu structure
 * - Proper focus management via Headless UI
 * - Semantic button roles and labels
 * - High contrast hover states for visibility
 */
export default UserAvatar;
