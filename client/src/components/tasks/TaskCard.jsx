import clsx from "clsx";
import { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { useSelector } from "react-redux";
import { TASK_TYPE, formatDate, CATEGORY_LABEL} from "../../utils";
import { Link } from "react-router-dom";
import { AddSubTask, TaskAssets, TaskDialog } from "./index";
import { UserInfo } from "../index";

// Styling classes used for displaying priority badges
const PRIORITY_BADGE = {
    high: "text-red-600 bg-red-50 border border-red-200",
    medium: "text-amber-600 bg-amber-50 border border-amber-200",
    normal: "text-blue-600 bg-blue-50 border border-blue-200",
    low: "text-slate-500 bg-slate-50 border border-slate-200"
};

// Icons used for each priority level
const PRIORITY_ICON = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    normal: <MdKeyboardArrowDown />,
    low: <MdKeyboardArrowDown />
};

// Styling classes used for task category badges
const CATEGORY_COLOR = {
    "report-created": "bg-blue-50 text-blue-600 border border-blue-200",
    "report-enhanced": "bg-cyan-50 text-cyan-600 border border-cyan-200",
    "report-validated": "bg-teal-50 text-teal-600 border border-teal-200",
    "config-new": "bg-violet-50 text-violet-600 border border-violet-200",
    "config-updated": "bg-purple-50 text-purple-600 border border-purple-200",
    "project-new": "bg-emerald-50 text-emerald-600 border border-emerald-200",
};

// Card component used to display a single task summary
const TaskCard = ({ task }) => {
    // Get authenticated user from Redux store
    const { user } = useSelector((state) => state.auth);

    // Controls AddSubTask modal visibility
    const [open, setOpen] = useState(false);

    //const [showName, setShowName] = useState(null);

    // Normalize category for consistent access
    const cat = task?.category?.toLowerCase();

    return (
        <>
            <div className={clsx(
                "w-full rounded-2xl p-4 shadow-sm card-lift",
                task?.dueDate && new Date(task.dueDate) < new Date() && task.stage !== "completed"
                    ? "border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-700"
                    : "bg-white border-gray-100"
            )}>
                {/* Top row: priority badge and task actions dialog */}
                <div className="flex items-center justify-between mb-3">
                    <span className={clsx("badge flex items-center gap-1 text-xs border", PRIORITY_BADGE[task?.priority])}>
                        <span className="text-sm">{PRIORITY_ICON[task?.priority]}</span>
                        <span className="capitalize">{task?.priority}</span>
                    </span>
                    <TaskDialog task={task} />
                </div>

                {/* Category badge */}
                {cat && (
                    <span className={clsx("badge text-xs border mb-2 inline-flex", CATEGORY_COLOR[cat])}>
                        {CATEGORY_LABEL[cat]}
                    </span>
                )}

                {/* Task title and stage indicator; clicking opens task details page */}
                <Link to={`/task/${task._id}`}>
                    <div className="flex items-start gap-2 mb-3">
                        <div className={clsx("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0", TASK_TYPE[task.stage])} />
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                            {task?.title}
                        </h4>
                    </div>
                </Link>

                {/* Optional start date and due date information */}
                <div>
                    {task?.startDate && <p className="text-xs text-gray-400">Start: {formatDate(new Date(task.startDate))}</p>}
                    {task?.dueDate && (
                        <p className={`text-xs font-medium ${new Date(task.dueDate) < new Date() ? "text-red-400" : new Date(task.dueDate) - new Date () < 3 * 24 * 60 * 60 * 1000 ? "text-orange-400" : "text-gray-400"}`}>
                            Due: {formatDate(new Date(task.dueDate))}
                            {new Date(task.dueDate) < new Date() && " ⚠️ (Overdue)"}
                            {new Date(task.dueDate) - new Date() < 3 * 24 * 60 * 60 * 1000 && new Date(task.dueDate) > new Date() && " ⏰ (Due Soon)"}
                        </p>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-3" />

                {/* Bottom row: task stats and assigned team members */}
                <div className="flex items-center justify-between">
                    <TaskAssets
                        activities={task?.activities?.length}
                        subTasks={task?.subTasks}
                        assets={task?.assets?.length}
                    />

                    {/* Team member avatars */}
                    <div className="flex items-center">
                        <div className="flex -space-x-2 items-center overflow-hidden">
                        {task?.team?.slice(0, 3).map((m, i) => (
                            <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center text-sm border-2 border-white font-semibold" style={{ backgroundColor: ["#0068B5", "#005a9e", "#004f8c", "#0079cc", "#0086e0", "#003d6b", "#0057a0", "#0073c6"][i % 8] }}>
                                <UserInfo user={m} />
                            </div>
                        ))}

                        {/* Extra team count if more than 3 members are assigned */}
                        {task?.team?.length > 3 && (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm border-2 border-white font-semibold text-white" style={{ backgroundColor: "#0068B5" }}>
                                +{task.team.length - 3}
                            </div>
                        )}
                    </div>
                    </div>
                </div>

                {/* Sub-task preview and progress section */}
                {task?.subTasks?.length > 0 ? (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-1.5">
                        {/* Show the first sub-task title as a quick preview */}
                        <p className="text-xs font-medium text-gray-700 line-clamp-1 flex-1">
                            {task.subTasks[0].title}
                        </p>

                        {/* Display completed sub-task count out of total */}
                        <span className="text-xs text-gray-400 ml-2 shrink-0">
                            {task.subTasks.filter( s => s.isCompleted).length}/{task.subTasks.length}
                        </span>
                        </div>

                        {/* Progress bar showing sub-task completion percentage */}
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={clsx("h-full rounded-full transition-all",
                                task.subTasks.filter( s => s.isCompleted).length === task.subTasks.length
                                ? "bg-emerald-400"
                                : task.subTasks.filter( s => s.isCompleted).length === 0 
                                ? "bg-gray-300"
                                : "bg-[#0068B5]"
                              )}
                              style = {{ width: `${(task.subTasks.filter( s => s.isCompleted).length / task.subTasks.length) * 100}%`}}
                            />
                        </div>
                    </div>
                ) : (
                    // Fallback when no sub-tasks exist
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-300">No sub-tasks</span>
                    </div>
                )}

                {/* Button to open the AddSubTask modal
                    Only admins are allowed to use it */}
                <button
                    disabled={!user.isAdmin}
                    onClick={() => setOpen(true)}
                    className="w-full flex items-center gap-2 mt-3 text-xs text-blue-500 hover:text-blue-700 font-semibold disabled:cursor-not-allowed disabled:text-gray-300"
                >
                    <IoMdAdd className="text-sm" />
                    <span>Add Sub Task</span>
                </button>
            </div>

            {/* Modal for creating a new sub-task under the current task */}
            <AddSubTask open={open} setOpen={setOpen} id={task._id} />
        </>
    )
};

// Export the TaskCard component
export default TaskCard;