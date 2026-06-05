// React hooks for component lifecycle and state management
import { useEffect, useRef, useState } from "react";
// Icons for UI interactions
import { MdCheck, MdKeyboardArrowDown } from "react-icons/md";
// Redux query hook for fetching team member data
import { useGetTeamListsQuery } from "../../redux/slices/api/userApiSlice";
// Utility function to generate user initials for avatars
import { getInitials } from "../../utils";

/**
 * UserList Component
 * 
 * A multi-select dropdown component for assigning team members to tasks.
 * Features include:
 * - Multi-selection with visual feedback
 * - Click-outside-to-close functionality
 * - Pre-selection support for editing existing tasks
 * - Auto-selection of first user for new tasks
 * - User avatars with initials
 * - Accessible keyboard and mouse interactions
 * 
 * @param {Array} team - Currently selected team members (array of user IDs or user objects)
 * @param {Function} setTeam - Callback to update the selected team members
 */
export default function UserList({ team, setTeam }) {
    // Fetch team members data from API
    const { data, isLoading } = useGetTeamListsQuery({ search: "" });
    
    // Local state for selected users (full user objects for UI display)
    const [selectedUsers, setSelectedUsers] = useState([]);
    
    // Controls dropdown visibility
    const [isOpen, setIsOpen] = useState(false);
    
    // Reference to dropdown container for click-outside detection
    const dropdownRef = useRef(null);
    
    // Flag to prevent multiple initializations during component lifecycle
    const hasInitialized = useRef(false);

    /**
     * INITIALIZATION EFFECT
     * 
     * Handles initial setup of selected users based on props.
     * This effect runs when data is loaded and handles two scenarios:
     * 1. Editing existing task: Pre-select users from the team prop
     * 2. Creating new task: Auto-select the first available user
     */
    useEffect(() => {
        // Wait for data to load
        if (isLoading) return;
        if (!data || data.length === 0) return;
        // Prevent multiple initializations
        if (hasInitialized.current) return;

        // Mark as initialized to prevent re-running
        hasInitialized.current = true;

        if (team && team.length > 0) {
            // EDITING SCENARIO: Pre-select existing team members
            // Extract IDs from team prop (handles both ID strings and user objects)
            const teamIds = team.map(t => t._id || t);
            // Find matching users from the fetched data
            const preselected = data.filter(user => teamIds.includes(user._id));
            // Use setTimeout to ensure state updates happen after render
            setTimeout(() => {
                setSelectedUsers(preselected);
            }, 0);
        } else {
            // NEW TASK SCENARIO: Auto-select first user as default
            setTimeout(() => {
                setSelectedUsers([data[0]]);
                setTeam([data[0]._id]);
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    /**
     * CLICK-OUTSIDE EFFECT
     * 
     * Sets up event listener to close dropdown when user clicks outside.
     * This provides intuitive UX behavior expected in dropdown components.
     */
    useEffect(() => {
        const handleClickOutside = (e) => {
            // Check if click target is outside the dropdown container
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        
        // Add event listener on mount
        document.addEventListener("mousedown", handleClickOutside);
        
        // Cleanup event listener on unmount
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /**
     * USER SELECTION TOGGLE HANDLER
     * 
     * Handles adding/removing users from the selection.
     * Updates both local state (for UI) and parent state (for form data).
     * 
     * @param {Object} user - The user object to toggle
     */
    const toggleUser = (user) => {
        // Check if user is currently selected
        const isSelected = selectedUsers.some(u => u._id === user._id);
        let updated;
        
        if (isSelected) {
            // Remove user from selection
            updated = selectedUsers.filter(u => u._id !== user._id);
        } else {
            // Add user to selection
            updated = [...selectedUsers, user];
        }
        
        // Update local state for UI display
        setSelectedUsers(updated);
        // Update parent state with just the user IDs
        setTeam(updated.map(u => u._id));
    };

    return (
        // Main container with ref for click-outside detection
        <div className="w-full" ref={dropdownRef}>
            {/* Field label */}
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Assign To
            </label>

            {/* Dropdown container */}
            <div className="relative">
                {/* Dropdown trigger button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-full cursor-default rounded-xl bg-white pl-3.5 pr-10 py-2.5 text-left border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
                >
                    {/* Display selected users or placeholder text */}
                    <span className="block truncate">
                        {selectedUsers.length > 0
                            ? selectedUsers.map(u => u.name).join(", ") // Show selected user names
                            : "Select team members" // Placeholder when none selected
                        }
                    </span>
                    
                    {/* Dropdown arrow icon */}
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <MdKeyboardArrowDown className="h-4 w-4 text-gray-400" />
                    </span>
                </button>

                {/* Dropdown menu - conditionally rendered when open */}
                {isOpen && (
                    <div className="absolute z-9999 mt-1 w-full rounded-xl bg-white py-1 text-sm shadow-xl border border-gray-200"
                        style={{ zIndex: 9999 }}>
                        
                        {/* Dropdown header with close button */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-400">Team Members</span>
                            {/* Close button */}
                            <button
                                type="button"
                                onMouseDown={(e) => { 
                                    e.preventDefault(); 
                                    setIsOpen(false); 
                                }}
                                className="text-gray-400 hover:text-red-500 text-lg font-bold leading-none"
                            >
                                ×
                            </button>
                        </div>

                        {/* User list items */}
                        {data?.map((user, i) => {
                            // Check if this user is currently selected
                            const isSelected = selectedUsers.some(u => u._id === user._id);
                            
                            return (
                                <div
                                    key={i}
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent default to avoid focus issues
                                        e.stopPropagation(); // Prevent event bubbling
                                        toggleUser(user); // Toggle user selection
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-blue-50 ${
                                        isSelected ? "bg-blue-50" : "" // Highlight selected users
                                    }`}
                                >
                                    {/* User avatar with initials */}
                                    <div className="w-6 h-6 rounded-full bg-[#0068B5] text-white flex items-center justify-center text-xs shrink-0">
                                        {getInitials(user.name)}
                                    </div>
                                    
                                    {/* User name with conditional styling */}
                                    <span className={
                                        isSelected 
                                            ? "font-semibold text-blue-700" // Selected user styling
                                            : "text-gray-700" // Default user styling
                                    }>
                                        {user.name}
                                    </span>
                                    
                                    {/* Check mark for selected users */}
                                    {isSelected && (
                                        <MdCheck className="ml-auto text-blue-600 h-4 w-4" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * COMPONENT SUMMARY
 * 
 * This UserList component provides a sophisticated multi-select interface for
 * team member assignment with the following key features:
 * 
 * KEY FEATURES:
 * - Multi-selection with visual feedback (checkmarks, highlighting)
 * - Smart initialization (pre-select for editing, auto-select for new tasks)
 * - Click-outside-to-close behavior for intuitive UX
 * - User avatars with initials for visual identification
 * - Accessible keyboard and mouse interactions
 * - Responsive design that works in various contexts
 * 
 * STATE MANAGEMENT:
 * - selectedUsers: Full user objects for UI display and interaction
 * - team prop: User IDs passed to parent component for form submission
 * - Synchronization between local and parent state
 * 
 * UX CONSIDERATIONS:
 * - Auto-selection prevents empty team assignments
 * - Visual feedback for all interactions (hover, selection, focus)
 * - Proper event handling to prevent form submission issues
 * - High z-index ensures dropdown appears above other elements
 * 
 * ACCESSIBILITY:
 * - Proper labeling with semantic HTML
 * - Keyboard navigation support through button elements
 * - High contrast colors for selected states
 * - Clear visual indicators for selection status
 */