import clsx from "clsx";
import moment from "moment";
import { useEffect } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from "react-icons/md";
import { HiCheckCircle, HiClock, HiCollection, HiLightningBolt } from "react-icons/hi";
import { Chart, Loading, UserInfo } from "../components";
import { useGetDashboardStatsQuery } from "../redux/slices/api/taskApiSlice";
import { BGS, TASK_TYPE, CATEGORY_LABEL, getInitials } from "../utils";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const PRIORITY_BADGE = { high:"text-red-600 bg-red-50 border border-red-200", medium:"text-amber-600 bg-amber-50 border border-amber-200", normal:"text-blue-600 bg-blue-50 border border-blue-200", low:"text-slate-500 bg-slate-50 border border-slate-200" };
const PRIORITY_ICON  = { high:<MdKeyboardDoubleArrowUp />, medium:<MdKeyboardArrowUp />, normal:<MdKeyboardArrowDown />, low:<MdKeyboardArrowDown /> };

const StatCard = ({ label, count, icon, colorClass, accent }) => (
  <div className={clsx("stat-card p-5 card-lift", colorClass)}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{count}</p>
        <p className="text-xs text-gray-400 mt-1">Past year</p>
      </div>
      <div className={clsx("w-11 h-11 rounded-xl flex items-center justify-center text-xl", accent)}>{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading } = useGetDashboardStatsQuery(undefined, { refetchOnMountOrArgChange:true });

  const { user } = useSelector(s => s.auth);
  useEffect(() => { window.scrollTo({ top:0, left:0, behavior:"smooth" }); }, []);
  const totals = data?.tasks || {};
  if (isLoading) return <div className="py-16 flex justify-center"><Loading /></div>;
  const stats = [
    { label:"Total Tasks",  total:data?.totalTasks||0,        icon:<HiCollection className="text-blue-600" />,    colorClass:"blue",  accent:"bg-blue-50 text-blue-600" },
    { label:"Completed",    total:totals["completed"]||0,      icon:<HiCheckCircle className="text-emerald-600" />, colorClass:"green", accent:"bg-emerald-50 text-emerald-600" },
    { label:"in-progress",  total:totals["in-progress"]||0,    icon:<HiLightningBolt className="text-amber-600" />, colorClass:"amber", accent:"bg-amber-50 text-amber-600" },
    { label:"To Do",        total:totals["todo"]||0,           icon:<HiClock className="text-rose-600" />,          colorClass:"rose",  accent:"bg-rose-50 text-rose-600" },
  ];
  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {user?.name?.split(" ")[0]} 👋</h2>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's happening with your team today.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-gray-700">{moment().format("dddd, MMMM D")}</p>
          <p className="text-xs text-gray-400">{moment().format("YYYY")}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s,i) => <StatCard key={i} {...s} count={s.total} />)}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Priority Breakdown</h3>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">All tasks</span>
        </div>
        <div className="w-full overflow-visible">
          <Chart data={data?.graphData} />
        </div>
        
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        {data && <RecentTasksTable tasks={data?.last10Task} />}
        {data && user?.isAdmin && <TeamMembersTable users={data?.users} />}
      </div>
      {user?.isAdmin && data?.teamStatus?.length > 0 && <TeamWorkPanel teamStatus={data.teamStatus} />}
    </div>
  );
};

const RecentTasksTable = ({ tasks }) => (
  <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 text-sm">Recent Tasks</h3></div>
    <table className="w-full data-table">
      <thead><tr><th>Task</th><th>Priority</th><th>Team</th><th className="hidden md:table-cell">Created</th></tr></thead>
      <tbody>
        {tasks?.map((task,i) => (
          <tr key={i}>
            <td><div className="flex items-center gap-2"><div className={clsx("w-2 h-2 rounded-full shrink-0", TASK_TYPE[task.stage])} /><span className="font-medium text-gray-800 text-xs line-clamp-1">{task?.title}</span></div></td>
            <td><span className={clsx("badge text-xs flex items-center gap-1 w-fit", PRIORITY_BADGE[task?.priority])}>{PRIORITY_ICON[task?.priority]}<span className="capitalize">{task?.priority}</span></span></td>
            <td><div className="flex -space-x-1">{task?.team?.map((m,idx) => (<div key={idx} className={clsx("w-6 h-6 rounded-full text-white flex items-center justify-center text-xs border-2 border-white", BGS[idx%BGS.length])}><UserInfo user={m} /></div>))}</div></td>
            <td className="hidden md:table-cell text-gray-400 text-xs">{moment(task?.date).fromNow()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TeamMembersTable = ({ users }) => (
  <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 text-sm">Team Members</h3></div>
    <table className="w-full data-table">
      <thead><tr><th>Name</th><th>Status</th><th>Joined</th></tr></thead>
      <tbody>
        {users?.map((user,i) => (
          <tr key={i}>
            <td><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{getInitials(user?.name)}</div><div><p className="font-medium text-gray-900 text-xs">{user.name}</p><p className="text-gray-400 text-xs">{user?.role}</p></div></div></td>
            <td><span className={clsx("badge text-xs", user?.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200":"bg-amber-50 text-amber-700 border border-amber-200")}>{user?.isActive?"Active":"Inactive"}</span></td>
            <td className="text-gray-400 text-xs">{moment(user?.createdAt).fromNow()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TeamWorkPanel = ({ teamStatus }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100">
      <h3 className="font-bold text-gray-900 text-sm">What the team is working on</h3>
      <p className="text-xs text-gray-400 mt-0.5">All in-progress tasks by member</p>
    </div>
    <div className="divide-y divide-gray-100">
      {teamStatus.map((member,i) => (
        <div key={i} className="px-5 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">{getInitials(member.name)}</div>
            <div><p className="text-sm font-semibold text-gray-900">{member.name}</p><p className="text-xs text-gray-400">{member.title}</p></div>
            <span className={clsx("ml-auto badge text-xs", member.inProgressTasks?.length>0 ? "bg-amber-50 text-amber-700 border border-amber-200":"bg-gray-50 text-gray-400 border border-gray-200")}>{member.inProgressTasks?.length||0} in-progress</span>
          </div>
          {member.inProgressTasks?.length > 0 ? (
            <div className="flex flex-col gap-2 pl-11">
              {member.inProgressTasks.map((task,j) => (
                <Link to={`/task/${task._id}`} key={j} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-xs font-medium text-gray-800 truncate">{task.title}</span>
                    {task.category && <span className="hidden md:inline text-xs text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded-full shrink-0">{CATEGORY_LABEL[task.category]||task.category}</span>}
                  </div>
                  <span className={clsx("badge text-xs shrink-0 ml-2", PRIORITY_BADGE[task.priority])}>{task.priority}</span>
                </Link>
              ))}
            </div>
          ) : <p className="text-xs text-gray-300 pl-11">No active tasks</p>}
        </div>
      ))}
    </div>
  </div>
);

export default Dashboard;