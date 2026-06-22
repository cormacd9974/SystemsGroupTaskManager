import express from "express";
import { 
    loginUser,
    logoutUser,
    registerUser,   
    getUserById,
    getTeamList,
    getNotificationList,
    updateUserProfile,
    markNotificationRead,
    changeUserPassword,
    activateUserProfile,
    deleteUserProfile,
    forgotPassword,
    resetPassword
} from "../controllers/userController.js";
import { isAdminRoute, protectRoute } from "../middleware/authMiddleware.js";

// Router for all user-related endpoints
const router = express.Router();

// Register a new user (admin-only)
router.post("/register", protectRoute, isAdminRoute, registerUser);

// Log in an existing user
router.post("/login", loginUser );

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Log out the current user
router.post("/logout", logoutUser );

// Get team member list
router.get("/get-team", protectRoute, getTeamList );

// Get notifications for the logged-in user
router.get("/notifications", protectRoute, getNotificationList );

// Update current user profile
router.put("/profile", protectRoute, updateUserProfile );

// Mark notifications as read
router.put("/read-noti", protectRoute, markNotificationRead );

// Change current user password
router.put("/change-password", protectRoute, changeUserPassword );

// Activate or deactivate a user (admin-only)
router.put("/:id", protectRoute, isAdminRoute, activateUserProfile );

// Delete a user (admin-only)
router.delete("/:id", protectRoute, isAdminRoute, deleteUserProfile );

export default router;