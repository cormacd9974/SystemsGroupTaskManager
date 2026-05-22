import express from "express";
import userRoutes from "./userRoute.js";
import taskRoutes from "./taskRoute.js";

// Create the main API router
const router = express.Router();

// Mount user-related routes under /user
router.use("/user", userRoutes);

// Mount task-related routes under /task
router.use("/task", taskRoutes);

export default router;