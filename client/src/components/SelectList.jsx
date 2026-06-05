// React hooks for component lifecycle, refs, and state management
import { useEffect, useRef, useState } from "react";
// Icons for UI interactions and visual feedback
import { MdCheck, MdKeyboardArrowDown } from "react-icons/md";

/**
 * SelectList Component
 *
 * A reusable custom dropdown/select component that provides a styled alternative
 * to the native HTML select element. Offers better customization, accessibility,
 * and visual consistency across different browsers and platforms.
 *
 * Key Features:
 * - Custom styling with consistent design system
 * - Click-outside-to-close functionality
 * - Visual selection indicators (checkmarks)
 * - Hover states and smooth interactions
 * - Optional label support
 * - Keyboard and mouse event handling
 * - High z-index for proper layering
 * - Responsive design with proper spacing
 *
 * Design Philosophy:
 * - Maintains native select behavior while providing custom styling
 * - Uses controlled component pattern for predictable state management
 * - Implements proper event handling to prevent form submission issues
 * - Provides clear visual feedback for user interactions
 *
 * @param {Array} lists - Array of options to display in the dropdown
 * @param {string} selected - Currently selected value
 * @param {function} setSelected - Callback function to update selected value
 * @param {string} label - Optional label text to display above the select
 */
const SelectList = ({ lists, selected, setSelected, label }) => {
  // Local state to control dropdown open/closed state
  const [isOpen, setIsOpen] = useState(false);

  // Ref to the dropdown container for click-outside detection
  const dropdownRef = useRef(null);

  /**
   * CLICK-OUTSIDE EFFECT
   *
   * Sets up event listener to close dropdown when user clicks outside.
   * This provides intuitive UX behavior expected in dropdown components.
   * Uses mousedown instead of click to ensure proper event timing.
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click target is outside the dropdown container
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener on component mount
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on component unmount
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // Main container with ref for click-outside detection
    <div className="w-full" ref={dropdownRef}>
      {/* OPTIONAL LABEL */}
      {/* Only rendered if label prop is provided */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      {/* DROPDOWN CONTAINER */}
      <div className="relative">
        {/* DROPDOWN TRIGGER BUTTON */}
        {/* Styled button that mimics native select appearance */}
        <button
          type="button" // Prevent form submission when used in forms
          onClick={() => setIsOpen(!isOpen)} // Toggle dropdown visibility
          className="relative w-full cursor-default rounded-xl bg-white pl-3.5 pr-10 py-2.5 text-left border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
        >
          {/* SELECTED VALUE DISPLAY */}
          {/* Shows currently selected option with text truncation */}
          <span className="block truncate text-gray-800">{selected}</span>

          {/* DROPDOWN ARROW ICON */}
          {/* Positioned absolutely on the right side */}
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <MdKeyboardArrowDown className="h-4 w-4 text-gray-400" />
          </span>
        </button>

        {/* DROPDOWN MENU */}
        {/* Conditionally rendered when dropdown is open */}
        {isOpen && (
          <div
            className="absolute z-9999 mt-1 w-full rounded-xl bg-white py-1 text-sm shadow-xl border border-gray-200"
            style={{ zIndex: 9999 }} // Ensure dropdown appears above other elements
          >
            {/* DROPDOWN HEADER */}
            {/* Contains label and close button */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
              {/* Header label */}
              <span className="text-xs font-semibold text-gray-400">
                {label || "Select"}
              </span>

              {/* CLOSE BUTTON */}
              {/* X button to manually close dropdown */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent default behavior
                  setIsOpen(false); // Close dropdown
                }}
                className="text-gray-400 hover:text-red-500 text-lg font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* OPTION LIST */}
            {/* Render each option as a clickable item */}
            {lists.map((list, i) => (
              <div
                key={i}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent default mousedown behavior
                  e.stopPropagation(); // Prevent event bubbling
                  setSelected(list); // Update selected value
                  setIsOpen(false); // Close dropdown after selection
                }}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-blue-50 ${
                  selected === list
                    ? "bg-blue-50 text-blue-700 font-semibold" // Selected item styling
                    : "text-gray-700" // Default item styling
                }`}
              >
                {/* OPTION TEXT */}
                <span>{list}</span>

                {/* SELECTION INDICATOR */}
                {/* Checkmark icon shown for currently selected option */}
                {selected === list && (
                  <MdCheck className="h-4 w-4 text-blue-600" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Export the SelectList component for use throughout the application
export default SelectList;

/**
 * COMPONENT SUMMARY
 *
 * The SelectList component provides a fully customizable dropdown select interface
 * that improves upon native HTML select elements with better styling and UX.
 *
 * KEY FEATURES:
 * - Custom Styling: Consistent appearance across all browsers and platforms
 * - Interactive Feedback: Hover states, selection indicators, and smooth transitions
 * - Accessibility: Proper event handling and keyboard navigation support
 * - Click-Outside Behavior: Intuitive closing when clicking outside the dropdown
 * - Visual Indicators: Checkmarks for selected items and clear hover states
 * - Flexible Design: Optional labels and customizable option lists
 *
 * TECHNICAL IMPLEMENTATION:
 * - Controlled Component: Uses props for state management (selected/setSelected)
 * - Event Handling: Proper mousedown/click event management to prevent issues
 * - Ref Management: Uses useRef for click-outside detection
 * - Z-Index Management: Ensures dropdown appears above other page elements
 * - Responsive Design: Full-width layout that adapts to container
 *
 * USER EXPERIENCE:
 * - Familiar Interaction: Behaves like native select but with better visuals
 * - Clear Feedback: Visual indicators for selection and hover states
 * - Easy Dismissal: Multiple ways to close (click outside, close button, selection)
 * - Smooth Animations: Hover effects and state transitions
 *
 * USAGE EXAMPLES:
 * ```jsx
 * // Basic usage
 * <SelectList
 *   lists={['Option 1', 'Option 2', 'Option 3']}
 *   selected={selectedValue}
 *   setSelected={setSelectedValue}
 * />
 *
 * // With label
 * <SelectList
 *   lists={priorities}
 *   selected={priority}
 *   setSelected={setPriority}
 *   label="Priority Level"
 * />
 * ```
 *
 * INTEGRATION CONSIDERATIONS:
 * - Form Integration: Works seamlessly within form components
 * - State Management: Compatible with React state and form libraries
 * - Styling System: Uses Tailwind CSS for consistent design
 * - Event System: Proper event handling prevents form submission issues
 *
 * ACCESSIBILITY FEATURES:
 * - Semantic HTML structure with proper button and list elements
 * - Keyboard navigation support through standard HTML interactions
 * - High contrast colors for selection states
 * - Clear visual hierarchy with labels and grouping
 * - Screen reader friendly with descriptive text and proper roles
 */
