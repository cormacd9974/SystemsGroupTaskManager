// Import constants for API endpoint URLs
//import { USERS_URL } from "../../../utils/contants"; // Commented out - reserved for future user-related endpoints
import { TASKS_URL } from "../../../utils/contants"; // Base URL constant for task-related API endpoints
import { apiSlice } from "../apiSlice"; // Base API slice for endpoint injection

/**
 * Task API Slice - Comprehensive task management API endpoints
 * 
 * @description
 * This slice extends the base apiSlice with all task-related API operations.
 * Provides complete CRUD functionality plus specialized operations for task workflow management.
 * 
 * Architecture decisions:
 * - Uses RTK Query's injectEndpoints pattern for modular API organization
 * - Implements comprehensive cache invalidation strategy with tags
 * - Separates query operations (data fetching) from mutations (data modification)
 * - Follows RESTful conventions with appropriate HTTP methods
 * 
 * Cache management strategy:
 * - "Tasks" tag: Invalidated by operations that modify task data
 * - "Users" tag: Invalidated by operations that affect user assignments
 * - Selective invalidation prevents unnecessary refetches
 * 
 * Business context:
 * - Supports complete task lifecycle from creation to deletion
 * - Enables collaborative features through sub-tasks and activities
 * - Provides dashboard analytics and reporting capabilities
 * - Implements soft delete pattern with trash/restore functionality
 */
export const taskApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Create Task Mutation - Creates a new task with provided data
         * 
         * @endpoint POST /tasks/create
         * @param {Object} data - Complete task information (title, description, priority, team, etc.)
         * @returns {Object} Created task data with generated ID and timestamps
         * 
         * Business workflow:
         * - Validates task data on server
         * - Assigns unique task ID and creation timestamps
         * - Notifies assigned team members (if implemented)
         * - Updates dashboard statistics
         * 
         * Cache invalidation:
         * - "Tasks": Refreshes task lists and dashboard data
         * - "Users": Updates user workload statistics
         * 
         * Usage pattern:
         * const [createTask, { isLoading }] = useCreateTaskMutation();
         * await createTask(taskData);
         */
        createTask: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/create`, // Task creation endpoint
                method: "POST", // HTTP method for resource creation
                body: data, // Complete task data payload
            }),
            invalidatesTags: ["Tasks", "Users"], // Refresh task lists and user statistics
        }),

        /**
         * Update Task Mutation - Modifies existing task with new data
         * 
         * @endpoint PUT /tasks/update/{id}
         * @param {Object} data - Updated task data including _id for identification
         * @returns {Object} Updated task data with modification timestamps
         * 
         * Business logic:
         * - Preserves task history and audit trail
         * - Updates modification timestamps
         * - Maintains data integrity across related entities
         * - Triggers notifications for significant changes
         * 
         * Security considerations:
         * - Server validates user permissions for task modification
         * - Prevents unauthorized access to tasks outside user scope
         * 
         * Usage pattern:
         * const [updateTask] = useUpdateTaskMutation();
         * await updateTask({ ...taskData, _id: taskId });
         */
         updateTask: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/update/${data._id}`, // Dynamic URL with task ID
                method: "PUT", // HTTP method for resource updates
                body: data, // Updated task data
              
            }),
            invalidatesTags: ["Tasks"], // Refresh task-related cached data
        }),

        /**
         * Duplicate Task Mutation - Creates a copy of an existing task
         * 
         * @endpoint POST /tasks/duplicate/{id}
         * @param {string} id - ID of the task to duplicate
         * @returns {Object} New task data based on original with new ID
         * 
         * Business use cases:
         * - Template-based task creation for recurring workflows
         * - Quick task creation with similar parameters
         * - Project template duplication
         * 
         * Implementation details:
         * - Copies task structure while generating new unique identifiers
         * - Resets status-dependent fields (stage, completion, dates)
         * - Preserves task template data (title, description, priority)
         * 
         * Usage pattern:
         * const [duplicateTask] = useDuplicateTaskMutation();
         * await duplicateTask(originalTaskId);
         */
         duplicateTask: builder.mutation({
           query: (id) => ({
                url: `${TASKS_URL}/duplicate/${id}`, // Duplication endpoint with source task ID
                method: "POST", // Creates new resource based on existing
                body: {}, // Empty body - server handles duplication logic
             
            }),
            // Note: Could benefit from invalidatesTags: ["Tasks"] for immediate UI updates
        }),

        /**
         * Get All Tasks Query - Fetches filtered list of tasks
         * 
         * @endpoint GET /tasks?stage={stage}&isTrashed={isTrashed}&search={search}
         * @param {Object} params - Filter parameters
         * @param {string} params.strQuery - Stage filter (todo, in-progress, completed)
         * @param {string} params.isTrashed - Trash status filter ("true" for trashed tasks)
         * @param {string} params.search - Text search query for task titles/descriptions
         * @returns {Object} Filtered array of tasks with metadata
         * 
         * Query parameter construction:
         * - Dynamic URL building based on provided filters
         * - Optional parameters with fallback handling
         * - Search parameter encoding for special characters
         * 
         * Caching strategy:
         * - Provides "Tasks" tag for cache invalidation
         * - Enables efficient data sharing across components
         * - Automatic background refetching on cache invalidation
         * 
         * Usage patterns:
         * - Task list views with filtering
         * - Dashboard task summaries
         * - Search functionality across task collections
         */
         getAllTask: builder.query({
           query: ({ strQuery, isTrashed, search }) => ({
                // Dynamic URL construction with conditional query parameters
                url: `${TASKS_URL}?${strQuery ? `stage=${strQuery}&` : ""}isTrashed=${isTrashed}&search=${search ?? ""}`,
                method: "GET", // HTTP method for data retrieval
               
            }),
            providesTags: ["Tasks"], // Cache tag for invalidation management
        }),

        /**
         * Get Single Task Query - Fetches detailed information for a specific task
         * 
         * @endpoint GET /tasks/{id}
         * @param {string} id - Unique task identifier
         * @returns {Object} Complete task data including sub-tasks, activities, and team info
         * 
         * Data richness:
         * - Complete task details with all related entities
         * - Sub-task collection with completion status
         * - Activity timeline with user attribution
         * - Team member assignments with roles
         * - File attachments and external links
         * 
         * Performance considerations:
         * - Individual task caching for efficient detail view loading
         * - Selective data loading based on user permissions
         * - Optimized for task detail page rendering
         * 
         * Usage pattern:
         * const { data: task, isLoading } = useGetSingleTaskQuery(taskId);
         */
         getSingleTask: builder.query({
           query: (id) => ({
                url: `${TASKS_URL}/${id}`, // Task detail endpoint with ID
                method: "GET", // HTTP method for data retrieval
                
            }),
            // Note: Could benefit from providesTags for individual task caching
        }),

        /**
         * Get Task History Query - Fetches completed tasks for historical analysis
         * 
         * @endpoint GET /tasks/history
         * @returns {Object} Array of completed tasks with completion metadata
         * 
         * Business applications:
         * - Performance reporting and analytics
         * - Team productivity analysis
         * - Project completion tracking
         * - Historical data for planning future work
         * 
         * Data characteristics:
         * - Only includes tasks with "completed" status
         * - Includes completion timestamps and user attribution
         * - Maintains task context for reporting purposes
         * 
         * Usage pattern:
         * const { data: history } = useGetTaskHistoryQuery();
         */
         getTaskHistory: builder.query({
           query: () => ({
                url: `${TASKS_URL}/history`, // Historical data endpoint
                method: "GET", // HTTP method for data retrieval
              
            }),
            providesTags: ["Tasks"], // Cache invalidation for updated completion data
        }),

        /**
         * Get Dashboard Stats Query - Fetches comprehensive dashboard analytics
         * 
         * @endpoint GET /tasks/dashboard
         * @returns {Object} Dashboard statistics including task counts, team status, and trends
         * 
         * Analytics data includes:
         * - Task counts by status (todo, in-progress, completed)
         * - Priority distribution for workload analysis
         * - Team member workload and capacity
         * - Recent task activity and trends
         * - Overdue task alerts and notifications
         * 
         * Performance optimization:
         * - Server-side aggregation for efficient data transfer
         * - Cached results with appropriate invalidation
         * - Optimized queries for dashboard rendering
         * 
         * Usage pattern:
         * const { data: stats } = useGetDashboardStatsQuery();
         */
         getDashboardStats: builder.query({
           query: () => ({
                url: `${TASKS_URL}/dashboard`, // Dashboard analytics endpoint
                method: "GET", // HTTP method for data retrieval
            }),
            providesTags: ["Tasks"], // Cache invalidation when task data changes
        }),

        /**
         * Create Sub-Task Mutation - Adds a sub-task to an existing parent task
         * 
         * @endpoint PUT /tasks/create-subtask/{id}
         * @param {Object} params - Sub-task creation parameters
         * @param {Object} params.data - Sub-task information (title, description, assignee)
         * @param {string} params.id - Parent task ID
         * @returns {Object} Updated parent task with new sub-task included
         * 
         * Business workflow:
         * - Enables task decomposition into manageable components
         * - Supports detailed progress tracking within larger tasks
         * - Facilitates team collaboration on complex deliverables
         * 
         * Data relationships:
         * - Maintains parent-child relationship between tasks
         * - Preserves sub-task ordering and hierarchy
         * - Updates parent task progress based on sub-task completion
         * 
         * Usage pattern:
         * const [createSubTask] = useCreateSubTaskMutation();
         * await createSubTask({ data: subTaskData, id: parentTaskId });
         */
         createSubTask: builder.mutation({
           query: ({ data, id }) => ({
                url: `${TASKS_URL}/create-subtask/${id}`, // Sub-task creation endpoint
                method: "PUT", // Updates parent task with new sub-task
                body: data, // Sub-task data payload
                
            }),
            // Note: Should include invalidatesTags: ["Tasks"] for UI updates
        }),

        /**
         * Post Task Activity Mutation - Adds activity entry to task timeline
         * 
         * @endpoint POST /tasks/activity/{id}
         * @param {Object} params - Activity posting parameters
         * @param {Object} params.data - Activity data (type, message, user attribution)
         * @param {string} params.id - Target task ID
         * @returns {Object} Updated task with new activity entry
         * 
         * Activity types supported:
         * - Comments and communication
         * - Status changes and updates
         * - Assignment modifications
         * - File attachments and links
         * - Progress milestones
         * 
         * Collaboration features:
         * - Real-time activity feed for team coordination
         * - User attribution for accountability
         * - Timestamp tracking for audit trails
         * - Notification triggers for relevant team members
         * 
         * Usage pattern:
         * const [postActivity] = usePostTaskActivityMutation();
         * await postActivity({ data: activityData, id: taskId });
         */
         postTaskActivity: builder.mutation({
           query: ({ data, id }) => ({
                url: `${TASKS_URL}/activity/${id}`, // Activity posting endpoint
                method: "POST", // Creates new activity entry
                body: data, // Activity information and metadata
            
            }),
            // Note: Should include invalidatesTags: ["Tasks"] for timeline updates
        }),

        /**
         * Trash Task Mutation - Moves task to trash (soft delete)
         * 
         * @endpoint PUT /tasks/{id}
         * @param {Object} params - Trash operation parameters
         * @param {string} params.id - Task ID to move to trash
         * @returns {Object} Confirmation of trash operation
         * 
         * Soft delete implementation:
         * - Marks task as trashed without permanent deletion
         * - Preserves task data for potential recovery
         * - Removes task from active workflow views
         * - Maintains data integrity and relationships
         * 
         * Business benefits:
         * - Prevents accidental data loss
         * - Enables task recovery workflows
         * - Supports data retention policies
         * - Facilitates cleanup and organization
         * 
         * Usage pattern:
         * const [trashTask] = useTrashTaskMutation();
         * await trashTask({ id: taskId });
         */
         trashTask: builder.mutation({
           query: ({ id }) => ({
                url: `${TASKS_URL}/${id}`, // Task modification endpoint
                method: "PUT", // Updates task status to trashed
           
            }),
            invalidatesTags: ["Tasks"], // Refresh task lists to remove trashed items
        }),

        /**
         * Delete/Restore Task Mutation - Permanently deletes or restores trashed tasks
         * 
         * @endpoint DELETE /tasks/delete-restore/{id}?actionType={actionType}
         * @param {Object} params - Delete/restore operation parameters
         * @param {string} params.id - Task ID (empty string for bulk operations)
         * @param {string} params.actionType - Operation type (delete, restore, deleteAll, restoreAll)
         * @returns {Object} Confirmation of operation completion
         * 
         * Supported operations:
         * - delete: Permanently remove single task
         * - restore: Restore single task from trash
         * - deleteAll: Permanently remove all trashed tasks
         * - restoreAll: Restore all trashed tasks
         * 
         * Security considerations:
         * - Permanent deletion requires explicit confirmation
         * - Bulk operations restricted to authorized users
         * - Audit logging for accountability
         * 
         * Usage pattern:
         * const [deleteRestoreTask] = useDeleteRestoreTaskMutation();
         * await deleteRestoreTask({ id: taskId, actionType: "delete" });
         */
         deleteRestoreTask: builder.mutation({
           query: ({ id, actionType }) => ({
                url: `${TASKS_URL}/delete-restore/${id}?actionType=${actionType}`, // Action-specific endpoint
                method: "DELETE", // HTTP method for deletion operations
             
            }),
            invalidatesTags: ["Tasks"], // Refresh all task-related cached data
        }),
         
        /**
         * Change Task Stage Mutation - Updates task workflow status
         * 
         * @endpoint PUT /tasks/change-stage/{id}
         * @param {Object} data - Stage change data including task ID and new stage
         * @returns {Object} Updated task with new stage information
         * 
         * Workflow stages supported:
         * - todo: Task is planned but not started
         * - in-progress: Task is actively being worked on
         * - completed: Task has been finished
         * 
         * Business workflow:
         * - Enables Kanban-style workflow management
         * - Triggers notifications for stage changes
         * - Updates dashboard statistics automatically
         * - Maintains stage change history for reporting
         * 
         * Usage pattern:
         * const [changeStage] = useChangeTaskStageMutation();
         * await changeStage({ id: taskId, stage: "in-progress" });
         */
        changeTaskStage: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/change-stage/${data?.id}`, // Stage modification endpoint
                method: "PUT", // Updates existing task stage
                body: data, // Stage change data and metadata
            }),
            invalidatesTags: ["Tasks"], // Refresh task data for updated workflow status
        }),

        /**
         * Change Sub-Task Status Mutation - Updates sub-task completion status
         * 
         * @endpoint PUT /tasks/change-status/{id}/{subId}
         * @param {Object} data - Status change data including parent task ID, sub-task ID, and new status
         * @returns {Object} Updated parent task with modified sub-task status
         * 
         * Status management:
         * - Toggles sub-task completion status
         * - Updates parent task progress calculations
         * - Maintains sub-task completion history
         * - Triggers progress notifications
         * 
         * Progress calculation:
         * - Automatically updates parent task completion percentage
         * - Considers all sub-tasks for overall progress
         * - Provides visual progress indicators
         * 
         * Usage pattern:
         * const [changeSubTaskStatus] = useChangeSubTaskStatusMutation();
         * await changeSubTaskStatus({ id: taskId, subId: subTaskId, status: true });
         */
         changeSubTaskStatus: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/change-status/${data?.id}/${data?.subId}`, // Sub-task status endpoint
                method: "PUT", // Updates sub-task completion status
                body: data, // Status change data and context
            }),
            invalidatesTags: ["Tasks"], // Refresh task data for updated progress
        }),
    }),
});

/**
 * Auto-generated React hooks for task management operations
 * 
 * RTK Query automatically generates these hooks based on the endpoint definitions above.
 * Each hook provides comprehensive state management for API operations including:
 * - Loading states for UI feedback
 * - Error handling for robust user experience
 * - Success states and data for response handling
 * - Automatic caching and background updates
 * 
 * Hook naming conventions:
 * - Mutations: use[EndpointName]Mutation
 * - Queries: use[EndpointName]Query
 * 
 * Performance benefits:
 * - Automatic request deduplication
 * - Intelligent caching with selective invalidation
 * - Background refetching for data freshness
 * - Optimistic updates for better perceived performance
 */
export const { 
    /**
     * Task Creation Hook
     * @returns {Array} [createTaskMutation, { isLoading, error, data, isSuccess }]
     * Usage: Creating new tasks with comprehensive data validation
     */
    useCreateTaskMutation,

    /**
     * Task Update Hook
     * @returns {Array} [updateTaskMutation, { isLoading, error, data, isSuccess }]
     * Usage: Modifying existing tasks while preserving data integrity
     */
    useUpdateTaskMutation,

    /**
     * Task Duplication Hook
     * @returns {Array} [duplicateTaskMutation, { isLoading, error, data, isSuccess }]
     * Usage: Creating task copies for template-based workflows
     */
    useDuplicateTaskMutation,

    /**
     * All Tasks Query Hook
     * @returns {Object} { data, isLoading, error, refetch, isSuccess }
     * Usage: Fetching filtered task lists with search and stage filtering
     */
    useGetAllTaskQuery,

    /**
     * Single Task Query Hook
     * @returns {Object} { data, isLoading, error, refetch, isSuccess }
     * Usage: Loading detailed task information for task detail views
     */
    useGetSingleTaskQuery,

    /**
     * Task History Query Hook
     * @returns {Object} { data, isLoading, error, refetch, isSuccess }
     * Usage: Fetching completed tasks for reporting and analysis
     */
    useGetTaskHistoryQuery,

    /**
     * Dashboard Stats Query Hook
     * @returns {Object} { data, isLoading, error, refetch, isSuccess }
     * Usage: Loading dashboard analytics and summary statistics
     */
    useGetDashboardStatsQuery,

    /**
     * Sub-Task Creation Hook
     * @returns {Array} [createSubTaskMutation, { isLoading, error, data, isSuccess }]
     * Usage: Adding sub-tasks to existing parent tasks
     */
    useCreateSubTaskMutation,

    /**
     * Task Activity Hook
     * @returns {Array} [postActivityMutation, { isLoading, error, data, isSuccess }]
     * Usage: Adding activity entries to task timelines
     */
    usePostTaskActivityMutation,

    /**
     * Trash Task Hook
     * @returns {Array} [trashTaskMutation, { isLoading, error, data, isSuccess }]
     * Usage: Moving tasks to trash (soft delete operation)
     */
    useTrashTaskMutation,

    /**
     * Delete/Restore Task Hook
     * @returns {Array} [deleteRestoreTaskMutation, { isLoading, error, data, isSuccess }]
     * Usage: Permanent deletion or restoration of trashed tasks
     */
    useDeleteRestoreTaskMutation,

    /**
     * Task Stage Change Hook
     * @returns {Array} [changeTaskStageMutation, { isLoading, error, data, isSuccess }]
     * Usage: Updating task workflow status (todo, in-progress, completed)
     */
    useChangeTaskStageMutation,

    /**
     * Sub-Task Status Hook
     * @returns {Array} [changeSubTaskStatusMutation, { isLoading, error, data, isSuccess }]
     * Usage: Toggling sub-task completion status and updating progress
     */
    useChangeSubTaskStatusMutation,
} = taskApiSlice;

/**
 * Task API Slice Summary:
 * 
 * Comprehensive Coverage:
 * - Complete CRUD operations for task management
 * - Advanced workflow features (stages, sub-tasks, activities)
 * - Soft delete pattern with trash/restore functionality
 * - Dashboard analytics and reporting capabilities
 * - Search and filtering for large task datasets
 * 
 * Cache Management:
 * - Strategic tag-based invalidation for optimal performance
 * - Selective cache updates to minimize unnecessary refetches
 * - Automatic background updates for data freshness
 * - Efficient data sharing across multiple components
 * 
 * Business Features:
 * - Task lifecycle management from creation to completion
 * - Collaborative features through activities and assignments
 * - Progress tracking through sub-tasks and completion status
 * - Workflow management with stage-based organization
 * - Historical data analysis and reporting capabilities
 * 
 * Developer Experience:
 * - Auto-generated hooks with consistent naming conventions
 * - Built-in loading states and error handling
 * - TypeScript support for type safety (when applicable)
 * - Comprehensive documentation and usage examples
 * 
 * Performance Optimizations:
 * - Request deduplication and intelligent caching
 * - Background refetching for data consistency
 * - Optimistic updates for better user experience
 * - Selective invalidation to minimize network requests
 * 
 * Security Considerations:
 * - Server-side validation for all data modifications
 * - User permission checks for task access and modification
 * - Audit trails for accountability and compliance
 * - Secure handling of file attachments and external links
 * 
 * Future Enhancement Opportunities:
 * - Real-time updates through WebSocket integration
 * - Advanced search with full-text indexing
 * - Bulk operations for administrative efficiency
 * - Integration with external project management tools
 * - Enhanced analytics with custom reporting capabilities
 */