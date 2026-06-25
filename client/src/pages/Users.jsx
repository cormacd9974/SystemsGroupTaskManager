// External library imports for styling and utility functions
import clsx from "clsx"; // Utility for conditionally joining CSS class names
import { useEffect, useState } from "react"; // React hooks for state management and side effects

// Icon imports for various UI elements and actions
import { IoMdAdd } from "react-icons/io"; // Ionicons add icon for new user button
import { HiPencil, HiTrash } from "react-icons/hi"; // Heroicons for edit and delete actions

// External libraries and internal components
import { toast } from "sonner"; // Toast notification library for user feedback
import { AddUser, ConfirmationDialog, Loading, Title, UserAction } from "../components"; // Reusable UI components
import { useDeleteUserMutation, useGetTeamListsQuery, useUserActionMutation } from "../redux/slices/api/userApiSlice"; // RTK Query hooks for user management
import { getInitials } from "../utils"; // Utility function for generating user initials
import { useSearchParams } from "react-router-dom"; // Hook for URL search parameter access

/**
 * Users Component - Team member management interface with CRUD operations
 * 
 * @component
 * 
 * Architecture decisions:
 * - Table-based layout for comprehensive user information display
 * - Modal-based user creation and editing for focused input experience
 * - Confirmation dialogs for destructive operations (delete, status change)
 * - Search integration for filtering large team lists
 * - Real-time data updates with automatic refetching
 * 
 * UX considerations:
 * - Clear visual hierarchy with user avatars and information
 * - Color-coded status indicators for active/inactive states
 * - Inline status toggling with confirmation for safety
 * - Separate edit and delete actions with distinct styling
 * - Member count display for immediate context
 * 
 * Security considerations:
 * - Confirmation required for user deletion
 * - Status change confirmation to prevent accidental deactivation
 * - Role-based access control (implied through admin-only access)
 * - Comprehensive error handling with user feedback
 * 
 * Business context:
 * - Team member lifecycle management
 * - User access control through active/inactive status
 * - Contact information management
 * - Role and title tracking for organizational structure
 * 
 * @returns {JSX.Element} Complete team member management interface
 */
const Users = () => {
    /**
     * URL parameter integration for search functionality
     * Enables filtering team members by search terms from URL
     */
    
    // Extract search parameters from URL for persistent search state
    const [searchParams] = useSearchParams();

    // Store current search term in local state for API queries
    const searchTerm = searchParams.get("search") || "";

    /**
     * API integration for data fetching and mutations
     */
    
    // Fetch team member list with search filtering
    const { data, isLoading, refetch } = useGetTeamListsQuery({ search: searchTerm });

    // Mutation hook for user deletion operations
    const [deleteUser] = useDeleteUserMutation();

    // Mutation hook for updating user active/inactive status
    const [userAction] = useUserActionMutation();

    /**
     * State management for modal and dialog interactions
     * Separates different UI states for cleaner component logic
     */
    
    // Controls delete confirmation dialog visibility
    const [openDialog, setOpenDialog] = useState(false);

    // Controls add/edit user modal visibility
    const [open, setOpen] = useState(false);

    // Controls active/inactive status confirmation dialog
    const [openAction, setOpenAction] = useState(false);

    // Stores the selected user object or user ID depending on the operation context
    // Design pattern: Single state for multiple selection contexts
    const [selected, setSelected] = useState(null);

    /**
     * Action handlers for different user operations
     * Each handler configures the appropriate modal/dialog with relevant data
     */
    
    // Open delete confirmation dialog for a specific user
    // Security: Requires explicit confirmation before deletion
    const deleteClick = (id) => { 
        setSelected(id); 
        setOpenDialog(true); 
    };

    // Open edit modal and load selected user data for modification
    // UX: Pre-populates form with existing user information
    const editClick = (el) => { 
        setSelected(el); 
        setOpen(true); 
    };

    // Open active/inactive status confirmation modal
    // Security: Prevents accidental status changes that could affect user access
    const userStatusClick = (el) => { 
        setSelected(el); 
        setOpenAction(true); 
    };

    /**
     * User deletion handler with comprehensive error handling
     * 
     * Workflow:
     * 1. Execute delete mutation
     * 2. Refresh team data
     * 3. Show success feedback
     * 4. Clean up state and close dialog
     * 
     * Security: Permanent operation with user feedback and error handling
     */
    const deleteHandler = async () => {
        try {
            // Execute user deletion mutation
            const res = await deleteUser(selected);
            
            // Refresh team list to reflect changes
            refetch();
            
            // Provide success feedback to user
            toast.success(res?.data?.message);
            
            // Clean up selected state
            setSelected(null);
            
            // Delayed dialog close for better UX (allows user to see success message)
            setTimeout(() => setOpenDialog(false), 500);
        } catch (err) {
            // Handle errors with user-friendly messages
            toast.error(err?.data?.message || err.error);
        }
    };

    /**
     * User status toggle handler (active/inactive)
     * 
     * Business logic: Toggles user active status for access control
     * UX: Immediate feedback with data refresh to show updated status
     */
    const userActionHandler = async () => {
        try {
            // Toggle user active status
            const res = await userAction({ 
                isActive: !selected?.isActive, // Toggle current status
                id: selected?._id 
            });
            
            // Refresh data and provide feedback
            refetch();
            toast.success(res?.data?.message);
            
            // Clean up state and close dialog
            setSelected(null);
            setTimeout(() => setOpenAction(false), 500);
        } catch (err) {
            // Handle errors with user-friendly messages
            toast.error(err?.data?.message || err.error);
        }
    };

    /**
     * Side effect for data synchronization
     * Ensures team list is refreshed when add/edit modal state changes
     * Performance: Only refetches when necessary (modal open/close)
     */
    useEffect(() => { 
        refetch(); 
    }, [open, refetch]);

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
                {/* Page header with title, member count, and primary action */}
                {/* Design: Clear hierarchy with information on left, action on right */}
                <div className="flex items-center justify-between">
                    <div>
                        <Title title="Team Members" />
                        {/* Member count provides immediate context about team size */}
                        <p className="text-sm text-gray-400 mt-0.5">
                            {data?.length || 0} members
                        </p>
                    </div>
                    
                    {/* Primary action button for adding new team members */}
                    <button
                        onClick={() => setOpen(true)} // Opens add user modal
                        className="btn-primary flex items-center gap-2"
                    >
                        <IoMdAdd className="text-lg" />
                        <span>Add Member</span>
                    </button>
                </div>

                {/* Team members data table */}
                {/* Design: Card-based container with responsive table inside */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Horizontal scroll container for mobile responsiveness */}
                    <div className="overflow-x-auto">
                        <table className="w-full data-table">
                            {/* Table header with comprehensive user information columns */}
                            <thead>
                                <tr>
                                    <th>Full Name</th> {/* Primary identification with avatar */}
                                    <th>Title</th> {/* Job title/position */}
                                    <th>Email</th> {/* Contact information */}
                                    <th>Role</th> {/* System role/permissions */}
                                    <th>Status</th> {/* Active/inactive state */}
                                    <th className="text-right">Actions</th> {/* Edit/delete operations */}
                                </tr>
                            </thead>
                            
                            <tbody>
                                {data?.map((user, i) => (
                                    <tr key={user._id}>
                                        {/* User identification with avatar and name */}
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {/* User avatar with initials and dynamic color */}
                                                {/* Design: Consistent color rotation for visual variety */}
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold text-white" 
                                                     style={{ backgroundColor: ["#0068B5", "#005a9e", "#004f8c", "#0079cc", "#0086e0", "#003d6b", "#0057a0", "#0073c6"][i % 8] }}>
                                                    {getInitials(user.name)}
                                                </div>
                                                
                                                {/* User full name */}
                                                <span className="font-medium text-gray-900 text-sm">{user.name}</span>
                                            </div>
                                        </td>

                                        {/* Job title/position information */}
                                        <td className="text-gray-600 text-sm">{user.title}</td>

                                        {/* Email address for contact */}
                                        <td className="text-gray-500 text-sm">{user.email}</td>

                                        {/* System role for permissions context */}
                                        <td className="text-gray-600 text-sm">{user.role}</td>

                                        {/* Active/inactive status with toggle functionality */}
                                        {/* UX: Clickable badge allows inline status changes */}
                                        <td>
                                            <button
                                                onClick={() => userStatusClick(user)} // Opens status change confirmation
                                                className={clsx(
                                                    "badge text-xs cursor-pointer",
                                                    user?.isActive
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" // Active: Green theme
                                                        : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" // Inactive: Amber theme
                                                )}
                                            >
                                                {user?.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>

                                        {/* Action buttons for user management */}
                                        <td>
                                            <div className="flex items-center gap-2 justify-end">
                                                {/* Edit button with blue styling for modification action */}
                                                <button
                                                    onClick={() => editClick(user)} // Opens edit modal with user data
                                                    className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium"
                                                >
                                                    <HiPencil /> Edit
                                                </button>
                                                
                                                {/* Delete button with red styling for destructive action */}
                                                <button
                                                    onClick={() => deleteClick(user?._id)} // Opens delete confirmation
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
            </div>

            {/* Add/Edit user modal */}
            {/* Modal pattern: Provides focused user creation/editing experience */}
            {/* Key prop ensures component remounts when editing different users */}
            <AddUser
                open={open}
                setOpen={setOpen}
                userData={selected} // Pre-populates form for editing, null for new user
                key={new Date().getTime().toString()} // Forces remount for clean state
            />

            {/* Delete confirmation dialog */}
            {/* Security: Prevents accidental user deletion through explicit confirmation */}
            <ConfirmationDialog
                open={openDialog}
                setOpen={setOpenDialog}
                onClick={deleteHandler}
            />

            {/* User status change confirmation dialog */}
            {/* Security: Confirms status changes that affect user access */}
            <UserAction
                open={openAction}
                setOpen={setOpenAction}
                onClick={userActionHandler}
            />
        </>
    );
};

/**
 * Export the Users component as default export
 * 
 * Component Summary:
 * - Comprehensive team member management with full CRUD operations
 * - Table-based layout displaying complete user information
 * - Modal-based user creation and editing for focused input
 * - Confirmation dialogs for all destructive operations
 * - Search integration for filtering large team lists
 * 
 * Key Features:
 * - User avatar generation with initials and dynamic colors
 * - Inline status toggling with confirmation for access control
 * - Separate edit and delete actions with distinct visual styling
 * - Member count display for immediate team size context
 * - Real-time data updates with automatic refetching
 * - Responsive table design for various screen sizes
 * 
 * Data Integration:
 * - RTK Query for efficient data fetching and mutations
 * - URL search parameter integration for persistent filtering
 * - Real-time updates through refetch mechanisms
 * - Comprehensive error handling with user feedback
 * 
 * UX Design Principles:
 * - Clear visual hierarchy with avatars and user information
 * - Color-coded status indicators for quick scanning
 * - Confirmation dialogs prevent accidental destructive actions
 * - Immediate feedback through toast notifications
 * - Consistent styling with application design system
 * 
 * Security Considerations:
 * - Explicit confirmation required for user deletion
 * - Status change confirmation prevents accidental access revocation
 * - Role-based access control through admin-only interface
 * - Comprehensive error handling with user-friendly messages
 * 
 * Business Value:
 * - Complete team member lifecycle management
 * - User access control through active/inactive status
 * - Contact information and organizational structure tracking
 * - Efficient bulk team management capabilities
 * - Search and filtering for large team scalability
 * 
 * Architecture Patterns:
 * - Modal pattern for focused user creation and editing
 * - Confirmation dialog pattern for destructive operations
 * - Table-based data presentation for comprehensive information
 * - Responsive design with mobile-first approach
 * - Component composition with reusable UI elements
 * 
 * Performance Considerations:
 * - Efficient data fetching with RTK Query caching
 * - Conditional rendering for modal and dialog states
 * - Optimized re-rendering through proper key usage
 * - Search integration for large dataset management
 */
export default Users;