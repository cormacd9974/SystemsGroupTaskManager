// External library imports for styling, state management, and UI components
import clsx from "clsx"; // Utility for conditionally joining CSS class names
import { useState } from "react"; // React hook for managing component state
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from "react-icons/md"; // Material Design icons for priority indicators
import { HiPencil, HiTrash } from "react-icons/hi"; // Heroicons for action buttons (edit/delete)
import { toast } from "sonner"; // Toast notification library for user feedback

// Internal imports for API integration, utilities, and components
import { useTrashTaskMutation } from "../redux/slices/api/taskApiSlice"; // RTK Query mutation hook for task deletion
import { TASK_TYPE, formatDate, CATEGORY_LABEL } from "../utils"; // Utility constants and helper functions
import { ConfirmationDialog, UserInfo } from "./index"; // Reusable UI components
import { AddTask } from "./tasks"; // Task creation/editing modal component
import { Link } from "react-router-dom"; // React Router for navigation

/**
 * Priority badge styling configuration
 * Maps priority levels to Tailwind CSS classes for consistent visual hierarchy
 * Design decision: Uses semantic colors (red=urgent, amber=medium, blue=normal, slate=low)
 * to provide immediate visual context about task importance
 */
const PRIORITY_BADGE = {
    high: "text-red-600 bg-red-50 border border-red-200", // High priority: Red theme for urgency
    medium: "text-amber-600 bg-amber-50 border border-amber-200", // Medium priority: Amber theme for caution
    normal: "text-blue-600 bg-blue-50 border border-blue-200", // Normal priority: Blue theme for standard tasks
    low: "text-slate-500 bg-slate-50 border border-slate-200" // Low priority: Muted slate for less important tasks
};

/**
 * Priority icon mapping for visual reinforcement
 * Uses directional arrows to reinforce priority hierarchy through iconography
 * UX consideration: Icons provide quick visual scanning for priority levels
 */
const PRIORITY_ICON = {
    high: <MdKeyboardDoubleArrowUp />, // Double up arrow for highest urgency
    medium: <MdKeyboardArrowUp />, // Single up arrow for elevated priority
    normal: <MdKeyboardArrowDown />, // Down arrow for standard priority
    low: <MdKeyboardArrowDown /> // Down arrow for low priority (same as normal for simplicity)
};

/**
 * Table Component - Displays tasks in a structured tabular format
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of task objects to display
 * 
 * Architecture decisions:
 * - Uses semantic HTML table for accessibility and screen reader support
 * - Implements responsive design with hidden columns on mobile
 * - Separates concerns: display logic, state management, and API calls
 * - Uses compound component pattern with modals for complex interactions
 * 
 * Performance considerations:
 * - Limits team member avatars to 3 visible + count for large teams
 * - Uses React keys for efficient list rendering
 * - Implements optimistic UI updates with toast feedback
 * 
 * @returns {JSX.Element} Rendered table component with task data
 */
const Table = ({ tasks, refetch }) => {
    /**
     * State management for modal and dialog interactions
     * Separates concerns between different UI states for maintainability
     */
    
    // Controls delete confirmation dialog visibility
    // UX: Prevents accidental deletions with confirmation step
    const [openDialog, setOpenDialog] = useState(false);

    // Stores the currently selected task or task ID depending on action
    // Design pattern: Single state for multiple selection contexts (edit vs delete)
    const [selected, setSelected] = useState(null);

    // Controls edit modal visibility
    // Separates edit state from delete state for cleaner component logic
    const [openEdit, setOpenEdit] = useState(false);

    /**
     * RTK Query mutation hook for task deletion
     * Benefits: Automatic loading states, error handling, and cache invalidation
     * API integration: Connects to backend trash/delete endpoint
     */
    const [deleteTask] = useTrashTaskMutation();

    /**
     * Handles task deletion with user feedback and UI updates
     * 
     * UX considerations:
     * - Provides immediate feedback via toast notifications
     * - Implements optimistic UI updates with fallback error handling
     * - Uses setTimeout to allow users to see success message before refresh
     * 
     * Technical decisions:
     * - Uses window.location.reload() for simplicity (could be optimized with cache updates)
     * - Implements proper error handling with user-friendly messages
     */
    const deleteHandler = async () => {
        try {
            // Execute delete mutation and unwrap the promise for direct result access
            const res = await deleteTask({ id: selected }).unwrap();
            
            // Show success feedback to user
            toast.success(res?.message);

            // Close dialog and refresh the page so UI updates
            // Performance note: Could be optimized by updating RTK Query cache instead of full reload
            setTimeout(() => {
                setOpenDialog(false);
                refetch();
            }, 500);
        } catch (err) {
            // Handle and display error messages with fallback text
            toast.error(err?.data?.message || err.error);
        }
    };

    return (
        <>
            {/* Main table container with modern card-like styling */}
            {/* Design decision: Uses rounded corners and subtle shadows for modern appearance */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Horizontal scroll container for responsive table on mobile devices */}
                {/* Accessibility: Maintains table structure while allowing horizontal scrolling */}
                <div className="overflow-x-auto">
                    <table className="w-full data-table">
                        {/* Table header with semantic column labels */}
                        {/* UX: Clear, concise headers that match user mental models */}
                        <thead>
                            <tr>
                                <th>Task</th> {/* Primary task information */}
                                <th>Category</th> {/* Task categorization for filtering/organization */}
                                <th>Priority</th> {/* Visual priority indicators */}
                                <th>Team</th> {/* Assigned team members */}
                                <th className="hidden md:table-cell">Created</th> {/* Responsive: Hidden on mobile to save space */}
                                <th className="text-right">Actions</th> {/* Right-aligned for visual balance */}
                            </tr>
                        </thead>

                        <tbody>
                            {/* Iterate through tasks array to render table rows */}
                            {/* Performance: Uses index as key (acceptable for static lists) */}
                            {tasks?.map((task) => (
                                <tr key={task._id}>
                                    {/* Task title cell with navigation and stage indicator */}
                                    <td>
                                        {/* Link to task detail page with hover effects */}
                                        {/* UX: Entire cell is clickable for better usability */}
                                        <Link to={`/task/${task._id}`} className="group flex items-center gap-2">
                                            {/* Stage indicator dot with dynamic color based on task stage */}
                                            {/* Visual design: Small colored dot provides quick stage identification */}
                                            <div className={clsx("w-2.5 h-2.5 rounded-full shrink-0", TASK_TYPE[task.stage])} />
                                            
                                            {/* Task title with truncation and hover effects */}
                                            {/* Accessibility: Maintains readable text while preventing layout breaks */}
                                            <span className="font-medium text-gray-800 group-hover:text-blue-600 text-xs line-clamp-1">
                                                {task?.title}
                                            </span>
                                        </Link>
                                    </td>

                                    {/* Category display with pill-style badge */}
                                    <td>
                                        {/* Design pattern: Consistent badge styling across the application */}
                                        {/* Fallback handling: Shows raw category or dash if no label mapping exists */}
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                            {CATEGORY_LABEL[task?.category] || task?.category || "-"}
                                        </span>
                                    </td>

                                    {/* Priority badge with icon and color coding */}
                                    <td>
                                        {/* Combines icon and text for comprehensive priority communication */}
                                        {/* Accessibility: Both visual (color/icon) and textual (label) indicators */}
                                        <span className={clsx("badge flex items-center gap-1 w-fit text-xs", PRIORITY_BADGE[task?.priority])}>
                                            {PRIORITY_ICON[task?.priority]}
                                            <span className="capitalize">{task?.priority}</span>
                                        </span>
                                    </td>

                                    {/* Team member avatars with overflow handling */}
                                    <td>
                                        {/* Overlapping avatar design for space efficiency */}
                                        {/* Performance: Limits display to first 3 members to prevent UI overflow */}
                                        <div className="flex -space-x-1 items-center">
                                            {task?.team?.slice(0, 3).map((m, idx) => (
                                                <div key={idx} 
                                                className="w-12 h-12 rounded-full text-white flex items-center justify-center text-xs border-2 border-white font-bold" 
                                                // Dynamic background colors from predefined palette
                                                // Design decision: Uses consistent color rotation for visual variety
                                                style={{ backgroundColor: ["#0068B5", "#005a9e", "#004f8c", "#0079cc", "#0086e0", "#003d6b", "#0057a0", "#0073c6"][idx % 8] }}
                                                title={m?.name} // Accessibility: Tooltip shows full name on hover
                                                >
                                                    {/* UserInfo component handles avatar display logic */}
                                                    <UserInfo user={m} />
                                                </div>
                                            ))}

                                            {/* Overflow indicator for teams with more than 3 members */}
                                            {/* UX: Shows count of additional team members without cluttering UI */}
                                            {task?.team?.length > 3 && (
                                                <div className="w-12 h-12 rounded-full text-white flex items-center justify-center text-xs border-2 border-white font-bold"
                                                style={{ backgroundColor: "#003d6b"}}>
                                                    +{task.team.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Task creation date - hidden on mobile for space optimization */}
                                    
                                    <td className="hidden md:table-cell text-gray-400 text-xs">
                                        {/* Uses utility function for consistent date formatting across app */}
                                        {formatDate(new Date(task?.date))}
                                    </td>

                                    {/* Action buttons for task operations */}
                                    <td>
                                        {/* Right-aligned button group for visual consistency */}
                                        <div className="flex items-center gap-2 justify-end">
                                            {/* Edit button - opens task in edit mode */}
                                            {/* UX: Blue color indicates primary action, icon reinforces function */}
                                            <button
                                                onClick={() => { 
                                                    setSelected(task); // Store entire task object for editing
                                                    setOpenEdit(true); 
                                                }}
                                                className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium"
                                            >
                                                <HiPencil /> Edit
                                            </button>
                                            
                                            {/* Delete button - opens confirmation dialog */}
                                            {/* UX: Red color indicates destructive action, requires confirmation */}
                                            <button
                                                onClick={() => { 
                                                    setSelected(task._id); // Store only ID for deletion
                                                    setOpenDialog(true); 
                                                }}
                                                className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-medium"
                                            >
                                                <HiTrash /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete confirmation dialog */}
            {/* UX Pattern: Prevents accidental deletions with explicit confirmation step */}
            {/* Accessibility: Modal dialog with proper focus management */}
            <ConfirmationDialog
                open={openDialog}
                setOpen={setOpenDialog}
                onClick={deleteHandler}
            />

            {/* Edit task modal */}
            {/* Conditional rendering: Only mounts when editing is active for performance */}
            {/* Key prop ensures component remounts when editing different tasks */}
            {openEdit && <AddTask open={openEdit} setOpen={setOpenEdit} task={selected} key={selected?._id} />}
        </>
    );
};

/**
 * Export the Table component as default export
 * 
 * Component Summary:
 * - Displays tasks in a responsive, accessible table format
 * - Integrates with Redux for state management and API calls
 * - Provides inline editing and deletion capabilities
 * - Implements modern UI patterns with proper user feedback
 * - Handles team member display with overflow management
 * - Uses semantic HTML and proper accessibility attributes
 * 
 * Usage Pattern:
 * <Table tasks={taskArray} />
 * 
 * Dependencies:
 * - Requires tasks array prop with specific task object structure
 * - Depends on Redux store setup with taskApiSlice
 * - Needs routing context for navigation links
 * - Requires utility constants (TASK_TYPE, CATEGORY_LABEL) to be defined
 */
export default Table;