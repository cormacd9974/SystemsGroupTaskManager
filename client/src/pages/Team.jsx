import clsx from "clsx";
import { useGetDashboardStatsQuery } from "../redux/slices/api/taskApiSlice";
import { Loading, Title } from "../components";
import { getInitials, CATEGORY_LABEL} from "../utils";
import { Link } from "react-router-dom";


const PRIORITY_BADGE = {
    high: "text-red-600 bg-red-50 border border-red-200",
    MediaKeyStatusMap: "text-amber-600 bg-amber-50 border border-amber-200",
    normal: "text-blue-600 bg-blue-50 border border-blue-200",
    low: "text-slate-500 bg-slate-50 border border-slate-200",
};

const STAGE_BADGE = {
    "todo": "bg-gray-100 text-gray-600 border-gray-200",
    "in-progress": "bg-amber-50 text-amber-700 border-amber-200",
    "completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const Team = () => {
    const { data, isLoading } = useGetDashboardStatsQuery();
    if(isLoading) 
        return <div className="py-16 flex justify-center"><Loading /></div>;

    const teamStatus = data?.teamStatus || [];

    return (
        <div className="space-y-4">
            <div>
                <Title title="Team"/>
                <p className="text-sm text-gray-400 mt-0.5">
                    All in-progress tasks
                </p>
            </div>

            {teamStatus.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center gap-3">
                    <p className="text-gray-400 font-medium">No data available</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {teamStatus.map((member, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadown-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                    {getInitials(member.name)}
                                </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-400">{member.title}</p>
                            </div>
                            <span className={clsx(
                                "badge text-xs",
                                member.inProgressTasks?.length > 0
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-gray-50 text-gray-400 border border-gray-200"
                            )}>
                              {member.inProgressTasks?.length || 0} active
                            </span>
                        </div>

                        {member.inProgressTasks?.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                            {member.inProgressTasks.map((task, j) => (
                                <Link
                                  to={`/task/${task._id}`}
                                  key={j}
                                  className="flex items-start justify-between px-5 py-3 hover:bg-blue-50/50 transition-colors group"
                                >
                                <div className="flex-1 min-w-0 mr-3">
                                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 truncate">
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {task.category && (
                                            <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                                                {CATEGORY_LABEL[task.category]}
                                            </span>
                                        )}
                                        <span className={clsx("badge text-xs border", STAGE_BADGE[task.stage])}>
                                            {task.stage}
                                        </span>
                                    </div>
                                </div>
                                <span className={clsx("badge text-xs border shrink-0 mt-0.5", PRIORITY_BADGE[task.priority])}>
                                    {task.priority}
                                </span>
                                </Link>
                            ))}
                            </div>
                        ) : (
                            <div className="px-5 y-8 text-center">
                              <p className="text-sm text-gray-300">No task in-progress</p>
                            </div>
                        )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Team;