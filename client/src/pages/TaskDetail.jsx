import clsx from "clsx";
import moment from "moment";
import { useState } from "react";
import { FaBug, FaSpinner, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp, MdOutlineDoneAll, MdOutlineMessage } from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { HiLink } from "react-icons/hi";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loading, Tabs } from "../components";
import { useChangeSubTaskStatusMutation, useGetSingleTaskQuery, usePostTaskActivityMutation } from "../redux/slices/api/taskApiSlice";
import { TASK_TYPE, CATEGORY_LABEL, getCompletedSubTasks, getInitials } from "../utils";

const TABS = [{ title:"Task Detail", icon:<FaTasks /> }, { title:"Activity Timeline", icon:<RxActivityLog /> }];
const PRIORITY_BADGE = { high:"text-red-600 bg-red-50 border border-red-200", medium:"text-amber-600 bg-amber-50 border border-amber-200", normal:"text-blue-600 bg-blue-50 border border-blue-200", low:"text-slate-500 bg-slate-50 border border-slate-200" };
const PRIORITY_ICON  = { high:<MdKeyboardDoubleArrowUp />, medium:<MdKeyboardArrowUp />, normal:<MdKeyboardArrowDown />, low:<MdKeyboardArrowDown /> };
const ACTIVITY_ICON  = {
  commented:    <div className="w-8 h-8 rounded-xl bg-gray-400 flex items-center justify-center text-white text-sm"><MdOutlineMessage /></div>,
  started:      <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white text-sm"><FaThumbsUp /></div>,
  assigned:     <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center text-white text-sm"><FaUser /></div>,
  bug:          <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center text-white text-sm"><FaBug /></div>,
  completed:    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-sm"><MdOutlineDoneAll /></div>,
  "in-progress":<div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center text-white text-sm"><GrInProgress /></div>,
};
const act_types = ["Started","Completed","in-progress","Commented","Bug","Assigned"];

const Activities = ({ activity, id, refetch }) => {
  const [selected, setSelected] = useState("Started");
  const [text, setText] = useState("");
  const [postActivity, { isLoading }] = usePostTaskActivityMutation();
  const handleSubmit = async () => {
    try {
      const res = await postActivity({ data:{ type:selected?.toLowerCase(), activity:text }, id }).unwrap();
      setText(""); toast.success(res?.message); refetch();
    } catch (err) { toast.error(err?.data?.message||err.error); }
  };
  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="w-full md:w-1/2">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Timeline</h4>
        <div className="space-y-0">
          {activity?.map((item,i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="shrink-0">{ACTIVITY_ICON[item?.type]||ACTIVITY_ICON["started"]}</div>
                {i < activity.length-1 && <div className="w-0.5 bg-gray-100 flex-1 my-1" />}
              </div>
              <div className="pb-6">
                <p className="text-sm font-semibold text-gray-900">{item?.by?.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs capitalize text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item?.type}</span>
                  <span className="text-xs text-gray-400">{moment(item?.date).fromNow()}</span>
                </div>
                {item?.activity && <p className="text-sm text-gray-600 mt-1.5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">{item?.activity}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full md:w-1/2 md:border-l md:border-gray-100 md:pl-6">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Add Activity</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {act_types.map(item => (
              <label key={item} className={clsx("flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm font-medium", selected===item ? "bg-blue-50 border-blue-300 text-blue-700":"bg-gray-50 border-gray-200 text-gray-600")}>
                <input type="checkbox" className="accent-blue-600 w-3.5 h-3.5" checked={selected===item} onChange={() => setSelected(item)} />{item}
              </label>
            ))}
          </div>
          <textarea rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Add a note..." className="input-field resize-none" />
          {isLoading ? <Loading /> : <button onClick={handleSubmit} className="btn-primary w-full">Post Activity</button>}
        </div>
      </div>
    </div>
  );
};

const TaskDetail = () => {
  const { id } = useParams();
  const { data, isLoading, refetch } = useGetSingleTaskQuery(id);
  const [subTaskAction, { isLoading: isSubmitting }] = useChangeSubTaskStatusMutation();
  const [selected, setSelected] = useState(0);
  const task = data?.task || {};
  const handleSubmitAction = async (el) => {
    try { const res = await subTaskAction({ id:el.id, subId:el.subId, status:!el.status }).unwrap(); toast.success(res?.message); refetch(); }
    catch (err) { toast.error(err?.data?.message||err.error); }
  };
  if (isLoading) return <div className="py-16 flex justify-center"><Loading /></div>;
  const percentageCompleted = task?.subTasks?.length===0 ? 0 : (getCompletedSubTasks(task?.subTasks)/task?.subTasks?.length)*100;
  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-start gap-3">
        <div className={clsx("w-3 h-3 rounded-full mt-2.5 shrink-0", TASK_TYPE[task?.stage])} />
        <h1 className="text-2xl font-bold text-gray-900">{task?.title}</h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Tabs tabs={TABS} setSelected={setSelected}>
          {selected===0 ? (
            <div className="flex flex-col md:flex-row gap-6 p-6">
              <div className="w-full md:w-1/2 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className={clsx("badge flex items-center gap-1", PRIORITY_BADGE[task?.priority])}>{PRIORITY_ICON[task?.priority]}<span className="capitalize">{task?.priority} Priority</span></span>
                  <span className="badge bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1.5"><div className={clsx("w-2 h-2 rounded-full", TASK_TYPE[task?.stage])} /><span className="capitalize">{task?.stage}</span></span>
                  {task?.category && <span className="badge bg-blue-50 text-blue-700 border border-blue-200">{CATEGORY_LABEL[task?.category]||task?.category}</span>}
                </div>
                <p className="text-sm text-gray-400">Created {new Date(task?.date).toDateString()}</p>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-center"><p className="text-2xl font-bold text-gray-900">{task?.assets?.length||0}</p><p className="text-xs text-gray-400">Assets</p></div>
                  <div className="w-px bg-gray-200" />
                  <div className="text-center"><p className="text-2xl font-bold text-gray-900">{task?.subTasks?.length||0}</p><p className="text-xs text-gray-400">Sub-tasks</p></div>
                  <div className="w-px bg-gray-200" />
                  <div className="text-center"><p className="text-2xl font-bold text-gray-900">{task?.activities?.length||0}</p><p className="text-xs text-gray-400">Activities</p></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Task Team</p>
                  <div className="space-y-2">
                    {task?.team?.map((m,i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">{getInitials(m?.name)}</div>
                        <div><p className="text-sm font-semibold text-gray-900">{m?.name}</p><p className="text-xs text-gray-400">{m?.title}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
                {task?.subTasks?.length>0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sub-Tasks</p>
                      <span className={clsx("badge text-xs", percentageCompleted<50 ? "bg-red-50 text-red-600 border border-red-200":percentageCompleted<80 ? "bg-amber-50 text-amber-600 border border-amber-200":"bg-emerald-50 text-emerald-600 border border-emerald-200")}>{percentageCompleted.toFixed(0)}% done</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                      <div className={clsx("h-full rounded-full transition-all", percentageCompleted<50 ? "bg-red-400":percentageCompleted<80 ? "bg-amber-400":"bg-emerald-400")} style={{ width:`${percentageCompleted}%` }} />
                    </div>
                    <div className="space-y-3">
                      {task?.subTasks?.map((el,i) => (
                        <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-400">{new Date(el?.date).toDateString()}</span>
                                <span className="badge bg-blue-50 text-blue-700 border border-blue-200 text-xs">{el?.tag}</span>
                                <span className={clsx("badge text-xs", el?.isCompleted ? "bg-emerald-50 text-emerald-700 border border-emerald-200":"bg-amber-50 text-amber-600 border border-amber-200")}>{el?.isCompleted ? "Done":"Pending"}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-700">{el?.title}</p>
                            </div>
                            <button disabled={isSubmitting} onClick={() => handleSubmitAction({ status:el?.isCompleted, id:task?._id, subId:el?._id })}
                              className={clsx("shrink-0 text-xs px-2.5 py-1.5 rounded-lg font-medium disabled:cursor-not-allowed", el?.isCompleted ? "bg-rose-50 text-rose-600 hover:bg-rose-100":"bg-emerald-50 text-emerald-700 hover:bg-emerald-100")}>
                              {isSubmitting ? <FaSpinner className="animate-spin" /> : el?.isCompleted ? "Undo":"Mark Done"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/2 space-y-6 md:border-l md:border-gray-100 md:pl-6">
                {task?.description && (
                  <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{task?.description}</p></div>
                )}
                {task?.assets?.length>0 && (
                  <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Assets</p>
                  <div className="grid grid-cols-2 gap-3">{task?.assets?.map((el,i) => <img key={i} src={el} alt={`asset-${i}`} className="w-full rounded-xl h-32 object-cover cursor-pointer hover:opacity-90 border border-gray-100" />)}</div></div>
                )}
                {task?.links?.length>0 && (
                  <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Links</p>
                  <div className="space-y-2">{task?.links?.map((el,i) => <a key={i} href={el} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200"><HiLink /><span className="truncate">{el}</span></a>)}</div></div>
                )}
              </div>
            </div>
          ) : <div className="p-6"><Activities activity={task?.activities} refetch={refetch} id={id} /></div>}
        </Tabs>
      </div>
    </div>
  );
};
export default TaskDetail;