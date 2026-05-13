import clsx from "clsx";
import { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { useSelector } from "react-redux";
import { BGS, TASK_TYPE, formatDate, CATEGORY_LABEL, getInitials } from "../../utils";
import { Link } from "react-router-dom";
import { AddSubTask, TaskAssets, TaskDialog } from "./index";

const PRIORITY_BADGE = {
    high: "text-red-600 bg-red-50 border border-red-200",
    medium: "text-amber-600 bg-amber-50 border border-amber-200",
    normal: "text-blue-600 bg-blue-50 border border-blue-200",
    low: "text-slate-500 bg-slate-50 border border-slate-200"
};

const PRIORITY_ICON = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    normal: <MdKeyboardArrowDown />,
    low: <MdKeyboardArrowDown />
};

const CATEGORY_COLOR = {
    "report-created": "bg-blue-50 text-blue-600 border border-blue-200",
    "report-enhanced": "bg-cyan-50 text-cyan-600 border border-cyan-200",
    "report-validated": "bg-teal-50 text-teal-600 border border-teal-200",
    "config-new": "bg-violet-50 text-violet-600 border border-violet-200",
    "config-updated": "bg-purple-50 text-purple-600 border border-purple-200",
    "project-new": "bg-emerald-50 text-emerald-600 border border-emerald-200",
};

const TaskCard = ({ task }) => {
    const { user } = useSelector((state) => state.auth);
    const [open, setOpen] = useState(false);
    const [showName, setShowName] = useState(null);
    const cat = task?.category?.toLowerCase();

    return (
        <>
            <div className="w-full bg-white rounded-2xl border-gray-100 p-4 shadow-sm card-lift">
                <div className="flex items-center justify-between mb-3">
                    <span className={clsx("badge flex items-center gap-1 text-xs border", PRIORITY_BADGE[task?.priority])}>
                        <span className="text-sm">{PRIORITY_ICON[task?.priority]}</span>
                        <span className="capitalize">{task?.priority}</span>
                    </span>
                    <TaskDialog task={task} />
                </div>

                {cat && (
                    <span className={clsx("badge text-xs border mb-2 inline-flex", CATEGORY_COLOR[cat])}>
                        {CATEGORY_LABEL[cat]}
                    </span>
                )}

                <Link to={`/task/${task._id}`}>
                    <div className="flex items-start gap-2 mb-3">
                        <div className={clsx("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0", TASK_TYPE[task.stage])} />
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                            {task?.title}
                        </h4>
                    </div>
                </Link>
                <p className="text-xs text-gray-400 ml-4 mb-3">{formatDate(new Date(task?.date))}</p>
                <div className="border-t border-gray-100 my-3" />
                <div className="flex items-center justify-between">
                    <TaskAssets
                        activities={task?.activities?.length}
                        subTasks={task?.subTasks}
                        assets={task?.assets?.length}
                    />
                    <div className="flex -space-x-1.5 items-center">
                        {task?.team?.slice(0, 3).map((m, i) => (
                            <div className="relative" key={i}>
                                <div
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowName(showName === i ? null : i); }}
                                    className={clsx("w-8 h-8 rounded-full text-white flex items-center justify-center text-xs border-2 border-white font-bold tracking-wide cursor-pointer", BGS[i % BGS.length])}
                                >
                                    {getInitials(m?.name || "?")}
                                </div>
                                {showName === i && (
                                    <div className="absolute bottom-10 left-0 bg-white shadow-xl rounded-xl p-3 z-50 whitespace-nowrap border border-gray-100 min-w-35">
                                        <p className="font-semibold text-gray-800 text-xs">{m?.name}</p>
                                        <p className="text-gray-400 text-xs mt-0.5">{m?.title}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {task?.team?.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs border-2 border-white font-bold">
                                +{task.team.length - 3}
                            </div>
                        )}
                    </div>
                </div>

                {task?.subTasks?.length > 0 ? (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-baseline">
                        <p className="text-xs font-medium text-gray-700 line-clamp-1 flex-1">
                            {task.subTasks[0].title}
                        </p>
                        {task.subTasks[0].tag && (
                            <span className="ml-2 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                                {task.subTasks[0].tag}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-300">No sub-tasks</span>
                    </div>
                )}

                <button
                    disabled={!user.isAdmin}
                    onClick={() => setOpen(true)}
                    className="w-full flex items-center gap-2 mt-3 text-xs text-blue-500 hover:text-blue-700 font-semibold disabled:cursor-not-allowed disabled:text-gray-300"
                >
                    <IoMdAdd className="text-sm" />
                    <span>Add Sub Task</span>
                </button>
            </div>
            <AddSubTask open={open} setOpen={setOpen} id={task._id} />
        </>
    )
};

export default TaskCard;
