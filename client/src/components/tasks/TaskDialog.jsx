// Headless UI components for accessible dropdown menus
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
// Utility for conditionally joining CSS class names
import clsx from "clsx";
// React hooks for state management and fragments
import { Fragment, useState } from "react";
// Icon imports for various task actions
import { AiTwotoneFolderOpen } from "react-icons/ai"; // Folder icon for "Open Task"
import { BsThreeDots } from "react-icons/bs"; // Three dots menu trigger icon
import { FaExchangeAlt } from "react-icons/fa"; // Exchange icon for stage changes
import { HiDuplicate } from "react-icons/hi"; // Duplicate icon for task copying
import { MdAdd, MdOutlineEdit } from "react-icons/md"; // Add and edit icons
import { RiDeleteBin6Line } from "react-icons/ri"; // Delete/trash bin icon
// React Router hook for programmatic navigation
import { useNavigate } from "react-router-dom";
// Toast notifications for user feedback
import { toast } from "sonner";
// Redux mutation hooks for task operations
import {
  useChangeTaskStageMutation,
  useDuplicateTaskMutation,
  useTrashTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
// Reusable confirmation dialog component
import { ConfirmationDialog } from "../index";
// Task-related modal components
import AddSubTask from "./AddSubTask";
import AddTask from "./AddTask";

// Dropdown subcomponent used to change the current task stage
const ChangeTaskActions = ({ _id, stage }) => {
  // Controls visibility of the stage selection menu
  const [showStages, setShowStages] = useState(false);

  // Mutation hook for updating the task stage
  const [changeStage] = useChangeTaskStageMutation();

  // Handles stage change request
  const changeHandler = async (val) => {
    try {
      // Call API to update task stage
      const res = await changeStage({ id: _id, stage: val }).unwrap();
      // Show success message to user
      toast.success(res?.message);
      
    } catch (err) {
      // Show error message if stage change fails
      toast.error(err?.data?.message || err.error);
    }
  };

  // Available task stages shown in the dropdown
  const items = [
    { label: "To-Do", stage: "todo", color: "bg-blue-600" }, // Initial stage - blue
    { label: "in-progress", stage: "in-progress", color: "bg-yellow-600" }, // Active work - yellow
    { label: "Completed", stage: "completed", color: "bg-green-600" }, // Finished - green
  ];

  return (
    <div className="relative w-full">
      {/* Button to toggle stage selection dropdown */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setShowStages(!showStages);
          e.stopPropagation(); // Prevent event bubbling to parent menu
        }}
        className="inline-flex w-full items-center justify-center rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
      >
        <FaExchangeAlt className="mr-2 h-4 w-4" />
        <span>Change Stage</span>
      </button>

      {/* Stage options dropdown - conditionally rendered */}
      {showStages && (
        <div className="absolute top-full left-0 ml-1 w-40 rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-2 z-50">
          {items.map((el) => (
            <button
              key={el.stage}
              disabled={stage === el.stage} // Disable current stage option
              onMouseDown={(e) => {
                e.preventDefault();
                changeHandler(el.stage);
                e.stopPropagation();
                setShowStages(false); // Close dropdown after selection
              }}
              className="flex gap-2 w-full items-center rounded-lg px-2 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              {/* Colored dot indicating the stage */}
              <div className={clsx("w-2 h-2 rounded-full", el.color)} />
              {el.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main task actions menu component
export default function TaskDialog({ task }) {
  //const { user } = useSelector(s => s.auth);

  // Controls AddSubTask modal visibility
  const [open, setOpen] = useState(false);

  // Controls AddTask edit modal visibility
  const [openEdit, setOpenEdit] = useState(false);

  // Controls delete confirmation dialog visibility
  const [openDialog, setOpenDialog] = useState(false);

  // React Router navigation hook for programmatic routing
  const navigate = useNavigate();

  // Mutation hook for deleting/trashing a task
  const [deleteTask] = useTrashTaskMutation();

  // Mutation hook for duplicating a task
  const [duplicateTask] = useDuplicateTaskMutation();

  // Handles task deletion
  const deleteHandler = async () => {
    try {
      // Send request to move the task to trash (soft delete)
      const res = await deleteTask({
        id: task._id,
        isTrashed: "trash",
      }).unwrap();
      // Show success notification
      toast.success(res?.message);

      // Close confirmation dialog and refresh the page after success
      
        setOpenDialog(false);
       
    } catch (err) {
      // Show error message if deletion fails
      toast.error(err?.data?.message || err.error);
    }
  };

  // Handles task duplication
  const duplicateHandler = async () => {
    try {
      // Call API to create a copy of the current task
      const res = await duplicateTask(task._id).unwrap();
      // Show success notification
      toast.success(res?.message);

      // Refresh page so the duplicated task appears in the UI
      
    } catch (err) {
      // Show error message if duplication fails
      toast.error(err?.data?.message || err.error);
    }
  };

  // Menu items shown in the task actions dropdown
  const items = [
    {
      label: "Open Task",
      icon: <AiTwotoneFolderOpen className="mr-2 h-4 w-4" />,
      onClick: () => navigate(`/task/${task._id}`), // Navigate to task detail page
    },
    {
      label: "Edit",
      icon: <MdOutlineEdit className="mr-2 h-4 w-4" />,
      onClick: () => setOpenEdit(true), // Open edit task modal
    },
    {
      label: "Add Sub-Task",
      icon: <MdAdd className="mr-2 h-4 w-4" />,
      onClick: () => setOpen(true), // Open add sub-task modal
    },
    {
      label: "Duplicate",
      icon: <HiDuplicate className="mr-2 h-4 w-4" />,
      onClick: duplicateHandler, // Execute duplication
    },
  ];

  return (
    <>
      {/* Headless UI dropdown menu for task actions */}
      <Menu as="div" className="relative inline-block text-left">
        {/* Three dots button that triggers the dropdown */}
        <MenuButton className="inline-flex justify-center rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100">
          <BsThreeDots />
        </MenuButton>

        {/* Dropdown transition animation */}
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 scale-95"
        >
          {/* Dropdown menu container */}
          <MenuItems className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none p-2 z-50 divide-y divide-gray-100">
            {/* Standard task action items */}
            <div className="space-y-1 pb-1">
              {items.map((el) => (
                <MenuItem key={el.label}>
                  {({ active }) => (
                    <button
                      disabled={false}
                      onClick={el.onClick}
                      className={`${
                        active ? "bg-blue-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-lg px-2 py-2 text-sm disabled:text-gray-400`}
                    >
                      {el.icon}
                      {el.label}
                    </button>
                  )}
                </MenuItem>
              ))}
            </div>

            {/* Stage changing action - separated by divider */}
            <div className="py-1">
              <ChangeTaskActions _id={task._id} stage={task.stage} />
            </div>

            {/* Delete action - separated and styled differently (red) */}
            <div className="pt-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    disabled={false}
                    onClick={() => setOpenDialog(true)} // Open confirmation dialog
                    className={`${
                      active ? "bg-red-100 text-red-900" : "text-red-900"
                    } group flex w-full items-center rounded-lg px-2 py-2 text-sm disabled:text-gray-400`}
                  >
                    <RiDeleteBin6Line className="mr-2 h-4 w-4 text-red-600" />
                    Delete
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Transition>
      </Menu>

      {/* Edit task modal - conditionally rendered when openEdit is true */}
      {openEdit && (
        <AddTask
          open={openEdit}
          setOpen={setOpenEdit}
          task={task}
          key={task?._id}
        />
      )}

      {/* Add sub-task modal - conditionally rendered when open is true */}
      <AddSubTask open={open} setOpen={setOpen} id={task._id} />

      {/* Delete confirmation modal - asks user to confirm before deletion */}
      <ConfirmationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />
    </>
  );
}
