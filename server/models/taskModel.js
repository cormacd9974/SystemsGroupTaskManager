import mongoose, { Schema } from "mongoose";

// Schema for storing task data
const taskSchema = new Schema(
    {
        // Task title is required
        title: { type: String, required: true },

        // Main task date
        date: { type: Date, default: new Date() },

        // Optional start and due dates
        startDate: { type: Date },
        dueDate: { type: Date },

        // Priority level for the task
        priority: {
            type: String,
            default: "normal",
            enum: ["high", "medium", "normal", "low"],
        },

        // Current task stage/status
        stage: {
            type: String,
            default: "todo",
            enum: {
                values: ["todo", "in-progress", "completed"],
                message: "Stage must be either 'todo', 'in-progress', or 'completed'",
            },
        },

        // Task category used for classification
        category: {
            type: String,
            default: "report-created",
            enum: [
                "report-created",
                "report-enhanced",
                "report-validated",
                "config-new",
                "config-updated",
                "project-new",
            ],
        },

        // Activity timeline for tracking task updates
        activities: [
            {
                type: {
                    type: String,
                    default: "assigned",
                    enum: [
                        "assigned",
                        "started",
                        "in-progress",
                        "bug",
                        "completed",
                        "commented",
                    ],
                },
                activity: String,
                date: { type: Date, default: new Date() },
                by: { type: Schema.Types.ObjectId, ref: "User" },
            },
        ],

        // List of sub-tasks under the main task
        subTasks: [
            {
                title: String,
                date: Date,
                tag: String,
                description: String,
                isCompleted: Boolean,
            },
        ],

        // Optional detailed description of the task
        description: String,

        // File attachments or uploaded assets
        assets: [String],

        // External links attached to the task
        links: [String],

        // Users assigned to the task
        team: [{ type: Schema.Types.ObjectId, ref: "User" }],

        // Whether the task has been moved to trash
        isTrashed: { type: Boolean, default: false},
    },
    { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;