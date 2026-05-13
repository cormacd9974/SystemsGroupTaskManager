import clsx from "clsx";
import { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from "react-icons/md";
import { HiPencil, HiTrash } from "react-icons/hi";
import { toast } from "sonner";
import { useTrashTaskMutation } from "../redux/slices/api/taskApiSlice";
import { BGS, TASK_TYPE, formatDate, CATEGORY_LABEL, getInitials } from "../utils";
import { ConfirmationDialog } from "./index";
import { AddTask } from "./tasks";
import { Link } from "react-router-dom";

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

const Table = ({ tasks }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selected, setSelected] = useState(null);
    const [openEdit, setOpenEdit] = useState(false);
    const [deleteTask] = useTrashTaskMutation();

    const deleteHandler = async () => {
        try {
            const res = await deleteTask({ id: selected }).unwrap();
            toast.success(res?.message);
            setTimeout(() => {
                setOpenDialog(false);
                window.location.reload();
            }, 500);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full data-table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Team</th>
                                <th className="hidden md:table-cell">Created</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks?.map((task, i) => (
                                <tr key={i}>
                                    <td>
                                        <Link to={`/task/${task._id}`} className="group flex items-center gap-2">
                                            <div className={clsx("w-2.5 h-2.5 rounded-full shrink-0", TASK_TYPE[task.stage])} />
                                            <span className="font-medium text-gray-800 group-hover:text-blue-600 text-xs line-clamp-1">
                                                {task?.title}
                                            </span>
                                        </Link>
                                    </td>
                                    <td>
                                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200">
                                            {CATEGORY_LABEL[task?.category] || task?.category || "-"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={clsx("badge flex items-center gap-1 w-fit text-xs", PRIORITY_BADGE[task?.priority])}>
                                            {PRIORITY_ICON[task?.priority]}
                                            <span className="capitalize">{task?.priority}</span>
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex -space-x-1">
                                            {task?.team?.map((m, idx) => (
                                                <div key={idx} className={clsx("w-7 h-7 rounded-full text-white flex items-center justify-center text-xs border-2 border-white font-bold", BGS[idx % BGS.length])}>
                                                    {getInitials(m?.name || "?")}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="hideen md:table-cell text-gray-400 text-xs">
                                        {formatDate(new Date(task?.date))}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 justify-end">
                                            <button
                                                onClick={() => { setSelected(task); setOpenEdit(true); }}
                                                className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium"
                                            >
                                                <HiPencil /> Edit
                                            </button>
                                            <button
                                                onClick={() => { setSelected(task._id); setOpenDialog(true); }}
                                                className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-bred-100 px-2.5 py-1.5 rounded-lg font-medium"
                                            >
                                                <HiTrash /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <ConfirmationDialog
                open={openDialog}
                setOpen={setOpenDialog}
                onClick={deleteHandler}
            />
            {openEdit && <AddTask open={openEdit} setOpen={setOpenEdit} task={selected} key={selected?._id} />}
        </>
    );
};

export default Table;
