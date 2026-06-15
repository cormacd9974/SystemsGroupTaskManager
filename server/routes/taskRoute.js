import { isAdminRoute, protectRoute } from "../middleware/authMiddleware.js";
import express from "express";
import {
    createSubTask,
    createTask,
    dashboardStatistics,
    deleteRestoreTask,
    duplicateTask,
    getTask,
    getTasks,
    getTaskHistory,
    postTaskActivity,
    trashTask,
    updateSubTaskStage,
    updateTask,
    updateTaskStage,
} from "../controllers/taskController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { runEmailChecks } from "../utils/scheduler.js";

// Router for all task-related endpoints
const router = express.Router();

// Create a new task
router.post("/create", protectRoute, createTask );

// Duplicate an existing task
router.post("/duplicate/:id", protectRoute, duplicateTask );

// Add activity to a task
router.post("/activity/:id", protectRoute, postTaskActivity );

// Upload files and return uploaded file URLs
router.post("/upload", protectRoute, upload.array("files", 10), (req, res) =>{
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ status: false, message: "No files uploaded"});
    }
    const urls =  req.files.map(f => `/uploads/${f.filename}`);
    res.status(200).json({ status: true, urls});
} , (err, req, res, next) => {
    res.status(400).json({ status: false, message: err.message});
})

// Dashboard stats for tasks
router.get("/dashboard", protectRoute, dashboardStatistics );

// Completed task history
router.get("/history", protectRoute, getTaskHistory );

// Get all tasks
router.get("/", protectRoute, getTasks);

// Get a single task by ID
router.get("/:id", protectRoute, getTask );

// Add a sub-task
router.put("/create-subtask/:id", protectRoute, createSubTask );

// Update a task
router.put("/update/:id", protectRoute, updateTask);

// Change task stage
router.put("/change-stage/:id", protectRoute, updateTaskStage );

// Update a sub-task completion status
router.put("/change-status/:taskId/:subTaskId", protectRoute, updateSubTaskStage);

// Move task to trash
router.put("/:id", protectRoute, trashTask );

// Permanently delete or restore trashed tasks
router.delete("/delete-restore", protectRoute, deleteRestoreTask );
router.delete("/delete-restore/:id", protectRoute, deleteRestoreTask );

router.get("/test-email-scheduler", protectRoute, async (req, res) => {
    await runEmailChecks();
    res.json({ status: true, message: "Scheduler triggered successfully"});
});

export default router;