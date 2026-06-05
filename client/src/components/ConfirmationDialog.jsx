// Utility for conditionally joining CSS class names
import clsx from "clsx";
// Icon imports for visual indicators
import { HiExclamation, HiRefresh } from "react-icons/hi";
// Modal wrapper component for overlay functionality
import ModalWrapper from "./ModalWrapper";

/**
 * ConfirmationDialog Component
 *
 * A reusable confirmation dialog for critical actions like delete and restore operations.
 * This component provides a consistent user experience for actions that require explicit
 * user confirmation to prevent accidental data loss or unwanted changes.
 *
 * Key Features:
 * - Dynamic styling based on action type (delete vs restore)
 * - Customizable message content
 * - Visual indicators with appropriate colors and icons
 * - Consistent button layout and interaction patterns
 * - State management for dialog lifecycle
 *
 * Design Philosophy:
 * - Red theme for destructive actions (delete) to signal danger
 * - Amber theme for restore actions to signal caution but not danger
 * - Clear visual hierarchy with icons, titles, and descriptions
 * - Accessible button sizing and contrast ratios
 *
 * @param {boolean} open - Controls modal visibility state
 * @param {function} setOpen - Function to control modal open/closed state
 * @param {string} msg - Custom message to display (optional)
 * @param {function} onClick - Callback function executed when user confirms action
 * @param {string} type - Action type ("delete", "restore", "restoreAll") for styling
 * @param {function} setMsg - Function to reset message state (optional)
 * @param {function} setType - Function to reset type state (optional)
 */
export default function ConfirmationDialog({
  open, // Modal visibility control
  setOpen, // Function to toggle modal
  msg, // Custom confirmation message
  onClick = () => {}, // Action to perform on confirmation
  type = "delete", // Type of action (affects styling)
  setMsg = () => {}, // Function to clear message
  setType = () => {}, // Function to reset type
}) {
  /**
   * Dialog cleanup and close handler
   *
   * Resets all dialog state to default values and closes the modal.
   * This ensures the dialog is in a clean state for the next use.
   */
  const closeDialog = () => {
    setOpen(false); // Close the modal
    setMsg(""); // Clear any custom message
    setType("delete"); // Reset to default type
  };

  // Determine if this is a restore-type action for conditional styling
  const isRestore = type === "restore" || type === "restoreAll";

  return (
    // Modal wrapper handles backdrop, positioning, and accessibility
    <ModalWrapper open={open} setOpen={closeDialog}>
      {/* Main dialog content container */}
      <div className="flex flex-col items-center gap-4 py-2">
        {/* ICON CONTAINER */}
        {/* Visual indicator that changes based on action type */}
        <div
          className={clsx(
            "w-16 h-16 rounded-2xl flex items-center justify-center",
            // Conditional styling based on action type
            isRestore
              ? "bg-amber-50 text-amber-600" // Amber theme for restore actions
              : "bg-red-100 text-red-600", // Red theme for delete actions
          )}
        >
          {/* Icon selection based on action type */}
          {
            isRestore ? (
              <HiRefresh className="text-amber-500 text-3xl" /> // Refresh icon for restore
            ) : (
              <HiExclamation className="text-red-500 text-3xl" />
            ) // Warning icon for delete
          }
        </div>

        {/* TITLE AND MESSAGE SECTION */}
        <div className="text-center">
          {/* Dynamic title based on action type */}
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {isRestore ? "Restore ?" : "Delete ?"}
          </h3>

          {/* Custom message or default fallback */}
          <p className="text-sm text-gray-500">
            {msg ?? "Are you sure you want to proceed with this action?"}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        {/* Two-button layout: Cancel (safe) and Confirm (action) */}
        <div className="flex gap-3 w-full pt-2">
          {/* Cancel button - always safe, neutral styling */}
          <button
            onClick={closeDialog}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          {/* Confirm button - styling matches action type */}
          <button
            onClick={onClick}
            className={clsx(
              "flex-1 py-2 rounded-lg text-white transition-colors",
              // Color scheme matches the action type
              isRestore
                ? "bg-amber-500 hover:bg-amber-600" // Amber for restore
                : "bg-red-500 hover:bg-red-600", // Red for delete
            )}
          >
            {/* Button text matches action type */}
            {isRestore ? "Restore" : "Delete"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

/**
 * UserAction Component
 *
 * A specialized confirmation modal for user account status changes.
 * This component provides a consistent interface for actions that affect
 * user account states (activate, deactivate, role changes, etc.).
 *
 * Design Rationale:
 * - Blue theme indicates informational/administrative action (not destructive)
 * - Generic messaging since account actions vary in nature
 * - Consistent button layout with main confirmation pattern
 * - Focused on account management workflows
 *
 * @param {boolean} open - Controls modal visibility state
 * @param {function} setOpen - Function to control modal open/closed state
 * @param {function} onClick - Callback function executed when user confirms action
 */
export function UserAction({
  open, // Modal visibility control
  setOpen, // Function to toggle modal
  onClick, // Action to perform on confirmation
}) {
  return (
    // Modal wrapper handles backdrop, positioning, and accessibility
    <ModalWrapper open={open} setOpen={() => setOpen(false)}>
      {/* Main dialog content container */}
      <div className="flex flex-col items-center gap-4 py-2">
        {/* ICON CONTAINER */}
        {/* Blue theme for account-related actions (informational, not destructive) */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600">
          <HiExclamation className="text-blue-500 text-3xl" />
        </div>

        {/* TITLE AND MESSAGE SECTION */}
        <div className="text-center">
          {/* Static title for account status changes */}
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Change Account Status
          </h3>

          {/* Generic confirmation message */}
          <p className="text-sm text-gray-500">
            Please confirm this action before proceeding.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        {/* Consistent two-button layout */}
        <div className="flex gap-3 w-full pt-2">
          {/* Cancel button - safe exit option */}
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          {/* Confirm button - blue theme for account actions */}
          <button
            onClick={onClick}
            className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-[#005a9e] text-white transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

/**
 * COMPONENT SUMMARY
 *
 * These confirmation dialog components provide a consistent user experience
 * for critical actions throughout the application.
 *
 * DESIGN PRINCIPLES:
 * - Color Psychology: Red for destructive, amber for caution, blue for informational
 * - Visual Hierarchy: Icon → Title → Message → Actions
 * - Consistent Layout: Centered content with equal-width buttons
 * - Accessibility: High contrast colors and clear action labels
 *
 * USAGE PATTERNS:
 * - ConfirmationDialog: General-purpose for delete/restore operations
 * - UserAction: Specialized for account management operations
 *
 * INTERACTION FLOW:
 * 1. User triggers action requiring confirmation
 * 2. Modal appears with appropriate styling and message
 * 3. User can cancel (safe) or confirm (executes action)
 * 4. Modal closes and state resets for next use
 *
 * CUSTOMIZATION OPTIONS:
 * - Custom messages for specific contexts
 * - Dynamic styling based on action type
 * - Flexible callback system for different actions
 * - State management integration for complex workflows
 *
 * ACCESSIBILITY FEATURES:
 * - Semantic HTML structure
 * - Keyboard navigation support
 * - High contrast color combinations
 * - Clear action labeling
 * - Focus management within modal
 */
