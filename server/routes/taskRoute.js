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

const router = express.Router();

router.post("/create", protectRoute, createTask );
router.post("/duplicate/:id", protectRoute, duplicateTask );
router.post("/activity/:id", protectRoute, postTaskActivity );
router.post("/upload", protectRoute, upload.array("files", 10), (req, res) =>{
    const urls =  req.files.map(f => `/uploads/${f.filename}`);
    res.status(200).json({ status: true, urls});
})

router.get("/dashboard", protectRoute, dashboardStatistics );
router.get("/history", protectRoute, getTaskHistory );
router.get("/", protectRoute, getTasks);
router.get("/:id", protectRoute, getTask );

router.put("/create-subtask/:id", protectRoute, createSubTask );
router.put("/update/:id", protectRoute, updateTask);
router.put("/change-stage/:id", protectRoute, updateTaskStage );
router.put("/change-status/:taskId/:subTaskId", protectRoute, updateSubTaskStage);
router.put("/:id", protectRoute, trashTask );

router.delete("/delete-restore", protectRoute, deleteRestoreTask );
router.delete("/delete-restore/:id", protectRoute, deleteRestoreTask );

export default router;