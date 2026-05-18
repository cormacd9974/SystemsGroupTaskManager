import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { FaExchangeAlt } from "react-icons/fa";
import { HiDuplicate } from "react-icons/hi";
import { MdAdd, MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useChangeTaskStageMutation, useDuplicateTaskMutation, useTrashTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { ConfirmationDialog } from "../index";
import AddSubTask from "./AddSubTask";
import AddTask from "./AddTask";


const ChangeTaskActions = ({ _id, stage }) => {
  const [showStages, setShowStages] = useState(false);
  const [changeStage] = useChangeTaskStageMutation();

  const changeHandler = async (val) => {
    try {
      const res = await changeStage({ id: _id, stage: val }).unwrap();
      toast.success(res?.message);
      setTimeout(() => window.location.reload(), 500);
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };
  const items = [
    { label:"To-Do", stage:"todo", color: "bg-blue-600" },
    { label:"in-progress", stage:"in-progress", color: "bg-yellow-600" },
    { label:"Completed", stage:"completed", color: "bg-green-600" },
  ];
  return (
    <div className="relative w-full">
      <button
        onMouseDown={(e) => { e.preventDefault(); setShowStages(!showStages); e.stopPropagation(); }}
        className="inline-flex w-full items-center justify-center rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <FaExchangeAlt className="mr-2 h-4 w-4"/>
          <span>Change Stage</span>
      </button>
      {showStages && (
        <div className="absolute top-full left-0 ml-1 w-40 rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-2 z-50">
          {items.map(el => (
            <button 
            key={el.stage} 
            disabled={stage === el.stage} 
            onMouseDown={(e) => { e.preventDefault(); changeHandler(el.stage); e.stopPropagation(); setShowStages(false); }}
              className="flex gap-2 w-full items-center rounded-lg px-2 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
              >
              <div className={clsx("w-2 h-2 rounded-full", el.color)} />
              {el.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TaskDialog({ task }) {
  //const { user } = useSelector(s => s.auth);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const [deleteTask] = useTrashTaskMutation();
  const [duplicateTask] = useDuplicateTaskMutation();
  const deleteHandler = async () => {
    try {
      const res = await deleteTask({ id: task._id, isTrashed: "trash" }).unwrap();
      toast.success(res?.message);
      setTimeout(() => { setOpenDialog(false); window.location.reload(); }, 500);
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };
  const duplicateHandler = async () => {
    try {
      const res = await duplicateTask(task._id).unwrap();
      toast.success(res?.message);
      setTimeout(() => window.location.reload(), 500);
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };
  const items = [
    { label:"Open Task", icon:<AiTwotoneFolderOpen className="mr-2 h-4 w-4" />, onClick:() => navigate(`/task/${task._id}`) },
    { label:"Edit",      icon:<MdOutlineEdit className="mr-2 h-4 w-4" />, onClick:() => setOpenEdit(true) },
    { label:"Add Sub-Task", icon:<MdAdd className="mr-2 h-4 w-4" />, onClick:() => setOpen(true) },
    { label:"Duplicate", icon:<HiDuplicate className="mr-2 h-4 w-4" />, onClick:duplicateHandler },
  ];
  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton className="inline-flex justify-center rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100">
          <BsThreeDots />
        </MenuButton>
        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100" leaveTo="opacity-0 scale-95">
          <MenuItems className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none p-2 z-50 divide-y divide-gray-100">
            <div className="space-y-1 pb-1">
              {items.map((el) => (
                <MenuItem key={el.label}>
                  {({ active }) => (
                    <button disabled={false} onClick={el.onClick}
                      className={`${active ? "bg-blue-500 text-white" : "text-gray-900"} group flex w-full items-center rounded-lg px-2 py-2 text-sm disabled:text-gray-400`}>
                      {el.icon}{el.label}
                    </button>
                  )}
                </MenuItem>
              ))}
            </div>
            <div className="py-1"><ChangeTaskActions _id={task._id} stage={task.stage} /></div>
            <div className="pt-1">
              <MenuItem>{({ active }) => (
                <button disabled={false} onClick={() => setOpenDialog(true)}
                  className={`${active ? "bg-red-100 text-red-900" : "text-red-900"} group flex w-full items-center rounded-lg px-2 py-2 text-sm disabled:text-gray-400`}>
                  <RiDeleteBin6Line className="mr-2 h-4 w-4 text-red-600" />Delete
                </button>
              )}</MenuItem>
            </div>
          </MenuItems>
        </Transition>
      </Menu>
      {openEdit && <AddTask open={openEdit} setOpen={setOpenEdit} task={task} key={task?._id} />}
      <AddSubTask open={open} setOpen={setOpen} id={task._id} />
      <ConfirmationDialog open={openDialog} setOpen={setOpenDialog} onClick={deleteHandler} />
    </>
  );
}
