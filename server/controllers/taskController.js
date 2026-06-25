/**
 * TASK MANAGEMENT API CONTROLLER
 * 
 * This controller handles all task-related operations for the task management system,
 * including CRUD operations, team assignments, notifications, dashboard analytics,
 * and activity tracking. It implements comprehensive business logic for task
 * lifecycle management with proper error handling and data validation.
 */

// THIRD-PARTY IMPORTS
import asyncHandler from "express-async-handler";  // Wrapper for async route handlers to catch errors automatically

// MODEL IMPORTS - Database schema definitions
import Notice from "../models/notis.js";           // Notification model for team communication
import Task from "../models/taskModel.js";         // Main task entity with all task-related fields
import User from "../models/userModel.js";         // User model for team member management
import { sendAssignmentEmail } from "../utils/emailService.js";
import { escapeRegex } from "../utils/index.js";
/**
 * CREATE NEW TASK ENDPOINT
 * 
 * BUSINESS LOGIC: Creates a new task with team assignment, automatic notifications,
 * and bidirectional user-task relationships. This is the core function for task
 * creation workflow in the application.
 * 
 * NOTIFICATION STRATEGY: Automatically generates contextual notification messages
 * that include task priority, due date, and team size information to provide
 * comprehensive context to assigned team members.
 * 
 * DATA RELATIONSHIPS: Maintains consistency between Task and User collections by
 * updating both the task's team array and each user's tasks array, ensuring
 * bidirectional referential integrity.
 * 
 * SECURITY: Uses authenticated user ID from JWT token for activity tracking
 * and audit trail purposes.
 */
const createTask = asyncHandler(async (req, res) => {
    try {
        // AUTHENTICATION: Extract user ID from JWT token for audit trail
        const { userId } = req.user;
        
        // REQUEST PARSING: Destructure all task fields from request body
        const { title, team, stage, date, startDate, dueDate, priority, category, assets, links, description } = req.body;
        if(!title?.trim()) {
            return res.status(400).json({ status: false, message: "Title is required"});
        }
        if(!team?.length) {
            return res.status(400).json({ status: false, message: "At least one team member is required"});
        }

        // NOTIFICATION MESSAGE GENERATION
        // BUSINESS RULE: Create contextual notification text based on team size and task details
        let text = "New task has been assigned to you";
        if (team?.length > 1) text += ` and ${team.length - 1} others.`;
        text += ` The task priority is set to ${priority} priority. The task date is ${new Date(date).toDateString()}. Thank you!`;

        // ACTIVITY TRACKING: Create initial activity record for task creation
        const activity = { type: "assigned", activity: text, by: userId };
        
        // LINK PROCESSING: Convert comma-separated links string to array for storage
        const newLinks = links ? links.split(/[\s,]+/).filter(Boolean) : [];

        // TASK CREATION: Insert new task document with normalized and validated data
        const task = await Task.create({
            title,
            team,
            stage: stage ? stage.toLowerCase() : "todo",        // DEFAULT: Set to 'todo' if no stage provided
            date,
            startDate,
            dueDate,
            priority: priority.toLowerCase(),                   // NORMALIZATION: Ensure consistent case
            category: category ? category.toLowerCase().replace("_", "-") : "report-created", // DEFAULT CATEGORY
            assets,
            activities: activity,                               // AUDIT TRAIL: Initial creation activity
            links: newLinks,
            description,
        });

        // NOTIFICATION CREATION: Store notification for assigned team members
        // This enables real-time notifications and notification history
        await Notice.create({ team, text, task: task._id });

        // BIDIRECTIONAL RELATIONSHIP MAINTENANCE
        // Update each assigned user's task list to maintain data consistency
        const users = await User.find({ _id: team });
        for (const user of users) {
            await User.findByIdAndUpdate(user._id, { $push: { tasks: task._id } });
        }
        for (const user of users) {
            if (user.email) {
                sendAssignmentEmail({
                    to: user.email,
                    name: user.name,
                    taskTitle: title,
                    priority,
                    dueDate,
                    taskId: task._id,
                }).catch(err => console.error("Assignment email error:", err.message));
            }
        }

        // SUCCESS RESPONSE: Return created task with success status
        res.status(200).json({ status: true, task, message: "Task created successfully." });
        
    } catch (error) {
        // ERROR HANDLING: Return structured error response for client handling
        return res.status(500).json({ status: false, message: error.message });
    }
});

/**
 * DUPLICATE EXISTING TASK ENDPOINT
 * 
 * BUSINESS USE CASE: Enables quick task creation based on existing templates,
 * commonly used for recurring tasks, similar projects, or task templates.
 * 
 * DATA CLONING STRATEGY: Copies all relevant task properties while generating
 * new notifications and activity records. The title is prefixed with "Duplicate"
 * to clearly identify cloned tasks.
 * 
 * NOTIFICATION CONSISTENCY: Uses the same notification logic as task creation
 * to ensure consistent user experience across different task creation methods.
 */
const duplicateTask = asyncHandler(async (req, res) => {
    try {
        // PARAMETER EXTRACTION: Get task ID from URL parameters
        const { id } = req.params;
        const { userId } = req.user;
        
        // SOURCE TASK RETRIEVAL: Fetch original task to duplicate
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ status: false, message: "Task not found."});

        // NOTIFICATION GENERATION: Create notification text using original task data
        let text = "New task has been assigned to you";
        if (task.team?.length > 1) text += ` and ${task.team.length - 1} others.`;
        text += ` The task priority is set to ${task.priority} priority. The task date is ${new Date(task.date).toDateString()}. Thank you!`;

        // ACTIVITY RECORD: Track duplication action for audit purposes
        const activity = { type: "assigned", activity: text, by: userId };

        // TASK DUPLICATION: Create new task with copied properties
        const newTask = await Task.create({
            title: "Duplicate - " + task.title,               // IDENTIFICATION: Clear duplicate labeling
            team: task.team,                                  // TEAM ASSIGNMENT: Maintain original team
            stage: task.stage,                                // WORKFLOW STATE: Copy current stage
            date: task.date,
            priority: task.priority,
            category: task.category,
            assets: task.assets,                              // RESOURCE COPYING: Include original assets
            links: task.links,                                // REFERENCE LINKS: Maintain original links
            description: task.description,
            subTasks: task.subTasks.map(s => ({
                title: s.title,
                date: s.date,
                tag: s.tag,
                description: s.description,
                isCompleted: false,
            })),                          // SUB-TASK INHERITANCE: Copy all sub-tasks
            activities: activity,                             // NEW ACTIVITY TRAIL: Start fresh activity log
        });

        // NOTIFICATION CREATION: Notify team about the duplicated task
        await Notice.create({ team: newTask.team, text, task: newTask._id });
        
        res.status(200).json({ status: true, message: "Task duplicated successfully." });
        
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

/**
 * UPDATE TASK ENDPOINT
 * 
 * BUSINESS LOGIC: Handles comprehensive task updates including all editable fields.
 * This is the primary endpoint for task modification after creation.
 * 
 * DATA VALIDATION: Applies normalization and validation rules consistently
 * with task creation to maintain data integrity across the application.
 * 
 * FLEXIBLE UPDATES: Supports partial updates where undefined fields are handled
 * gracefully, allowing clients to update only specific task properties.
 */
const updateTask = asyncHandler(async (req, res) => {
    // URL PARAMETER: Extract task ID from route parameters
    const { id } = req.params;
    
    // REQUEST BODY: Destructure all updatable task fields
    const { title, date, startDate, dueDate, team, stage, priority, category, assets, links, description } = req.body;
    
    try {
        // TASK RETRIEVAL: Fetch existing task for modification
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ status: false, message: "Task not found."});
        
        // FIELD UPDATES: Apply all provided updates with normalization
        task.title = title;
        task.date = date;
        task.startDate = startDate || undefined;              // OPTIONAL FIELD: Allow null values
        if(dueDate && dueDate !== task.dueDate?.toISOString().slice(0, 10)) {
            task.dueSoonNotified = false;
            task.overdueNotified = false;
        }
        task.dueDate = dueDate || undefined;                  // OPTIONAL FIELD: Allow null values
        task.priority = priority.toLowerCase();               // NORMALIZATION: Consistent case
        task.category = category ? category.toLowerCase() : task.category; // CONDITIONAL UPDATE
        task.assets = assets;
        task.stage = stage.toLowerCase();                     // NORMALIZATION: Consistent case
        task.team = team;                                     // TEAM REASSIGNMENT: Update assigned members
        task.links = links ? links.split(/[\s,]+/).filter(Boolean) : [];         // LINK PROCESSING: Convert to array
        task.description = description;
        
        // PERSISTENCE: Save all changes to database
        await task.save();
        
        res.status(200).json({ status: true, message: "Task updated successfully." });
        
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

/**
 * UPDATE TASK STAGE ENDPOINT
 * 
 * BUSINESS USE CASE: Lightweight endpoint for workflow state changes (todo → in-progress → completed).
 * This is frequently used in kanban-style interfaces for drag-and-drop operations.
 * 
 * PERFORMANCE OPTIMIZATION: Updates only the stage field rather than the entire
 * task document, reducing database load and network traffic for frequent operations.
 * 
 * WORKFLOW MANAGEMENT: Central point for stage transitions that could be extended
 * with business rules, validations, or automated actions based on stage changes.
 */
const updateTaskStage = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;
        
        // TARGETED UPDATE: Fetch and update only the stage field
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ status: false, message: "Task not found."});
        task.stage = stage.toLowerCase();                     // NORMALIZATION: Consistent case
        await task.save();
        
        res.status(200).json({ status: true, message: "Task stage changed successfully." });
        
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

/**
 * UPDATE SUB-TASK STATUS ENDPOINT
 * 
 * TECHNICAL IMPLEMENTATION: Uses MongoDB's positional operator ($) to update
 * specific array elements without fetching the entire document, optimizing
 * performance for large task documents with many sub-tasks.
 * 
 * BUSINESS LOGIC: Enables granular progress tracking within tasks, supporting
 * detailed project management workflows where tasks are broken into smaller components.
 * 
 * USER EXPERIENCE: Provides immediate feedback for sub-task completion status
 * changes, supporting real-time collaboration and progress visualization.
 */
const updateSubTaskStage = asyncHandler(async (req, res) => {
    try {
        // PARAMETER EXTRACTION: Get both task and sub-task identifiers
        const { taskId, subTaskId } = req.params;
        const { status } = req.body;
        
        // ATOMIC UPDATE: Use MongoDB positional operator for efficient array element update
        await Task.findOneAndUpdate(
            { _id: taskId, "subTasks._id": subTaskId },        // QUERY: Match task and specific sub-task
            { $set: { "subTasks.$.isCompleted": status } }     // UPDATE: Set completion status
        );
        
        // DYNAMIC RESPONSE: Provide contextual success message based on action
        res.status(200).json({ 
            status: true, 
            message: status ? "Marked completed" : "Marked uncompleted" 
        });
        
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

/**
 * CREATE SUB-TASK ENDPOINT
 * 
 * BUSINESS FUNCTIONALITY: Enables task decomposition into smaller, manageable
 * components, supporting detailed project planning and progress tracking.
 * 
 * DATA STRUCTURE: Sub-tasks are embedded documents within the parent task,
 * providing efficient querying and maintaining data locality for related items.
 * 
 * DEFAULT VALUES: New sub-tasks are created with isCompleted: false to ensure
 * consistent initial state and proper progress calculations.
 */
const createSubTask = asyncHandler(async (req, res) => {
    // REQUEST DATA: Extract sub-task details from request body
    const { title, tag, date, description } = req.body;
    const { id } = req.params;
    
    try {
        // PARENT TASK RETRIEVAL: Get the task to add sub-task to
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ status: false, message: "Task not found."});
        
        // SUB-TASK ADDITION: Push new sub-task to embedded array
        task.subTasks.push({ 
            title, 
            date, 
            tag, 
            description, 
            isCompleted: false                                // DEFAULT STATE: New sub-tasks start incomplete
        });
        
        await task.save();
        
        res.status(200).json({ status: true, message: "SubTask added successfully." });
        
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

/**
 * GET TASKS WITH FILTERING ENDPOINT
 * 
 * BUSINESS LOGIC: Central endpoint for task retrieval with comprehensive filtering
 * capabilities supporting various application views (dashboard, task lists, search results).
 * 
 * PERMISSION SYSTEM: Implements role-based access control where regular users
 * see only their assigned tasks while administrators see all tasks.
 * 
 * PERFORMANCE OPTIMIZATION: Uses MongoDB aggregation and indexing strategies
 * for efficient querying across large task datasets.
 * 
 * DATA ARCHIVAL: Implements automatic filtering of old tasks (older than 1 year)
 * to maintain application performance while preserving data integrity.
 */
const getTasks = asyncHandler(async (req, res) => {
    // AUTHENTICATION: Extract user permissions from JWT token
    const { userId, isAdmin } = req.user;
    
    // QUERY PARAMETERS: Extract filtering criteria from request
    const { stage, isTrashed, search, category } = req.query;

    // QUERY BUILDING: Construct MongoDB query based on filters
    let query = {};

    // TRASH FILTERING: Handle trashed vs active tasks
    if(isTrashed === "true"){
        query.isTrashed = true;                               // SHOW ONLY: Trashed tasks
    } else {
        query.isTrashed = { $ne: true};                       // EXCLUDE: Trashed tasks
        
        // DATA ARCHIVAL: Limit results to tasks from the last year for performance
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        query.date = { $gte: oneYearAgo };
        
        // DEFAULT FILTER: Hide completed tasks unless specifically requested
        if(!stage) {
            query.stage = { $ne: "completed" };
        }
    }

    // PERMISSION FILTERING: Restrict non-admin users to their assigned tasks
    if (!isAdmin) query.team = { $in: [userId] };
    
    // STAGE FILTERING: Filter by workflow stage if specified
    if (stage) query.stage = stage;
    
    // CATEGORY FILTERING: Filter by task category if specified
    if (category) query.category = category;

    // SEARCH FUNCTIONALITY: Implement multi-field text search
    if (search) {
        query = {
            ...query,
            $or: [                                            // SEARCH ACROSS: Multiple fields
                { title: { $regex: escapeRegex(search), $options: "i" } },        // Case-insensitive title search
                { stage: { $regex: escapeRegex(search), $options: "i" } },        // Stage matching
                { priority: { $regex: escapeRegex(search), $options: "i" } },     // Priority matching
                { category: { $regex: escapeRegex(search), $options: "i" } },     // Category matching
            ],
        };
    }

    // DATABASE QUERY: Execute query with population and sorting
    const tasks = await Task.find(query)
        .populate({ path: "team", select: "name title email" })    // TEAM DATA: Include member details
        .sort({ _id: -1 });                                        // SORT: Most recent first

    res.status(200).json({ status: true, tasks });
});

/**
 * GET SINGLE TASK ENDPOINT
 * 
 * BUSINESS USE CASE: Retrieves detailed task information for task detail views,
 * editing forms, and comprehensive task displays.
 * 
 * DATA POPULATION: Includes related data (team members, activity authors) to
 * provide complete task context without additional client-side requests.
 * 
 * PERFORMANCE: Uses selective field population to include only necessary user
 * data, reducing response size and improving load times.
 */
const getTask = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        // DETAILED RETRIEVAL: Fetch task with all related data populated
        const task = await Task.findById(id)
            .populate({ path: "team", select: "name title role email" })      // TEAM DETAILS: Full member info
            .populate({ path: "activities.by", select: "name" });             // ACTIVITY AUTHORS: User names
            
        res.status(200).json({ status: true, task });
        
    } catch (error) {
        throw new Error("Failed to fetch task", error);
    }
});

/**
 * POST TASK ACTIVITY ENDPOINT
 * 
 * BUSINESS FUNCTIONALITY: Enables activity logging for task collaboration,
 * comments, status updates, and audit trail maintenance.
 * 
 * AUDIT TRAIL: Maintains comprehensive activity history for compliance,
 * debugging, and team communication purposes.
 * 
 * REAL-TIME COLLABORATION: Supports activity feeds and notification systems
 * for team coordination and project transparency.
 */
const postTaskActivity = asyncHandler(async (req, res) => {
    // PARAMETER EXTRACTION: Get task ID and user context
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;
    
    try {
        // TASK RETRIEVAL: Get task to add activity to
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ status: false, message: "Task not found."});
        
        // ACTIVITY ADDITION: Add new activity with user attribution
        task.activities.push({ 
            type,                                             // ACTIVITY TYPE: Comment, update, status change, etc.
            activity,                                         // ACTIVITY CONTENT: Description or message
            by: userId                                        // ATTRIBUTION: User who performed the activity
        });
        
        await task.save();
        
        res.status(200).json({ status: true, message: "Activity posted successfully." });
        
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

/**
 * TRASH TASK ENDPOINT
 * 
 * BUSINESS LOGIC: Implements soft delete pattern for task management, allowing
 * task recovery and maintaining data integrity for audit purposes.
 * 
 * DATA PRESERVATION: Tasks are marked as trashed rather than permanently deleted,
 * supporting undo operations and compliance requirements.
 * 
 * USER EXPERIENCE: Provides safety net for accidental deletions while keeping
 * the interface clean by hiding trashed items from normal views.
 */
const trashTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
        // SOFT DELETE: Mark task as trashed instead of permanent deletion
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ status: false, message: "Task not found."});
        task.isTrashed = true;                                // SOFT DELETE FLAG
        await task.save();
        
        res.status(200).json({ status: true, message: "Task trashed successfully." });
        
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

/**
 * DELETE/RESTORE TASK OPERATIONS ENDPOINT
 * 
 * BUSINESS FUNCTIONALITY: Handles multiple task management operations including
 * permanent deletion, bulk operations, and task restoration from trash.
 * 
 * BULK OPERATIONS: Supports batch operations for administrative efficiency,
 * particularly useful for cleanup and maintenance tasks.
 * 
 * SAFETY MEASURES: Permanent deletion is separate from soft delete to prevent
 * accidental data loss while providing administrative control.
 */
const deleteRestoreTask = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { actionType } = req.query;

        // OPERATION ROUTING: Handle different action types
        if (actionType === "delete") {
            // PERMANENT DELETION: Remove task completely from database
            await Task.findByIdAndDelete(id);
            
        } else if (actionType === "deleteAll") {
            // BULK DELETION: Remove all trashed tasks permanently
            await Task.deleteMany({ isTrashed: true });
            
        } else if (actionType === "restore") {
            // SINGLE RESTORATION: Restore specific task from trash
            const t = await Task.findById(id);
            if (!task) return res.status(404).json({ status: false, message: "Task not found."});
            t.isTrashed = false;
            await t.save();
            
        } else if (actionType === "restoreAll") {
            // BULK RESTORATION: Restore all trashed tasks
            await Task.updateMany({ isTrashed: true }, { $set: { isTrashed: false } });
        }

        res.status(200).json({ status: true, message: "Operation performed successfully." });
        
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

/**
 * DASHBOARD STATISTICS ENDPOINT
 * 
 * BUSINESS INTELLIGENCE: Generates comprehensive analytics for dashboard displays,
 * including task distribution, team performance, and project health metrics.
 * 
 * PERFORMANCE OPTIMIZATION: Uses MongoDB aggregation pipelines and efficient
 * queries to calculate statistics without loading unnecessary data into memory.
 * 
 * ROLE-BASED DATA: Provides different data sets for administrators (full system view)
 * versus regular users (personal task view) to maintain security and relevance.
 * 
 * REAL-TIME METRICS: Calculates current statistics including overdue tasks,
 * priority distributions, and team workload for operational decision-making.
 */
const dashboardStatistics = asyncHandler(async (req, res) => {
    try {
        // AUTHENTICATION: Extract user role and ID for permission-based data
        const { userId, isAdmin } = req.user;
        
        // DATE FILTERING: Limit analysis to recent tasks (last year) for performance
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() -3);
        
        // TASK RETRIEVAL: Get tasks based on user permissions
        const allTasks = isAdmin
            ? await Task.find({ isTrashed: false, date: { $gte: threeMonthsAgo } })
                .populate({ path: "team", select: "name role title email" })
                .sort({ _id: -1 })
            : await Task.find({ isTrashed: false, team: { $in: [userId] }, date: { $gte: threeMonthsAgo } })
                .populate({ path: "team", select: "name role title email" })
                .sort({ _id: -1 });

        // USER DATA: Get active users for team management (admin only)
        const users = await User.find({ isActive: true })
            .select("name title role isActive createdAt")
            .limit(10)                                        // PERFORMANCE: Limit for dashboard display
            .sort({ _id: -1 });

        // TASK DISTRIBUTION: Group all tasks by stage for overview charts
        const groupedTasks = allTasks.reduce((result, task) => {
            result[task.stage] = (result[task.stage] || 0) + 1;
            return result;
        }, {});

        // CURRENT WORKLOAD: Analyze active (non-completed) tasks
        const currentTasks = isAdmin
        ? await Task.find({ isTrashed: false, stage: { $ne: "completed" } })
        : await Task.find({ isTrashed: false, team: { $in: [userId] }, stage: { $ne: "completed" } });
        
        // CURRENT TASK DISTRIBUTION: Group active tasks by stage
        const currentGrouped = currentTasks.reduce((result, task) => {
            result[task.stage] = (result[task.stage] || 0) + 1;
            return result;
        }, {});

        // OVERDUE ANALYSIS: Count tasks past their due date
        const countOverdue = currentTasks.filter(t =>
            t.dueDate &&                                      // HAS DUE DATE: Only check tasks with due dates
            new Date(t.dueDate) < new Date()                  // PAST DUE: Compare with current date
        ).length;

        // PRIORITY DISTRIBUTION: Create ordered priority statistics for charts
        const priorityCount = currentTasks.reduce((result, task) => {
            result[task.priority] = (result[task.priority] || 0) + 1;
            return result;
        }, {});
        
        // CHART DATA: Ensure consistent ordering for priority visualization
        const graphData = ["high", "medium", "normal", "low"].map(priority => ({
            name: priority,
            total: priorityCount[priority] || 0,              // DEFAULT: 0 for missing priorities
        }));

        // TEAM PERFORMANCE: Calculate individual team member workloads (admin only)
        const teamStatus = await Promise.all(
            users.map(async (u) => {
                // IN-PROGRESS TASKS: Get current workload for each team member
                const inProgressTasks = await Task.find({
                    isTrashed: false,
                    stage: "in-progress",
                    team: { $in: [u._id] },
                })
                    .select("title priority category date")   // MINIMAL DATA: Only fields needed for display
                    .sort({ _id: -1 });
                    
                return { ...u.toObject(), inProgressTasks };
            })
        );

        // GLOBAL OVERDUE COUNT: Calculate system-wide overdue tasks
        const overdueCount = allTasks.filter(t =>
            t.dueDate &&                                      // HAS DUE DATE
            new Date(t.dueDate) < new Date() &&               // PAST DUE
            t.stage !== "completed" &&                        // NOT COMPLETED
            !t.isTrashed                                      // NOT TRASHED
        ).length;

        // COMPREHENSIVE RESPONSE: Return all dashboard metrics
        res.status(200).json({
            status: true,
            totalTasks: currentTasks.length,                      // TOTAL COUNT: All tasks in scope
            last10Task: allTasks.slice(0, 10),                // RECENT TASKS: Latest 10 for quick view
            overdueCount: countOverdue,                       // USER-SPECIFIC: Overdue count for current user
            users: isAdmin ? users : [],                      // ADMIN ONLY: User list
            teamStatus: isAdmin ? teamStatus : [],            // ADMIN ONLY: Team performance data
            tasks: groupedTasks,                              // HISTORICAL: All task distribution
            currentTasks: currentGrouped,                     // CURRENT: Active task distribution
            graphData,                                        // CHARTS: Priority distribution data
            message: "Successfully.",
        });
        
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

/**
 * GET TASK HISTORY ENDPOINT
 * 
 * BUSINESS USE CASE: Provides completed task history for reporting, analysis,
 * and performance tracking purposes. Essential for project retrospectives
 * and productivity analysis.
 * 
 * DATA ARCHIVAL: Limits results to the last year to balance comprehensive
 * history with application performance, preventing excessive data loading.
 * 
 * PERMISSION FILTERING: Maintains security by showing only relevant completed
 * tasks based on user role and team assignments.
 */
const getTaskHistory = asyncHandler(async (req, res) => {
    try {
        // AUTHENTICATION: Get user permissions for data filtering
        const { isAdmin, userId } = req.user;
        
        // DATE RANGE: Limit history to last year for performance
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() -1);
        
        // PERMISSION-BASED QUERY: Different queries for admin vs regular users
        const query = isAdmin 
        ? { isTrashed: false, stage: "completed", updatedAt: { $gte: oneYearAgo } }     // ADMIN: All completed tasks
        : { isTrashed: false, stage: "completed", team: { $in: [userId] }, updatedAt: { $gte: oneYearAgo } }; // USER: Only assigned tasks

        // HISTORY RETRIEVAL: Get completed tasks with team information
        const tasks = await Task.find(query)
            .populate({ path: "team", select: "name title email" })    // TEAM DATA: Member information
            .sort({ updatedAt: -1 });                                  // SORT: Most recently updated first

        res.status(200).json({ status: true, tasks });
        
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

// EXPORT ALL CONTROLLER FUNCTIONS
// Organized alphabetically for easy reference and maintenance
export {
    createSubTask,        // Sub-task creation functionality
    createTask,           // Main task creation endpoint
    dashboardStatistics,  // Analytics and metrics generation
    deleteRestoreTask,    // Permanent deletion and restoration operations
    duplicateTask,        // Task duplication for templates and recurring tasks
    getTask,              // Single task retrieval with full details
    getTasks,             // Filtered task list retrieval
    getTaskHistory,       // Completed task history for reporting
    postTaskActivity,     // Activity logging and collaboration
    trashTask,            // Soft delete functionality
    updateSubTaskStage,   // Sub-task status management
    updateTask,           // Comprehensive task updates
    updateTaskStage,      // Workflow stage transitions
};