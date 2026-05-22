import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Notice from "../models/notis.js";
import {createJWT} from "../utils/index.js";

// Authenticate a user and return user info plus token
const loginUser = asyncHandler(async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        return res.status(401).json({status: false, message: "Invalid email or password."});
    }
    if(!user?.isActive) {
        return res.status(401).json({status: false, message: "Account deactivated. Contact Admin."});
    }
    const isMatch = await user.matchPassword(password);
    if(user && isMatch) {
        const token =createJWT(res, user._id);
        user.password = undefined;
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            title: user.title,
            role: user.role,
            isAdmin:  user.isAdmin,
            isActive: user.isActive,
            token
        });
    } else {
        return res.status(401).json({status: false, message: "Invalid email or password."});
    }
});

// Clear the auth cookie to log the user out
const logoutUser = asyncHandler(async(req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({message: "Logged out successfully"});
});

// Register a new user and issue a JWT token
const registerUser = asyncHandler(async(req, res) => {
   const {name, email, password, isAdmin, role, title} = req.body;
   const userExist = await User.findOne({email});
   if(userExist) {
    return res.status(400).json({status: false, message: "User already exists"});
   }
   const user = await User.create({
    name, email, password, isAdmin, role, title
   });
   if(user) {
    //isAdmin ? createJWT(res, user._id) : null;
    user.password = undefined;
    const token = createJWT(res, user._id);
    res.status(201).json({ ...user.toObject(), token });
   } else {
    return res.status(400).json({status: false, message: "Invalid user data."});
   }
});

// Get a single user by ID
const getUserById = asyncHandler(async(req, res) => {
    const{id} = req.params;
    const user = await User.findById(id).select("name email role title isActive");
    res.status(200).json(user);
});

// Return a filtered list of team members
const getTeamList = asyncHandler(async(req, res) => {
    const {search} = req.query;
    let query = {};
    if(search) {
        const searchQuery = {
            $or: [
                {title: {$regex: search, $options: "i"} },
                {name: {$regex: search, $options: "i"} },
                {role: {$regex: search, $options: "i"} },
                {email: {$regex: search, $options: "i"} },
            ],
        };
        query = { ...query, ...searchQuery};
    }
    const users = await User.find(query).select("name title email role isActive");
    res.status(200).json(users);
});

// Fetch notifications assigned to the current user
const getNotificationList = asyncHandler(async(req, res) => {
    const {userId} = req.user;
    const notices = await Notice.find({
        team: userId,
        isRead: { $nin: [userId] },
    }).populate("task", "title");
    res.status(200).json(notices);
});

// Update the user's profile information
const updateUserProfile = asyncHandler(async(req, res) => {
    const {userId, isAdmin} = req.user;
    const {_id} = req.body;
    const id = isAdmin && userId.toString() === _id?.toString() ? userId : isAdmin && userId.toString() !== _id?.toString() ? _id : userId;
    const user = await User.findById(id);
    if(user) {
        user.name = req.body.name || user.name;
        user.title = req.body.title || user.title;
        user.role = req.body.role || user.role;
        user.email = req.body.email || user.email;
        user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
        const updateUser = await user.save();
        updateUser.password = undefined;
        res.status(200).json({status: true, message: "Profile update successful", user: updateUser});
    } else {
        res.status(404).json({status: false, message: "User not found"});
    }
});

// Mark one notification or all notifications as read
const markNotificationRead = asyncHandler(async(req, res) => {
    const {userId} = req.user;
    const {isReadType, id} = req.query;
    if(isReadType === "all") {
        await Notice.updateMany({team: userId, isRead: {$nin:[userId]}},{$push: {isRead: userId}});
    } else {
        await Notice.findOneAndUpdate({_id: id, isRead: {$nin:[userId]}},{$push: {isRead: userId}}); 
    }
    res.status(200).json({status: true, message: "Done"});
});

// Update the current user's password
const changeUserPassword = asyncHandler(async(req, res) => {
    const {userId} = req.user;
    const user = await User.findById(userId);
    if(user) {
        user.password = req.body.password;
        await user.save();
        user.password = undefined;
        res.status(200).json({status: true, message: "Done"});
    } else {
        res.status(404).json({status: false, message: "User not found"});
    }
});

// Activate or deactivate a user profile
const activateUserProfile = asyncHandler(async(req, res) => {
    const {id} = req.params;
    const user = await User.findById(id);

    if(user) {
        user.isActive = req.body.isActive;
        await user.save();
        res.status(200).json({status: true, message: `User ${user.isActive ? "activated" : "deactivated"} successfully`});
    } else {
        res.status(404).json({status: false, message: "User not found"});
    }
});

// Delete a user profile permanently
const deleteUserProfile = asyncHandler(async(req, res) => {
    const {id} = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({status: true, message: "User deleted successfully"});
});

export {
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
};