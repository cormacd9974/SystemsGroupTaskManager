// External library imports for styling and utility functions
import clsx from "clsx"; // Utility for conditionally joining CSS class names
import { useState } from "react"; // React hook for component state management

// Icon imports for various UI elements and actions
import { MdDelete, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp, MdOutlineRestore } from "react-icons/md"; // Material Design icons
import { HiOutlineTrash } from "react-icons/hi"; // Heroicon for empty state illustration

// External libraries and internal components
import { toast } from "sonner"; // Toast notification library for user feedback
import { ConfirmationDialog, Loading, Title } from "../components"; // Reusable UI components
import { useDeleteRestoreTaskMutation, useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice"; // RTK Query hooks for API operations
import { TASK_TYPE } from "../utils"; // Utility constants for task styling
import { useSearchParams } from "react-router-dom"; // Hook for URL search parameter access

/**
 * Priority badge styling configuration
 * Maintains visual consistency with other components throughout the application
 * Uses semantic color coding for immediate priority recognition
 */
const PRIORITY_BADGE = { 
    high:"text-red-600 bg-red-50 border border-red-200", // High priority: Red theme for urgency
    medium:"text-amber-600 bg-amber-50 border border-amber-200", // Medium priority: Amber theme for caution
    normal:"text-blue-600 bg-blue-50 border border-blue-200", // Normal priority: Blue theme for standard tasks
    low:"text-slate-500 bg-slate-50 border border-slate-200" // Low priority: Muted slate for less critical tasks
};

/**
 * Priority icon mapping for visual hierarchy reinforcement
 * Uses directional arrows to communicate priority levels intuitively
 */
const PRIORITY_ICON  = { 
    high:<MdKeyboardDoubleArrowUp />, // Double arrow indicates highest urgency
    medium:<MdKeyboardArrowUp />, // Single up arrow for elevated priority
    normal:<MdKeyboardArrowDown />, // Down arrow for standard priority
    low:<MdKeyboardArrowDown /> // Down arrow for low priority
};

/**
 * Trash Component - Manages deleted tasks with restore and permanent deletion capabilities
 * 
 * @component
 * 
 * Architecture decisions:
 * - Soft delete pattern: Tasks are marked as trashed rather than immediately deleted
 * - Bulk operations: Support for restoring or deleting all trashed tasks at once
 * - Confirmation dialogs: Prevents accidental permanent data loss
 * - Search integration: Allows filtering trashed tasks by search terms
 * - Responsive table design: Adapts to various screen sizes
 * 
 * UX considerations:
 * - Clear visual distinction between restore and delete actions
 * - Confirmation dialogs for all destructive operations
 * - Empty state with friendly illustration when trash is empty
 * - Immediate feedback through toast notifications
 * - Bulk action buttons for efficient trash management
 * 
 * Security considerations:
 * - Confirmation required for permanent deletion
 * - Clear messaging about irreversible actions
 * - Separate endpoints for different operation types
 * - User feedback for all state changes
 * 
 * Business context:
 * - Provides safety net for accidentally deleted tasks
 * - Enables task recovery workflow
 * - Supports data retention policies
 * - Facilitates cleanup of old deleted tasks
 * 
 * @returns {JSX.Element} Trash management interface with restore and delete capabilities
 */
const Trash = () => {
  /**
   * State management for dialog interactions and user actions
   */
  
  // Controls confirmation dialog visibility for all operations
  const [openDialog, setOpenDialog] = useState(false);

  // Dynamic message content for confirmation dialog based on action type
  const [msg, setMsg] = useState(null);

  // Tracks the current operation type: delete, restore, deleteAll, restoreAll
  const [type, setType] = useState("delete");

  // Stores the selected task ID for single-item operations
  const [selected, setSelected] = useState("");

  /**
   * URL parameter integration for search functionality
   * Enables filtering trashed tasks by search terms
   */
  
  // Extract search parameters from URL for persistent search state
  const [searchParams] = useSearchParams();

  // Maintain search term in local state for API queries
  const [searchTerm] = useState(searchParams.get("search")||"");

  /**
   * API integration for data fetching and mutations
   */
  
  // Fetch trashed tasks with search filtering
  // isTrashed: "true" specifically requests deleted tasks
  const { data, isLoading, refetch } = useGetAllTaskQuery({ 
    strQuery:"", // No stage filtering for trash view
    isTrashed:"true", // Only fetch trashed tasks
    search:searchTerm // Apply search filtering
  });

  // Mutation hook for delete and restore operations
  const [deleteRestoreTask] = useDeleteRestoreTaskMutation();

  /**
   * Action handlers for different operation types
   * Each handler configures the confirmation dialog with appropriate messaging
   */
  
  // Bulk delete all trashed tasks permanently
  // Security: Requires explicit confirmation due to irreversible nature
  const deleteAllClick = () => { 
    setType("deleteAll"); 
    setMsg("This will permanently delete ALL trashed tasks."); 
    setOpenDialog(true); 
  };

  // Bulk restore all trashed tasks to active state
  // UX: Clear messaging about the scope of the operation
  const restoreAllClick = () => { 
    setType("restoreAll"); 
    setMsg("All trashed tasks will be restored."); 
    setOpenDialog(true); 
  };

  // Single task permanent deletion
  // Security: Confirmation required even for single items
  const deleteClick = (id) => { 
    setType("delete"); 
    setSelected(id); 
    setOpenDialog(true); 
  };

  // Single task restoration
  // UX: Clear messaging about what will happen to the task
  const restoreClick = (id) => { 
    setType("restore"); 
    setSelected(id); 
    setMsg("This task will be restored from trash."); 
    setOpenDialog(true); 
  };

  /**
   * Unified handler for all delete/restore operations
   * 
   * Architecture: Single handler manages multiple operation types for consistency
   * Error handling: Comprehensive try-catch with user-friendly error messages
   * UX: Delayed dialog close allows users to see success message
   */
  const deleteRestoreHandler = async () => {
    try {
      let res;
      
      // Route to appropriate API operation based on action type
      if (type==="delete")     res = await deleteRestoreTask({ id:selected, actionType:"delete" }).unwrap();
      if (type==="deleteAll")  res = await deleteRestoreTask({ id:"", actionType:"deleteAll" }).unwrap();
      if (type==="restore")    res = await deleteRestoreTask({ id:selected, actionType:"restore" }).unwrap();
      if (type==="restoreAll") res = await deleteRestoreTask({ id:"", actionType:"restoreAll" }).unwrap();
      
      // Provide user feedback and refresh data
      toast.success(res?.message);
      
      // Delayed dialog close and data refresh for better UX
      setTimeout(() => { 
        setOpenDialog(false); 
        refetch(); // Refresh trash data to reflect changes
      }, 500);
    } catch (err) { 
      // Handle errors with user-friendly messages
      toast.error(err?.data?.message||err.error); 
    }
  };

  /**
   * Loading state handling
   * Provides user feedback during initial data fetch
   */
  return isLoading ? (
    <div className="py-16 flex justify-center">
      <Loading />
    </div>
  ) : (
    <>
      <div className="space-y-4">
        {/* Page header with title, count, and bulk action buttons */}
        {/* Design: Clear hierarchy with information on left, actions on right */}
        <div className="flex items-center justify-between">
          <div>
            <Title title="Trash" />
            {/* Task count provides immediate context about trash contents */}
            <p className="text-sm text-gray-400 mt-0.5">
              {data?.tasks?.length||0} deleted tasks
            </p>
          </div>
          
          {/* Bulk action buttons - only shown when tasks exist */}
          {/* Conditional rendering: Prevents confusion when trash is empty */}
          {data?.tasks?.length>0 && (
            <div className="flex gap-2">
              {/* Restore All button with semantic blue styling */}
              <button 
                onClick={restoreAllClick} 
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200"
              >
                <MdOutlineRestore />
                Restore All
              </button>
              
              {/* Delete All button with semantic red styling for destructive action */}
              <button 
                onClick={deleteAllClick} 
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200"
              >
                <MdDelete />
                Delete All
              </button>
            </div>
          )}
        </div>

        {/* Main content: Task table or empty state */}
        {/* Conditional rendering based on whether trashed tasks exist */}
        {data?.tasks?.length>0 ? (
          // Task table when trashed tasks exist
          // Design: Card-based container with responsive table inside
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Horizontal scroll container for mobile responsiveness */}
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                {/* Table header with column labels */}
                <thead>
                  <tr>
                    <th>Task Title</th> {/* Primary task identification */}
                    <th>Priority</th> {/* Priority level for context */}
                    <th>Stage</th> {/* Workflow stage when deleted */}
                    <th>Deleted On</th> {/* Deletion timestamp */}
                    <th className="text-right">Actions</th> {/* Restore/delete actions */}
                  </tr>
                </thead>
                
                <tbody>
                  {data?.tasks?.map((item,i) => (
                    <tr key={i}>
                      {/* Task title cell with stage indicator */}
                      <td>
                        <div className="flex items-center gap-2.5">
                          {/* Stage indicator dot with dynamic color */}
                          <div className={clsx("w-2.5 h-2.5 rounded-full shrink-0", TASK_TYPE[item.stage])} />
                          
                          {/* Task title with truncation for layout stability */}
                          <p className="font-medium text-gray-800 text-sm line-clamp-1">{item?.title}</p>
                        </div>
                      </td>

                      {/* Priority badge with icon and text */}
                      <td>
                        <span className={clsx("badge flex items-center gap-1 w-fit text-xs", PRIORITY_BADGE[item?.priority])}>
                          {PRIORITY_ICON[item?.priority]}
                          <span className="capitalize">{item?.priority}</span>
                        </span>
                      </td>

                      {/* Task stage at time of deletion */}
                      <td>
                        <span className="text-xs capitalize text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                          {item?.stage}
                        </span>
                      </td>

                      {/* Deletion date for reference */}
                      <td className="text-gray-400 text-xs">
                        {new Date(item?.updatedAt).toDateString()}
                      </td>

                      {/* Action buttons for individual tasks */}
                      <td>
                        <div className="flex items-center gap-2 justify-end">
                          {/* Restore button with blue styling for positive action */}
                          <button 
                            onClick={() => restoreClick(item._id)} 
                            title="Restore" 
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <MdOutlineRestore className="text-lg" />
                          </button>
                          
                          {/* Delete button with red styling for destructive action */}
                          <button 
                            onClick={() => deleteClick(item._id)} 
                            title="Delete" 
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <MdDelete className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Empty state when no trashed tasks exist
          // UX: Friendly illustration and message instead of blank space
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
            {/* Empty state icon */}
            <HiOutlineTrash className="text-5xl text-gray-200" />
            
            {/* Empty state message */}
            <p className="text-base font-semibold text-gray-400">Trash is empty</p>
          </div>
        )}
      </div>

      {/* Confirmation dialog for all delete/restore operations */}
      {/* Security: Prevents accidental data loss through explicit confirmation */}
      <ConfirmationDialog 
        open={openDialog} 
        setOpen={setOpenDialog} 
        msg={msg} 
        setMsg={setMsg} 
        type={type} 
        setType={setType} 
        onClick={deleteRestoreHandler} 
      />
    </>
  );
};

/**
 * Export the Trash component as default export
 * 
 * Component Summary:
 * - Comprehensive trash management with restore and permanent deletion capabilities
 * - Bulk operations for efficient trash cleanup and recovery
 * - Search integration for filtering trashed tasks
 * - Confirmation dialogs for all destructive operations
 * - Empty state handling with friendly user messaging
 * 
 * Key Features:
 * - Soft delete pattern with recovery capabilities
 * - Individual and bulk restore operations
 * - Individual and bulk permanent deletion
 * - Search filtering for large trash collections
 * - Visual priority and stage indicators for context
 * - Deletion timestamps for reference
 * - Confirmation dialogs preventing accidental data loss
 * 
 * Data Integration:
 * - RTK Query for efficient data fetching and mutations
 * - URL search parameter integration for persistent filtering
 * - Real-time updates through refetch mechanisms
 * - Comprehensive error handling with user feedback
 * 
 * UX Design Principles:
 * - Clear visual distinction between restore (blue) and delete (red) actions
 * - Confirmation required for all destructive operations
 * - Immediate feedback through toast notifications
 * - Empty state provides context when no data exists
 * - Responsive table design for various screen sizes
 * 
 * Security Considerations:
 * - Explicit confirmation for permanent deletion operations
 * - Clear messaging about irreversible actions
 * - Separate API endpoints for different operation types
 * - User feedback for all state changes and errors
 * 
 * Business Value:
 * - Provides safety net for accidentally deleted tasks
 * - Enables efficient trash management and cleanup
 * - Supports data retention and recovery policies
 * - Facilitates bulk operations for administrative efficiency
 * - Maintains task history and context even after deletion
 * 
 * Architecture Patterns:
 * - Unified handler for multiple operation types
 * - Conditional rendering based on data availability
 * - Modal pattern for confirmation dialogs
 * - Responsive design with mobile-first approach
 * - Consistent styling with application design system
 */
export default Trash;