import cron from "node-cron";
import Task from "../models/taskModel.js";
import { sendDueSoonEmail, sendOverdueEmail } from "./emailService.js";

export const runEmailChecks = async () => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
        const dueSoonTasks = await Task.find({
            isTrashed: false,
            stage: { $ne: "completed" },
            dueDate: { $gte: now, $lte: in24h },
            dueSoonNotified: false,
        }).populate("team", "name email");

        for (const task of dueSoonTasks) {
            for (const member of task.team) {
                if (member.email) {
                    await sendDueSoonEmail({
                        to: member.email,
                        name: member.name,
                        taskTitle: task.title,
                        dueDate: task.dueDate,
                        taskId: task._id,
                    });
                }
            }
            task.dueSoonNotified = true;
            await task.save();
        }

        const overdueTasks = await Task.find({
            isTrashed: false,
            stage: { $ne: "completed" },
            dueDate: { $lt: now },
            overdueNotified: false,
        }).populate("team", "name email");

        for (const task of overdueTasks) {
            for (const member of task.team) {
                if (member.email) {
                    await sendOverdueEmail({
                        to: member.email,
                        name: member.name,
                        taskTitle: task.title,
                        dueDate: task.dueDate,
                        taskId: task._id,
                    });
                }
            }
            task.overdueNotified = true;
            await task.save();
        }

        console.log(`Scheduler: ${dueSoonTasks.length} due-soon, ${overdueTasks.length} overdue emails sent.`);
    } catch (err) {
        console.error("Scheduler error:", err.message);
    }
};

export const startScheduler = () => {
    cron.schedule("0 8 * * *", runEmailChecks);
    console.log("Email scheduler started.");
};

