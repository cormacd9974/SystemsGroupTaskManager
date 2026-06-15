/**
 * TASK DATA MODEL SCHEMA
 * 
 * This Mongoose schema defines the core Task entity for the task management system,
 * implementing a comprehensive data structure that supports project management workflows,
 * team collaboration, activity tracking, and document management. The schema is designed
 * for flexibility while maintaining data integrity through validation and constraints.
 */

// MONGOOSE IMPORTS
import mongoose, { Schema } from "mongoose";       // MongoDB object modeling and schema definition

/**
 * TASK SCHEMA DEFINITION
 * 
 * BUSINESS MODEL: Represents a complete task entity with all necessary attributes
 * for project management including workflow states, team assignments, deadlines,
 * priorities, and collaboration features.
 * 
 * DATA RELATIONSHIPS: Implements references to User entities for team assignments
 * and activity tracking, enabling complex queries and data population for
 * comprehensive task views and reporting.
 * 
 * WORKFLOW SUPPORT: Includes stage-based workflow management with predefined
 * states that align with common project management methodologies (Kanban, Scrum).
 * 
 * AUDIT TRAIL: Maintains comprehensive activity logging for compliance,
 * debugging, and team communication purposes.
 */
const taskSchema = new Schema(
    {
        /**
         * CORE TASK IDENTIFICATION
         * 
         * BUSINESS REQUIREMENT: Every task must have a descriptive title for
         * identification and communication purposes across team members and
         * project stakeholders.
         */
        // Task title is required
        title: { type: String, required: true },

        /**
         * DATE MANAGEMENT SYSTEM
         * 
         * TEMPORAL TRACKING: Supports comprehensive date tracking for project
         * planning, deadline management, and timeline visualization.
         * 
         * DEFAULT BEHAVIOR: Main date defaults to creation time for immediate
         * task identification and chronological ordering.
         */
        // Main task date
        date: { type: Date, default: Date.now },

        // Optional start and due dates
        startDate: { type: Date },                  // PROJECT PLANNING: Task start scheduling
        dueDate: { type: Date },                    // DEADLINE MANAGEMENT: Task completion target

        /**
         * PRIORITY CLASSIFICATION SYSTEM
         * 
         * BUSINESS LOGIC: Four-tier priority system enables task prioritization
         * and resource allocation decisions. Default "normal" priority provides
         * balanced baseline for most tasks.
         * 
         * UI INTEGRATION: Priority levels map to visual indicators (colors, icons)
         * and sorting mechanisms throughout the application interface.
         * 
         * WORKFLOW IMPACT: High priority tasks can trigger notifications,
         * escalations, and special handling in business processes.
         */
        // Priority level for the task
        priority: {
            type: String,
            default: "normal",                      // BALANCED DEFAULT: Most tasks are normal priority
            enum: ["high", "medium", "normal", "low"], // PRIORITY LEVELS: Comprehensive priority range
        },

        /**
         * WORKFLOW STAGE MANAGEMENT
         * 
         * KANBAN SUPPORT: Three-stage workflow aligns with popular project
         * management methodologies and provides clear task progression tracking.
         * 
         * VALIDATION: Custom error messages improve user experience and
         * debugging when invalid stage values are provided.
         * 
         * BUSINESS PROCESS: Stage transitions can trigger automated actions,
         * notifications, and reporting updates throughout the system.
         */
        // Current task stage/status
        stage: {
            type: String,
            default: "todo",                        // INITIAL STATE: New tasks start in todo
            enum: {
                values: ["todo", "in-progress", "completed"], // WORKFLOW STATES: Complete task lifecycle
                message: "Stage must be either 'todo', 'in-progress', or 'completed'", // USER-FRIENDLY ERROR
            },
        },

        /**
         * TASK CATEGORIZATION SYSTEM
         * 
         * BUSINESS CLASSIFICATION: Predefined categories support organizational
         * workflows, reporting, and task filtering based on business processes.
         * 
         * REPORTING FOUNDATION: Categories enable analytics, resource allocation
         * tracking, and performance metrics across different work types.
         * 
         * EXTENSIBILITY: Category system can be extended to support organization-
         * specific workflows and business requirements.
         */
        // Task category used for classification
        category: {
            type: String,
            default: "report-created",              // DEFAULT CATEGORY: Most common task type
            enum: [
                "report-created",                   // REPORTING: New report generation
                "report-enhanced",                  // REPORTING: Report improvements
                "report-validated",                 // REPORTING: Report review and approval
                "config-new",                       // CONFIGURATION: New system setup
                "config-updated",                   // CONFIGURATION: System modifications
                "project-new",                      // PROJECT: New project initialization
                "other"                             // FLEXIBILITY: Catch-all for edge cases
            ],
        },

        /**
         * ACTIVITY TRACKING SYSTEM
         * 
         * AUDIT TRAIL: Comprehensive activity logging supports compliance,
         * debugging, and team communication by maintaining detailed history
         * of all task interactions and state changes.
         * 
         * COLLABORATION: Activity feed enables team coordination and provides
         * context for task decisions and progress updates.
         * 
         * USER ATTRIBUTION: Links activities to specific users for accountability
         * and communication purposes.
         */
        // Activity timeline for tracking task updates
        activities: [
            {
                // ACTIVITY TYPE CLASSIFICATION
                type: {
                    type: String,
                    default: "assigned",            // DEFAULT: Task creation activity
                    enum: [
                        "assigned",                 // WORKFLOW: Task assignment to team members
                        "started",                  // WORKFLOW: Task work initiation
                        "in-progress",              // WORKFLOW: Active work status
                        "bug",                      // ISSUE: Problem identification and tracking
                        "completed",                // WORKFLOW: Task completion
                        "commented",                // COMMUNICATION: Team collaboration
                    ],
                },
                activity: String,                   // DESCRIPTION: Human-readable activity description
                date: { type: Date, default: Date.now }, // TIMESTAMP: When activity occurred
                by: { type: Schema.Types.ObjectId, ref: "User" }, // ATTRIBUTION: User who performed activity
            },
        ],

        /**
         * SUB-TASK DECOMPOSITION SYSTEM
         * 
         * TASK BREAKDOWN: Enables hierarchical task organization where complex
         * tasks can be decomposed into smaller, manageable components for
         * detailed progress tracking and team coordination.
         * 
         * PROGRESS TRACKING: Sub-task completion status supports progress
         * calculations and milestone tracking for project management.
         * 
         * FLEXIBILITY: Optional fields support various sub-task complexity
         * levels from simple checklists to detailed work items.
         */
        // List of sub-tasks under the main task
        subTasks: [
            {
                title: String,                      // SUB-TASK IDENTIFICATION: Descriptive name
                date: Date,                         // SCHEDULING: Sub-task deadline or target date
                tag: String,                        // CLASSIFICATION: Sub-task categorization or labeling
                description: String,                // DETAILS: Comprehensive sub-task description
                isCompleted: Boolean,               // STATUS: Completion tracking for progress calculation
            },
        ],

        /**
         * DETAILED TASK INFORMATION
         * 
         * COMPREHENSIVE DOCUMENTATION: Optional detailed description supports
         * complex task requirements, specifications, and context that cannot
         * be captured in the title alone.
         * 
         * RICH CONTENT: Can store formatted text, requirements, specifications,
         * and other detailed information needed for task execution.
         */
        // Optional detailed description of the task
        description: String,

        /**
         * FILE ATTACHMENT SYSTEM
         * 
         * DOCUMENT MANAGEMENT: Supports file attachments for task-related
         * documents, images, specifications, and other resources needed
         * for task completion.
         * 
         * STORAGE STRATEGY: Stores file paths/URLs as strings, enabling
         * flexible storage backends (local disk, cloud storage, CDN).
         * 
         * COLLABORATION: Shared file access supports team collaboration
         * and resource sharing across task participants.
         */
        // File attachments or uploaded assets
        assets: [String],                           // FILE PATHS: Array of file references

        /**
         * EXTERNAL REFERENCE SYSTEM
         * 
         * INTEGRATION SUPPORT: Links to external resources, documentation,
         * repositories, or related systems that provide additional context
         * or resources for task completion.
         * 
         * FLEXIBILITY: Supports various link types including URLs, internal
         * references, and integration endpoints for comprehensive task context.
         */
        // External links attached to the task
        links: [String],                            // URL REFERENCES: Array of external links

        /**
         * TEAM ASSIGNMENT SYSTEM
         * 
         * COLLABORATION MODEL: Supports multi-user task assignment enabling
         * team-based work, shared responsibility, and collaborative task
         * completion workflows.
         * 
         * RELATIONSHIP MANAGEMENT: References User entities for data integrity
         * and enables complex queries for team-based reporting and analytics.
         * 
         * PERMISSION FOUNDATION: Team membership can drive access control
         * and notification systems throughout the application.
         */
        // Users assigned to the task
        team: [{ type: Schema.Types.ObjectId, ref: "User" }], // USER REFERENCES: Team member assignments

        /**
         * SOFT DELETE SYSTEM
         * 
         * DATA PRESERVATION: Implements soft delete pattern to maintain data
         * integrity and enable task recovery while providing clean user
         * interface by hiding deleted items from normal views.
         * 
         * AUDIT COMPLIANCE: Preserves deleted task data for audit trails,
         * compliance requirements, and business continuity purposes.
         * 
         * USER EXPERIENCE: Enables "undo" functionality and accidental
         * deletion recovery without permanent data loss.
         */
        // Whether the task has been moved to trash
        isTrashed: { type: Boolean, default: false}, // SOFT DELETE: Trash status flag
    },
    
    /**
     * SCHEMA OPTIONS
     * 
     * AUTOMATIC TIMESTAMPS: Mongoose automatically manages createdAt and
     * updatedAt fields for audit trails and data lifecycle tracking.
     * 
     * PERFORMANCE: Timestamps enable efficient sorting and filtering
     * operations for recent tasks and update tracking.
     */
    { timestamps: true }                            // AUTO-TIMESTAMPS: createdAt and updatedAt fields
);

/**
 * MODEL COMPILATION AND EXPORT
 * 
 * MONGOOSE MODEL: Compiles schema into a model for database operations,
 * providing the interface for CRUD operations, queries, and data validation.
 * 
 * COLLECTION NAMING: Mongoose automatically pluralizes "Task" to "tasks"
 * for the MongoDB collection name following naming conventions.
 */
const Task = mongoose.model("Task", taskSchema);
export default Task;

/**
 * SCHEMA DESIGN CONSIDERATIONS & BEST PRACTICES:
 * 
 * 1. DATA VALIDATION:
 *    - Required fields ensure data integrity for critical task information
 *    - Enum constraints prevent invalid values and maintain data consistency
 *    - Custom validation messages improve user experience and debugging
 * 
 * 2. PERFORMANCE OPTIMIZATION:
 *    - Index frequently queried fields (stage, priority, team, date)
 *    - Consider compound indexes for common query patterns
 *    - Use projection to limit returned fields in large result sets
 * 
 * 3. SCALABILITY CONSIDERATIONS:
 *    - Sub-tasks as embedded documents work well for moderate complexity
 *    - Consider separate SubTask collection for very complex hierarchies
 *    - Monitor document size limits (16MB in MongoDB)
 * 
 * 4. RELATIONSHIP MANAGEMENT:
 *    - User references enable data consistency and complex queries
 *    - Consider population strategies for different use cases
 *    - Implement cascade operations for user deletion scenarios
 * 
 * 5. BUSINESS LOGIC INTEGRATION:
 *    - Schema supports common project management workflows
 *    - Activity tracking enables comprehensive audit trails
 *    - Category system supports organizational reporting needs
 * 
 * 6. FUTURE ENHANCEMENTS:
 *    - Add custom fields support for organization-specific requirements
 *    - Implement task templates for recurring work patterns
 *    - Add time tracking fields for productivity analytics
 *    - Consider task dependencies for complex project management
 */