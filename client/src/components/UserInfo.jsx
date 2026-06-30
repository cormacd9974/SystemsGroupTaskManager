// Headless UI imports for accessible popover components
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { Fragment } from "react"; // Fragment wrapper for transition animations
import { getInitials } from "../utils"; // Utility function to extract user initials from full name

/**
 * UserInfo Component - Displays user avatar with expandable profile information
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - User object containing profile information
 * @param {string} props.user.name - User's full name for avatar initials and display
 * @param {string} props.user.email - User's email address
 * @param {string} props.user.title - User's job title or role
 *
 * Architecture decisions:
 * - Uses Headless UI Popover for accessible tooltip-style interactions
 * - Implements hover/click pattern for progressive disclosure of user details
 * - Designed as a lightweight alternative to full dropdown menus
 * - Optimized for use in constrained spaces (tables, lists, team displays)
 *
 * UX considerations:
 * - Provides quick user identification via initials avatar
 * - Reveals detailed information on demand to reduce visual clutter
 * - Uses consistent avatar styling across different contexts
 * - Implements smooth animations for polished interactions
 *
 * Accessibility features:
 * - Screen reader support with descriptive labels
 * - Keyboard navigation and focus management
 * - High contrast focus indicators
 * - Proper ARIA attributes via Headless UI
 *
 * Usage contexts:
 * - Team member lists in task tables
 * - Comment author identification
 * - Assignment displays
 * - User mention previews
 *
 * @returns {JSX.Element} Interactive user avatar with expandable profile card
 */
export default function UserInfo({ user }) {
  return (
    // Popover container creates an accessible dropdown-style interaction
    // Relative positioning allows the panel to be positioned relative to the button
    <Popover className="relative">
      {/* Popover trigger button - the clickable avatar */}
      {/* Accessibility: Includes focus ring and proper button semantics */}
      {/* Design: Rounded full for circular avatar appearance */}
      <PopoverButton className="outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 rounded-full">
        {/* Screen reader accessibility label */}
        {/* Hidden visually but announced to assistive technologies */}
        <span className="sr-only">User menu</span>

        {/* Avatar display showing user initials */}
        {/* Design pattern: Circular avatar with initials as fallback for profile photos */}
        {/* Inherits size and background color from parent container for flexibility */}
        <span className="inline-flex items-center justify-center h-full w-full rounded-full text-white text-xs font-bold tracking-white">
          {getInitials(user?.name)}
        </span>
      </PopoverButton>

      {/* Smooth transition animation for popover panel */}
      {/* UX: Provides visual continuity and professional feel */}
      {/* Performance: Uses CSS transforms for hardware acceleration */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200" // Slightly longer enter for smooth appearance
        enterFrom="opacity-0 translate-y-1" // Starts slightly below and transparent
        enterTo="opacity-100 translate-y-0" // Ends in final position and fully opaque
        leave="transition ease-in duration-150" // Faster exit for responsive feel
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1" // Exits with slight downward movement
      >
        {/* Popover content panel with user details */}
        {/* Positioning: Centered horizontally relative to trigger button */}
        {/* Z-index: High value ensures panel appears above other content */}
        <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-80 -translate-x-1/2 transform">
          {/* Card-style container for user information display */}
          {/* Design: Modern card appearance with shadow and rounded corners */}
          {/* Layout: Horizontal layout with avatar and text information */}
          <div className="flex items-center gap-3 rounded-xl shadow-lg bg-white p-4 border border-gray-100">
            {/* Larger avatar for detailed view */}
            {/* Design decision: Uses brand blue color for consistency */}
            {/* Size: Larger than trigger avatar for better visibility in expanded state */}
            <div className="w-12 h-12 bg-[#0068B5] rounded-xl text-white flex items-center justify-center font-bold shrink-0">
              {getInitials(user?.name)}
            </div>

            {/* User information text section */}
            {/* Layout: Vertical stack of user details with proper text hierarchy */}
            {/* Overflow handling: Prevents long text from breaking layout */}
            <div className="min-w-0 overflow-hidden">
              {/* User's full name - primary identification */}
              {/* Typography: Medium weight for emphasis as primary identifier */}
              {/* Truncation: Prevents layout breaks with very long names */}
              <p className="font-medium text-gray-900 text-sm truncate">
                {user?.name}
              </p>

              {/* User's email address - secondary identification */}
              {/* UX: Provides contact information and account verification */}
              {/* Styling: Muted color to establish visual hierarchy */}
              <p className="text-sm text-gray-500 truncate max-w-50">
                {user?.email}
              </p>

              {/* User's title or role - contextual information */}
              {/* Business context: Helps understand user's role in organization */}
              {/* Typography: Smallest size as tertiary information */}
              <p className="text-xs text-gray-400 truncate">{user?.title}</p>
            </div>
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}

/**
 * Component Summary:
 * - Lightweight user profile display component for space-constrained contexts
 * - Progressive disclosure pattern - shows basic avatar, reveals details on interaction
 * - Built with Headless UI for robust accessibility and interaction handling
 * - Consistent with application's avatar and card design patterns
 * - Optimized for use in lists, tables, and team member displays
 *
 * Key Features:
 * - Circular avatar with user initials fallback
 * - Smooth hover/click interactions with animations
 * - Comprehensive user information display (name, email, title)
 * - Responsive design with proper text truncation
 * - Full accessibility compliance with keyboard navigation
 * - Consistent brand styling with application color scheme
 *
 * Design Patterns:
 * - Progressive disclosure for information density management
 * - Consistent avatar styling across application contexts
 * - Card-based information display for scannable content
 * - Semantic color hierarchy for information importance
 *
 * Performance Considerations:
 * - Lightweight component with minimal DOM footprint
 * - CSS-based animations for smooth performance
 * - Conditional rendering via Headless UI for efficiency
 * - Optimized for repeated use in lists and tables
 *
 * Integration Points:
 * - Requires user object with name, email, and title properties
 * - Depends on getInitials utility function for avatar generation
 * - Inherits sizing from parent container for flexible usage
 * - Compatible with various background colors and contexts
 *
 * Accessibility Features:
 * - Screen reader labels for non-visual users
 * - Keyboard navigation support (tab, enter, escape)
 * - Focus indicators with high contrast rings
 * - Proper button semantics and ARIA attributes
 * - Text truncation with full content available via interaction
 */
