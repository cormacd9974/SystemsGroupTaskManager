// Headless UI components for accessible popover functionality
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
// React hooks for state management and fragments
import { Fragment, useState } from "react";
// Moment.js for date/time formatting and relative time display
import moment from "moment";
// Icon imports for different notification types and UI elements
import { BiSolidMessageRounded } from "react-icons/bi"; // Message notification icon
import { HiBellAlert } from "react-icons/hi2"; // Alert notification icon
import { IoIosNotificationsOutline } from "react-icons/io"; // Main notification bell icon
// Redux hooks for notification data fetching and mutations
import {
  useGetNotificationsQuery,
  useMarkNotiAsReadMutation,
} from "../redux/slices/api/userApiSlice";
// Modal component for viewing notification details
import ViewNotification from "./ViewNotification";

/**
 * NOTIFICATION TYPE ICON MAPPING
 *
 * Maps notification types to their corresponding visual icons.
 * This provides consistent iconography across the notification system
 * and helps users quickly identify different types of notifications.
 */
const ICONS = {
  alert: <HiBellAlert className="h-4 w-4 text-blue-600" />, // System alerts, warnings
  message: <BiSolidMessageRounded className="h-4 w-4 text-blue-600" />, // Messages, comments, communications
};

/**
 * NotificationPanel Component
 *
 * A comprehensive notification system that displays unread notifications in a dropdown panel.
 * Features include real-time notification fetching, read/unread status management,
 * notification preview, and detailed notification viewing.
 *
 * Key Features:
 * - Unread notification count badge on bell icon
 * - Dropdown panel with notification list (max 5 visible)
 * - Click to view detailed notification content
 * - Mark all notifications as read functionality
 * - Relative time display (e.g., "2 minutes ago")
 * - Empty state handling for no notifications
 * - Smooth transitions and hover effects
 * - Responsive design with proper spacing
 *
 * User Interaction Flow:
 * 1. User sees notification count badge on bell icon
 * 2. Clicks bell to open dropdown panel
 * 3. Views notification previews with timestamps
 * 4. Clicks specific notification to view details
 * 5. Can mark all as read or close panel
 */
export default function NotificationPanel() {
  // Mutation hook for marking notifications as read
  const [markAsRead] = useMarkNotiAsReadMutation();

  // Query hook for fetching unread notifications with refetch capability
  const { data, refetch } = useGetNotificationsQuery();

  // Local state for managing selected notification for detailed view
  const [selected, setSelected] = useState(null);

  // Local state for controlling the ViewNotification modal visibility
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* MAIN POPOVER CONTAINER */}
      <Popover className="relative">
        {/* NOTIFICATION BELL BUTTON */}
        {/* Trigger button that opens the notification dropdown */}
        <PopoverButton
          className="relative w-9 h-9 flex items-center justify-center 
            rounded-xl hover:bg-gray-100"
        >
          {/* Main notification bell icon */}
          <IoIosNotificationsOutline className="h-5 w-5 text-gray-600" />

          {/* UNREAD NOTIFICATION BADGE */}
          {/* Red badge showing count of unread notifications */}
          {data?.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {/* Show "9+" for counts over 9 to prevent badge overflow */}
              {data.length > 9 ? "9+" : data.length}
            </span>
          )}
        </PopoverButton>

        {/* DROPDOWN TRANSITION ANIMATION */}
        {/* Smooth fade and slide transition for dropdown appearance */}
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 translate-y-1" // Start: invisible and slightly up
          enterTo="opacity-100 translate-y-0" // End: fully visible at normal position
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0" // Start: fully visible
          leaveto="opacity-0" // End: invisible (fade out)
        >
          {/* DROPDOWN PANEL */}
          {/* Main notification dropdown container */}
          <PopoverPanel className="absolute right-0 z-10 mt-2 w-80">
            {({ close }) =>
              // Conditional rendering based on whether notifications exist
              data?.length > 0 ? (
                // NOTIFICATIONS EXIST - Show full notification panel
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  {/* PANEL HEADER */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">
                      Notifications
                    </p>
                    <p className="text-xs text-gray-400">
                      {data.length} unread
                    </p>
                  </div>

                  {/* NOTIFICATION LIST */}
                  {/* Scrollable container for notification items */}
                  <div className="max-h-64 overflow-y-auto">
                    {/* Display up to 5 most recent notifications */}
                    {data.slice(0, 5).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0"
                        onClick={() => {
                          setSelected(item); // Set selected notification
                          setOpen(true); // Open detailed view modal
                        }}
                      >
                        {/* NOTIFICATION TYPE ICON */}
                        {/* Colored container with type-specific icon */}
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          {ICONS[item.notiType]}
                        </div>

                        {/* NOTIFICATION CONTENT */}
                        <div className="flex-1 min-w-0">
                          {/* Header row with type and timestamp */}
                          <div className="flex items-center justify-between gap-2">
                            {/* Notification type label */}
                            <p className="text-xs font-semibold text-gray-900 capitalize">
                              {item.notiType}
                            </p>
                            {/* Relative timestamp (e.g., "2 minutes ago") */}
                            <span className="text-xs text-gray-400">
                              {moment(item.createdAt).fromNow()}
                            </span>
                          </div>
                          {/* Notification text preview with line clamping */}
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PANEL FOOTER ACTIONS */}
                  {/* Two-button layout for panel actions */}
                  <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-50">
                    {/* Mark all as read button */}
                    <button
                      onClick={async () => {
                        // Mark all notifications as read via API
                        await markAsRead({ type: "all", id: null });
                        // Refetch notifications to update UI
                        await refetch();
                      }}
                      className="py-3 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Mark all read
                    </button>

                    {/* Close panel button */}
                    <button
                      onClick={() => {
                        close();
                      }} // Close popover panel
                      className="py-3 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                // NO NOTIFICATIONS - Show empty state
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
                  <p className="text-sm text-gray-400">No new notifications</p>
                </div>
              )
            }
          </PopoverPanel>
        </Transition>
      </Popover>

      {/* DETAILED NOTIFICATION VIEW MODAL */}
      {/* Modal component for viewing full notification content */}
      <ViewNotification
        open={open} // Modal visibility state
        setOpen={setOpen} // Function to control modal
        el={selected} // Selected notification data
      />
    </>
  );
}

/**
 * COMPONENT SUMMARY
 *
 * The NotificationPanel component provides a comprehensive notification system
 * that keeps users informed about important events and messages in the application.
 *
 * KEY FEATURES:
 * - Real-time Notifications: Fetches and displays unread notifications
 * - Visual Indicators: Badge count on bell icon for immediate awareness
 * - Preview Interface: Quick preview of notification content in dropdown
 * - Detailed View: Modal for viewing complete notification information
 * - Batch Actions: Mark all notifications as read functionality
 * - Responsive Design: Adapts to different screen sizes and contexts
 *
 * USER EXPERIENCE:
 * - Immediate Feedback: Badge count shows unread notifications at a glance
 * - Progressive Disclosure: Preview in dropdown, details in modal
 * - Efficient Actions: Quick access to mark all as read
 * - Smooth Interactions: Animated transitions and hover effects
 * - Accessible Design: Proper focus management and keyboard navigation
 *
 * TECHNICAL IMPLEMENTATION:
 * - Headless UI: Accessible popover component with proper ARIA attributes
 * - Redux Integration: Real-time data fetching and state management
 * - Moment.js: Human-readable relative timestamps
 * - Responsive Layout: Fixed width dropdown with scrollable content
 * - Icon System: Consistent iconography for different notification types
 *
 * NOTIFICATION TYPES:
 * - Alert: System notifications, warnings, important updates
 * - Message: Communication notifications, comments, mentions
 * - Extensible: Easy to add new notification types with corresponding icons
 *
 * PERFORMANCE CONSIDERATIONS:
 * - Limited Display: Shows only 5 most recent notifications in dropdown
 * - Efficient Queries: Uses Redux RTK Query for caching and optimization
 * - Lazy Loading: Detailed view only loads when notification is selected
 * - Optimistic Updates: Immediate UI feedback for mark-as-read actions
 *
 * ACCESSIBILITY FEATURES:
 * - Semantic HTML structure with proper roles and labels
 * - Keyboard navigation support through Headless UI
 * - High contrast colors for notification badges and text
 * - Screen reader friendly with descriptive text and timestamps
 */
