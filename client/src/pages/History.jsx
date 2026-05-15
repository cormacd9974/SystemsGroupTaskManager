import clsx from "clsx";
import moment from "moment";
import { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from "react-icons/md";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { Loading, Title, UserInfo } from "../components";
import { useGetTaskHistoryQuery } from "../redux/slices/api/taskApiSlice";
import { CATEGORY_LABEL } from "../utils";
import { Link } from "react-router-dom";

const PRIORITY_BADGE = { 
    high:"text-red-600 bg-red-50 border border-red-200", 
    medium:"text-amber-600 bg-amber-50 border border-amber-200", 
    normal:"text-blue-600 bg-blue-50 border border-blue-200", 
    low:"text-slate-500 bg-slate-50 border border-slate-200" 
};
const PRIORITY_ICON  = { 
    high:<MdKeyboardDoubleArrowUp />, 
    medium:<MdKeyboardArrowUp />, 
    normal:<MdKeyboardArrowDown />, 
    low:<MdKeyboardArrowDown /> 
};

const History = () => {
    const { data, isLoading }= useGetTaskHistoryQuery();
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCat] = useState("all");

    if(isLoading) 
        return <div className="py-16 flex justify-center"><Loading /></div>;

    const tasks = data?.tasks || [];

    const filtered = tasks.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCategory === "all" ||t.category?.startsWith(filterCategory);
        return matchCat && matchSearch;
    });

    const categories = [
        {key: "all", label: "All"},
        {key: "report", label: "Reports"},
        {key: "config", label: "Configurations"},
        {key: "project", label: "Projects"},
    ];

    return (
        <div className="space-y-4">
            <div>
                <Title title="History"/>
                <p className="text-sm text-gray-400 mt-0.5">
                    Completed tasks over the past year.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input 
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-field max-w-xs"
                />
                <div className="flex gap-2 flex-wrap">
                    {categories.map(c => (
                        <button
                          key={c.key}
                          onClick={() => setFilterCat(c.key)}
                          className={clsx(
                            "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                            filterCategory === c.key
                            ? "text-white border-[#0068B5] bg-[#0068B5]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                          )}
                        >
                          {c.label}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-gray-400 ml-auto">{filtered.length} tasks</span>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center gap-3">
                    <HiOutlineClipboardCheck className="text-5xl text-gray-500"/>
                    <p className="text-gray-400 font-medium">No completed tasks found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full data-table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Team</th>
                                    <th className="hidden md:table-cell">Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((task, i) => (
                                    <tr key={i}>
                                        <td>
                                            <Link to={`/task/${task._id}`} className="group flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                              <span className="font-medium text-gray-800 group-hover:text-blue-600 text-xs line-clamp-1">
                                                {task.title}
                                              </span>
                                            </Link>
                                        </td>
                                        <td>
                                            <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                                                {CATEGORY_LABEL[task.category] || task.category || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={clsx("badge text-xs flex items-center gap-1 w-fit", PRIORITY_BADGE[task.priority])}>
                                                {PRIORITY_ICON[task.priority]}
                                                <span className="capitalize">{task.priority}</span>
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex -space-x-1 items-center">
                                            {task?.team?.slice(0, 3).map((m, idx) => (
                                                <div key={idx} 
                                                className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs border-2 border-white font-bold" 
                                                style={{ backgroundColor: ["#0068B5", "#005a9e", "#004f8c", "#0079cc", "#0086e0", "#003d6b", "#0057a0", "#0073c6"][idx % 8] }}
                                                title={m?.name}
                                                >
                                                    <UserInfo user={m} />
                                                </div>
                                            ))}
                                            {task?.team?.length > 3 && (
                                                <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs border-2 border-white font-bold"
                                                style={{ backgroundColor: "#003d6b"}}>
                                                    +{task.team.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        </td>
                                        <td className="hidden md:table-cell text-gray-400 text-xs">
                                            {moment(task.updatedAt).format("DD MM YYYY")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;