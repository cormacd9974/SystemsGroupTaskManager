import asyncHandler from "express-async-handler";
import Notice from "../models/notis.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

const createTask = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.user;
        const { title, team, stage, date, priority, category, assets, links, description } = req.body;

        let text = "New task has been assigned to you";
        if (team?.length > 1) text += ` and ${team.length - 1} others.`;
        text += ` The task priority is set to ${priority} priority. The task date is ${new Date(date).toDateString()}. Thank you!`;

        const activity = { type: "assigned", activity: text, by: userId };
        const newLinks = links ? links.split(",") : [];

        const task = await Task.create({
            title,
            team,
            stage: stage ? stage.toLowerCase() : "todo",
            date,
            priority: priority.toLowerCase(),
            category: category ? category.toLowerCase().replace("_", "-") : "report-created",
            assets,
            activities: activity,
            links: newLinks,
            description,
        });

        await Notice.create({ team, text, task: task._id });

        const users = await User.find({ _id: team });
        for (const user of users) {
            await User.findByIdAndUpdate(user._id, { $push: { tasks: task._id } });
        }

        res.status(200).json({ status: true, task, message: "Task created successfully." });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

const duplicateTask = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const task = await Task.findById(id);

        let text = "New task has been assigned to you";
        if (task.team?.length > 1) text += ` and ${task.team.length - 1} others.`;
        text += ` The task priority is set to ${task.priority} priority. The task date is ${new Date(task.date).toDateString()}. Thank you!`;

        const activity = { type: "assigned", activity: text, by: userId };

        const newTask = await Task.create({
            title: "Duplicate - " + task.title,
            team: task.team,
            stage: task.stage,
            date: task.date,
            priority: task.priority,
            category: task.category,
            assets: task.assets,
            links: task.links,
            description: task.description,
            subTasks: task.subTasks,
            activities: activity,
        });

        await Notice.create({ team: newTask.team, text, task: newTask._id });
        res.status(200).json({ status: true, message: "Task duplicated successfully." });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
});

const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, date, team, stage, priority, category, assets, links, description } = req.body;
    try {
        const task = await Task.findById(id);
        task.title = title;
        task.date = date;
        task.priority = priority.toLowerCase();
        task.category = category ? category.toLowerCase() : task.category;
        task.assets = assets;
        task.stage = stage.toLowerCase();
        task.team = team;
        task.links = links ? links.split(",") : [];
        task.description = description;
        await task.save();
        res.status(200).json({ status: true, message: "Task updated successfully." });
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

const updateTaskStage = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;
        const task = await Task.findById(id);
        task.stage = stage.toLowerCase();
        await task.save();
        res.status(200).json({ status: true, message: "Task stage changed successfully." });
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

const updateSubTaskStage = asyncHandler(async (req, res) => {
    try {
        const { taskId, subTaskId } = req.params;
        const { status } = req.body;
        await Task.findOneAndUpdate(
            { _id: taskId, "subTasks._id": subTaskId },
            { $set: { "subTasks.$.isCompleted": status } }
        );
        res.status(200).json({ status: true, message: status ? "Marked completed" : "Marked uncompleted" });
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

const createSubTask = asyncHandler(async (req, res) => {
    const { title, tag, date } = req.body;
    const { id } = req.params;
    try {
        const task = await Task.findById(id);
        task.subTasks.push({ title, date, tag, isCompleted: false });
        await task.save();
        res.status(200).json({ status: true, message: "SubTask added successfully." });
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

const getTasks = asyncHandler(async (req, res) => {
    const { userId, isAdmin } = req.user;
    const { stage, isTrashed, search, category } = req.query;

    //let query = { isTrashed: isTrashed === "true" ? true : false };
    let query = {};

    if(isTrashed === "true"){
        query.isTrashed = true;
    } else {
        query.isTrashed = { $ne: true};
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        query.date = { $gte: oneYearAgo };
        if(!stage) {
            query.stage = { $ne: "completed" };
        }
    }

    if (!isAdmin) query.team = { $in: [userId] };
    if (stage) query.stage = stage;
    if (category) query.category = category;

    if (search) {
        query = {
            ...query,
            $or: [
                { title: { $regex: search, $options: "i" } },
                { stage: { $regex: search, $options: "i" } },
                { priority: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ],
        };
    }

    const tasks = await Task.find(query)
        .populate({ path: "team", select: "name title email" })
        .sort({ _id: -1 });

    res.status(200).json({ status: true, tasks });
});

const getTask = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id)
            .populate({ path: "team", select: "name title role email" })
            .populate({ path: "activities.by", select: "name" });
        res.status(200).json({ status: true, task });
    } catch (error) {
        throw new Error("Failed to fetch task", error);
    }
});

const postTaskActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;
    try {
        const task = await Task.findById(id);
        task.activities.push({ type, activity, by: userId });
        await task.save();
        res.status(200).json({ status: true, message: "Activity posted successfully." });
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

const trashTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Task.findById(id);
        task.isTrashed = true;
        await task.save();
        res.status(200).json({ status: true, message: "Task trashed successfully." });
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

const deleteRestoreTask = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { actionType } = req.query;

        if (actionType === "delete") {
            await Task.findByIdAndDelete(id);
        } else if (actionType === "deleteAll") {
            await Task.deleteMany({ isTrashed: true });
        } else if (actionType === "restore") {
            const t = await Task.findById(id);
            t.isTrashed = false;
            await t.save();
        } else if (actionType === "restoreAll") {
            await Task.updateMany({ isTrashed: true }, { $set: { isTrashed: false } });
        }

        res.status(200).json({ status: true, message: "Operation performed successfully." });
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

const dashboardStatistics = asyncHandler(async (req, res) => {
    try {
        const { userId, isAdmin } = req.user;
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() -1);
        const allTasks = isAdmin
            ? await Task.find({ isTrashed: false, date: { $gte: oneYearAgo } })
                .populate({ path: "team", select: "name role title email" })
                .sort({ _id: -1 })
            : await Task.find({ isTrashed: false, team: { $in: [userId] }, date: { $gte: oneYearAgo } })
                .populate({ path: "team", select: "name role title email" })
                .sort({ _id: -1 });

        const users = await User.find({ isActive: true })
            .select("name title role isActive createdAt")
            .limit(10)
            .sort({ _id: -1 });

        const groupedTasks = allTasks.reduce((result, task) => {
            result[task.stage] = (result[task.stage] || 0) + 1;
            return result;
        }, {});

        const graphData = Object.entries(
            allTasks.reduce((result, task) => {
                result[task.priority] = (result[task.priority] || 0) + 1;
                return result;
            }, {})
        ).map(([name, total]) => ({ name, total }));

        const teamStatus = await Promise.all(
            users.map(async (u) => {
                const inProgressTasks = await Task.find({
                    isTrashed: false,
                    stage: "in-progress",
                    team: { $in: [u._id] },
                })
                    .select("title priority category date")
                    .sort({ _id: -1 });
                return { ...u.toObject(), inProgressTasks };
            })
        );

        res.status(200).json({
            status: true,
            totalTasks: allTasks.length,
            last10Task: allTasks.slice(0, 10),
            users: isAdmin ? users : [],
            teamStatus: isAdmin ? teamStatus : [],
            tasks: groupedTasks,
            graphData,
            message: "Successfully.",
        });
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

const getTaskHistory = asyncHandler(async (req, res) => {
    try {
        const { isAdmin, userId } = req.user;
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() -1);
        const query = isAdmin 
        ? { isTrashed: false, stage: "completed", date: { $gte: oneYearAgo } } 
        : { isTrashed: false, stage: "completed", team: { $in: [userId] }, date: { $gte: oneYearAgo } };

       

        const tasks = await Task.find(query)/*({
            isTrashed: false,
            stage: "completed"
        })*/
            .populate({ path: "team", select: "name title email" })
            .sort({ updatedAt: -1 });

        res.status(200).json({ status: true, tasks });
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

export {
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
};