// Utility for conditionally joining CSS class names
import clsx from "clsx";
// React hook for managing component state
import { useState } from "react";
// Icon imports for priority indicators and actions
import {
  MdKeyboardArrowDown, // Down arrow for normal/low priority
  MdKeyboardArrowUp, // Up arrow for medium priority
  MdKeyboardDoubleArrowUp, // Double up arrow for high priority
} from "react-icons/md";
import { IoMdAdd } from "react-icons/io"; // Plus icon for add sub-task button
// Redux hook for accessing global state
import { useSelector } from "react-redux";
// Utility functions and constants for task management
import { TASK_TYPE, formatDate, CATEGORY_LABEL } from "../../utils";
// React Router for navigation
import { Link } from "react-router-dom";
// Related components for task functionality
import { AddSubTask, TaskAssets, TaskDialog } from "./index";
import { UserInfo } from "../index";

/**
 * PRIORITY STYLING CONFIGURATION
 * Maps priority levels to their corresponding visual styles.
 */
const PRIORITY_BADGE = {
  high: "text-red-600 bg-red-50 border border-red-200", // Red theme for urgent tasks
  medium: "text-amber-600 bg-amber-50 border border-amber-200", // Amber theme for moderate priority
  normal: "text-blue-600 bg-blue-50 border border-blue-200", // Blue theme for standard tasks
  low: "text-slate-500 bg-slate-50 border border-slate-200", // Muted theme for low priority
};

/**
 * PRIORITY ICON MAPPING
 * Associates each priority level with an appropriate directional icon.
 */
const PRIORITY_ICON = {
  high: <MdKeyboardDoubleArrowUp />, // Double arrows for high priority
  medium: <MdKeyboardArrowUp />, // Single arrow for medium priority
  normal: <MdKeyboardArrowDown />, // Down arrow for normal priority
  low: <MdKeyboardArrowDown />, // Down arrow for low priority
};

/**
 * CATEGORY COLOR SCHEMES
 * Defines visual styling for different task categories.
 */
const CATEGORY_COLOR = {
  "report-created": "bg-blue-50 text-blue-600 border border-blue-200", // New reports
  "report-enhanced": "bg-cyan-50 text-cyan-600 border border-cyan-200", // Enhanced reports
  "report-validated": "bg-teal-50 text-teal-600 border border-teal-200", // Validated reports
  "config-new": "bg-violet-50 text-violet-600 border border-violet-200", // New configurations
  "config-updated": "bg-purple-50 text-purple-600 border border-purple-200", // Updated configurations
  "project-new": "bg-emerald-50 text-emerald-600 border border-emerald-200", // New projects
  other: "bg-gray-50 text-gray-600 border border-gray-200", // Miscellaneous tasks
};

/**
 * TaskCard Component
 *
 * A comprehensive card component that displays a task's essential information.
 * Features priority indicators, category badges, due date warnings, team avatars,
 * and sub-task progress visualization.
 */
const TaskCard = ({ task }) => {
  // Get current authenticated user from Redux store for permission checks
  const { user } = useSelector((state) => state.auth);

  // Local state to control the AddSubTask modal visibility
  const [open, setOpen] = useState(false);

  // Normalize task category to lowercase for consistent lookup
  const cat = task?.category?.toLowerCase();

  return (
    <>
      {/* MAIN TASK CARD CONTAINER */}
      <div
        className={clsx(
          // Base card styling with rounded corners, padding, and shadow
          "w-full rounded-2xl p-4 shadow-sm card-lift",
          // Conditional styling for overdue tasks (red border/background)
          task?.dueDate &&
            new Date(task.dueDate) < new Date() &&
            task.stage !== "completed"
            ? "border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-700" // Overdue styling
            : "bg-white border-gray-100", // Normal styling
        )}
      >
        {/* HEADER ROW: Priority Badge and Task Actions */}
        <div className="flex items-center justify-between mb-3">
          {/* Priority badge with icon and text */}
          <span
            className={clsx(
              "badge flex items-center gap-1 text-xs border",
              PRIORITY_BADGE[task?.priority], // Apply priority-specific styling
            )}
          >
            {/* Priority icon (arrows indicating urgency level) */}
            <span className="text-sm">{PRIORITY_ICON[task?.priority]}</span>
            {/* Priority text (capitalized for readability) */}
            <span className="capitalize">{task?.priority}</span>
          </span>

          {/* Task actions dropdown (edit, delete, etc.) */}
          <TaskDialog task={task} />
        </div>

        {/* CATEGORY BADGE */}
        {/* Only display if task has a category assigned */}
        {cat && (
          <span
            className={clsx(
              "badge text-xs border mb-2 inline-flex",
              CATEGORY_COLOR[cat], // Apply category-specific color scheme
            )}
          >
            {/* Display user-friendly category label */}
            {CATEGORY_LABEL[cat]}
          </span>
        )}

        {/* TASK TITLE AND STAGE INDICATOR */}
        {/* Wrapped in Link for navigation to task details page */}
        <Link to={`/task/${task._id}`}>
          <div className="flex items-start gap-2 mb-3">
            {/* Stage indicator dot (color represents current stage) */}
            <div
              className={clsx(
                "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0",
                TASK_TYPE[task.stage], // Color based on task stage
              )}
            />

            {/* Task title with hover effect and line clamping for long titles */}
            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
              {task?.title}
            </h4>
          </div>
        </Link>

        {/* DATE INFORMATION SECTION */}
        <div>
          {/* Optional start date display */}
          {task?.startDate && (
            <p className="text-xs text-gray-400">
              Start: {formatDate(new Date(task.startDate))}
            </p>
          )}

          {/* Due date with conditional styling for overdue/approaching deadlines */}
          {task?.dueDate && (
            <p
              className={`text-xs font-medium ${
                // Color coding based on due date status
                new Date(task.dueDate) < new Date()
                  ? "text-red-400" // Overdue: red
                  : new Date(task.dueDate) - new Date() <
                      3 * 24 * 60 * 60 * 1000
                    ? "text-orange-400" // Due soon (within 3 days): orange
                    : "text-gray-400" // Normal: gray
              }`}
            >
              Due: {formatDate(new Date(task.dueDate))}
              {/* Warning indicators for overdue and approaching deadlines */}
              {new Date(task.dueDate) < new Date() && " ⚠️ (Overdue)"}
              {new Date(task.dueDate) - new Date() < 3 * 24 * 60 * 60 * 1000 &&
                new Date(task.dueDate) > new Date() &&
                " ⏰ (Due Soon)"}
            </p>
          )}
        </div>

        {/* VISUAL DIVIDER */}
        <div className="border-t border-gray-100 my-3" />

        {/* BOTTOM SECTION: Task Metadata and Team */}
        <div className="flex items-center justify-between">
          {/* Task statistics (activities, assets, sub-tasks) */}
          <TaskAssets
            activities={task?.activities?.length} // Count of comments/activities
            subTasks={task?.subTasks} // Sub-tasks array for progress calculation
            assets={task?.assets?.length} // Count of attached files
          />

          {/* TEAM MEMBER AVATARS */}
          <div className="flex items-center">
            <div className="flex -space-x-2 items-center">
              {/* Display up to 3 team member avatars */}
              {task?.team?.slice(0, 3).map((m, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm border-[3px] border-white font-semibold z-10"
                  style={{
                    // Cycle through predefined blue color palette
                    backgroundColor: [
                      "#0068B5",
                      "#005a9e",
                      "#004f8c",
                      "#0079cc",
                      "#0086e0",
                      "#003d6b",
                      "#0057a0",
                      "#0073c6",
                    ][i % 8],
                  }}
                >
                  {/* User info component (shows initials or avatar) */}
                  <UserInfo user={m} />
                </div>
              ))}

              {/* Overflow indicator for teams with more than 3 members */}
              {task?.team?.length > 3 && (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm border-[3px] border-white font-semibold text-white z-10"
                  style={{ backgroundColor: "#0068B5" }}
                >
                  +{task.team.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUB-TASK PROGRESS SECTION */}
        {task?.subTasks?.length > 0 ? (
          // Display sub-task information when sub-tasks exist
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              {/* Preview of first sub-task title */}
              <p className="text-xs font-medium text-gray-700 line-clamp-1 flex-1">
                {task.subTasks[0].title}
              </p>

              {/* Completion ratio (completed/total) */}
              <span className="text-xs text-gray-400 ml-2 shrink-0">
                {task.subTasks.filter((s) => s.isCompleted).length}/
                {task.subTasks.length}
              </span>
            </div>

            {/* PROGRESS BAR */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-full transition-all",
                  // Dynamic color based on completion status
                  task.subTasks.filter((s) => s.isCompleted).length ===
                    task.subTasks.length
                    ? "bg-emerald-400" // All complete: green
                    : task.subTasks.filter((s) => s.isCompleted).length === 0
                      ? "bg-gray-300" // None complete: gray
                      : "bg-[#0068B5]", // Partial complete: blue
                )}
                style={{
                  // Calculate completion percentage for progress bar width
                  width: `${(task.subTasks.filter((s) => s.isCompleted).length / task.subTasks.length) * 100}%`,
                }}
              />
            </div>
          </div>
        ) : (
          // Fallback display when no sub-tasks exist
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-300">No sub-tasks</span>
          </div>
        )}

        {/* ADD SUB-TASK BUTTON */}
        {/* Only enabled for admin users */}
        <button
          disabled={!user?.isAdmin} // Disable for non-admin users
          onClick={() => setOpen(true)} // Open AddSubTask modal
          className="w-full flex items-center gap-2 mt-3 text-xs text-blue-500 hover:text-blue-700 font-semibold disabled:cursor-not-allowed disabled:text-gray-300"
        >
          <IoMdAdd className="text-sm" />
          <span>Add Sub Task</span>
        </button>
      </div>

      {/* ADD SUB-TASK MODAL */}
      {/* Rendered outside the card to avoid z-index issues */}
      <AddSubTask
        open={open}
        setOpen={setOpen}
        id={task._id} // Pass task ID for sub-task creation
      />
    </>
  );
};

// Export the component for use throughout the application
export default TaskCard;
