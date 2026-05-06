import clsx from "clsx";
import { useState } from "react";
import { MdDelete, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp, MdOutlineRestore } from "react-icons/md";
import { HiOutlineTrash } from "react-icons/hi";
import { toast } from "sonner";
import { ConfirmationDialog, Loading, Title } from "../components";
import { useDeleteRestoreTaskMutation, useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice";
import { TASK_TYPE } from "../utils";
import { useSearchParams } from "react-router-dom";

const PRIORITY_BADGE = { high:"text-red-600 bg-red-50 border border-red-200", medium:"text-amber-600 bg-amber-50 border border-amber-200", normal:"text-blue-600 bg-blue-50 border border-blue-200", low:"text-slate-500 bg-slate-50 border border-slate-200" };
const PRIORITY_ICON  = { high:<MdKeyboardDoubleArrowUp />, medium:<MdKeyboardArrowUp />, normal:<MdKeyboardArrowDown />, low:<MdKeyboardArrowDown /> };
const Trash = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [msg, setMsg]   = useState(null);
  const [type, setType] = useState("delete");
  const [selected, setSelected] = useState("");
  const [searchParams] = useSearchParams();
  const [searchTerm] = useState(searchParams.get("search")||"");
  const { data, isLoading, refetch } = useGetAllTaskQuery({ strQuery:"", isTrashed:"true", search:searchTerm });
  const [deleteRestoreTask] = useDeleteRestoreTaskMutation();
  const deleteAllClick    = () => { setType("deleteAll"); setMsg("This will permanently delete ALL trashed tasks."); setOpenDialog(true); };
  const restoreAllClick   = () => { setType("restoreAll"); setMsg("All trashed tasks will be restored."); setOpenDialog(true); };
  const deleteClick  = (id) => { setType("delete");   setSelected(id); setOpenDialog(true); };
  const restoreClick = (id) => { setType("restore");  setSelected(id); setMsg("This task will be restored from trash."); setOpenDialog(true); };
  const deleteRestoreHandler = async () => {
    try {
      let res;
      if (type==="delete")     res = await deleteRestoreTask({ id:selected, actionType:"delete" }).unwrap();
      if (type==="deleteAll")  res = await deleteRestoreTask({ id:"", actionType:"deleteAll" }).unwrap();
      if (type==="restore")    res = await deleteRestoreTask({ id:selected, actionType:"restore" }).unwrap();
      if (type==="restoreAll") res = await deleteRestoreTask({ id:"", actionType:"restoreAll" }).unwrap();
      toast.success(res?.message);
      setTimeout(() => { setOpenDialog(false); refetch(); }, 500);
    } catch (err) { toast.error(err?.data?.message||err.error); }
  };
  return isLoading ? <div className="py-16 flex justify-center"><Loading /></div> : (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><Title title="Trash" /><p className="text-sm text-gray-400 mt-0.5">{data?.tasks?.length||0} deleted tasks</p></div>
          {data?.tasks?.length>0 && (
            <div className="flex gap-2">
              <button onClick={restoreAllClick} className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200"><MdOutlineRestore />Restore All</button>
              <button onClick={deleteAllClick}  className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200"><MdDelete />Delete All</button>
            </div>
          )}
        </div>
        {data?.tasks?.length>0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead><tr><th>Task Title</th><th>Priority</th><th>Stage</th><th>Deleted On</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {data?.tasks?.map((item,i) => (
                    <tr key={i}>
                      <td><div className="flex items-center gap-2.5"><div className={clsx("w-2.5 h-2.5 rounded-full shrink-0", TASK_TYPE[item.stage])} /><p className="font-medium text-gray-800 text-sm line-clamp-1">{item?.title}</p></div></td>
                      <td><span className={clsx("badge flex items-center gap-1 w-fit text-xs", PRIORITY_BADGE[item?.priority])}>{PRIORITY_ICON[item?.priority]}<span className="capitalize">{item?.priority}</span></span></td>
                      <td><span className="text-xs capitalize text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">{item?.stage}</span></td>
                      <td className="text-gray-400 text-xs">{new Date(item?.date).toDateString()}</td>
                      <td><div className="flex items-center gap-2 justify-end">
                        <button onClick={() => restoreClick(item._id)} title="Restore" className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"><MdOutlineRestore className="text-lg" /></button>
                        <button onClick={() => deleteClick(item._id)} title="Delete" className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"><MdDelete className="text-lg" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
            <HiOutlineTrash className="text-5xl text-gray-200" />
            <p className="text-base font-semibold text-gray-400">Trash is empty</p>
          </div>
        )}
      </div>
      <ConfirmationDialog open={openDialog} setOpen={setOpenDialog} msg={msg} setMsg={setMsg} type={type} setType={setType} onClick={deleteRestoreHandler} />
    </>
  );
};
export default Trash;
