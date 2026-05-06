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
    deleteUserProfile
} from "../controllers/userController.js";
import { isAdminRoute, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", protectRoute, isAdminRoute, registerUser);
router.post("/login", loginUser );
router.post("/logout", logoutUser );

router.get("/get-team", protectRoute, getTeamList );
router.get("/notifications", protectRoute, getNotificationList );

router.put("/profile", protectRoute, updateUserProfile );
router.put("/read-noti", protectRoute, markNotificationRead );
router.put("/change-password", protectRoute, changeUserPassword );
router.put("/:id", protectRoute, isAdminRoute, activateUserProfile );

router.delete("/:id", protectRoute, isAdminRoute, deleteUserProfile );

export default router;
