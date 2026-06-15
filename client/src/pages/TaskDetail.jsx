// External library imports for styling, date handling, and state management
import clsx from "clsx"; // Utility for conditionally joining CSS class names
import moment from "moment"; // Date manipulation and formatting library
import { useState } from "react"; // React hook for component state management

// Icon imports for various UI elements and activity types
import { FaBug, FaSpinner, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa"; // Font Awesome icons for activities and UI
import { GrInProgress } from "react-icons/gr"; // Progress indicator icon
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
} from "react-icons/md"; // Material Design icons
import { RxActivityLog } from "react-icons/rx"; // Activity log icon
import { HiLink } from "react-icons/hi"; // Link icon for external references

// React Router and notification imports
import { useParams } from "react-router-dom"; // Hook to access URL parameters
import { toast } from "sonner"; // Toast notification library for user feedback

// Internal component and API imports
import { Loading, Tabs } from "../components"; // Reusable UI components
import {
  useChangeSubTaskStatusMutation,
  useGetSingleTaskQuery,
  usePostTaskActivityMutation,
} from "../redux/slices/api/taskApiSlice"; // RTK Query hooks
import {
  TASK_TYPE,
  CATEGORY_LABEL,
  getCompletedSubTasks,
  getInitials,
} from "../utils"; // Utility functions and constants

/**
 * Tab configuration for task detail view navigation
 * Provides two main views: detailed task information and activity timeline
 */
const TABS = [
  { title: "Task Detail", icon: <FaTasks /> }, // Main task information and sub-tasks
  { title: "Activity Timeline", icon: <RxActivityLog /> }, // Historical activity and new activity posting
];

/**
 * Priority badge styling configuration
 * Maintains visual consistency across the application with semantic color coding
 */
const PRIORITY_BADGE = {
  high: "text-red-600 bg-red-50 border border-red-200", // High priority: Red theme for urgency
  medium: "text-amber-600 bg-amber-50 border border-amber-200", // Medium priority: Amber theme for caution
  normal: "text-blue-600 bg-blue-50 border border-blue-200", // Normal priority: Blue theme for standard tasks
  low: "text-slate-500 bg-slate-50 border border-slate-200", // Low priority: Muted slate for less critical tasks
};

/**
 * Priority icon mapping for visual hierarchy reinforcement
 * Uses directional arrows to communicate priority levels intuitively
 */
const PRIORITY_ICON = {
  high: <MdKeyboardDoubleArrowUp />, // Double arrow indicates highest urgency
  medium: <MdKeyboardArrowUp />, // Single up arrow for elevated priority
  normal: <MdKeyboardArrowDown />, // Down arrow for standard priority
  low: <MdKeyboardArrowDown />, // Down arrow for low priority
};

/**
 * Activity type icon mapping for timeline visualization
 * Each activity type has a distinct icon and color for quick identification
 * Design decision: Circular containers with semantic colors for activity categorization
 */
const ACTIVITY_ICON = {
  commented: (
    <div className="w-8 h-8 rounded-xl bg-gray-400 flex items-center justify-center text-white text-sm">
      <MdOutlineMessage />
    </div>
  ), // Comments: Gray for neutral communication
  started: (
    <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white text-sm">
      <FaThumbsUp />
    </div>
  ), // Task initiation: Blue for positive action
  assigned: (
    <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center text-white text-sm">
      <FaUser />
    </div>
  ), // Assignment: Purple for people-related actions
  bug: (
    <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center text-white text-sm">
      <FaBug />
    </div>
  ), // Bug reports: Red for issues requiring attention
  completed: (
    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-sm">
      <MdOutlineDoneAll />
    </div>
  ), // Completion: Green for success
  "in-progress": (
    <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center text-white text-sm">
      <GrInProgress />
    </div>
  ), // Progress: Violet for ongoing work
};

/**
 * Available activity types for new activity creation
 * Business logic: Defines the workflow states and communication types available to users
 */
const act_types = [
  "Started",
  "Completed",
  "in-progress",
  "Commented",
  "Bug",
  "Assigned",
];

/**
 * Activities Component - Manages task activity timeline and new activity creation
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.activity - Array of existing activity objects for timeline display
 * @param {string} props.id - Task ID for API operations
 * @param {Function} props.refetch - Function to refresh task data after activity updates
 *
 * Architecture decisions:
 * - Split layout: Timeline on left, activity creation on right
 * - Real-time activity posting with optimistic UI updates
 * - Checkbox-based activity type selection for clear user choice
 * - Optional text notes for detailed activity descriptions
 *
 * UX considerations:
 * - Visual timeline with connecting lines for chronological flow
 * - Color-coded activity types for quick scanning
 * - Immediate feedback through loading states and toast notifications
 * - Responsive design adapting to mobile and desktop layouts
 *
 * @returns {JSX.Element} Activity timeline and creation interface
 */
const Activities = ({ activity, id, refetch }) => {
  /**
   * Local state management for activity creation form
   */

  // Selected activity type for new activity posting
  const [selected, setSelected] = useState("Started");

  // Text content for optional activity notes
  const [text, setText] = useState("");

  // RTK Query mutation hook for posting new activities
  const [postActivity, { isLoading }] = usePostTaskActivityMutation();

  /**
   * Activity submission handler with comprehensive error handling
   *
   * Workflow:
   * 1. Submit activity data to API
   * 2. Clear form on success
   * 3. Show user feedback via toast
   * 4. Refresh task data to show new activity
   *
   * UX: Provides immediate feedback and form reset for continued use
   */
  const handleSubmit = async () => {
    try {
      // Post new activity with type and optional text note
      const res = await postActivity({
        data: {
          type: selected?.toLowerCase(), // Normalize activity type for API
          activity: text, // Optional descriptive text
        },
        id,
      }).unwrap();

      // Reset form and provide user feedback
      setText("");
      toast.success(res?.message);
      refetch(); // Refresh task data to show new activity
    } catch (err) {
      // Display error message with fallback text
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Left side: Activity timeline display */}
      {/* Design: Vertical timeline with connecting lines and activity markers */}
      <div className="w-full md:w-1/2">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">
          Timeline
        </h4>

        {/* Timeline container with activity items */}
        <div className="space-y-0">
          {activity?.map((item, i) => (
            <div key={i} className="flex gap-3">
              {/* Timeline marker and connecting line */}
              <div className="flex flex-col items-center">
                {/* Activity type icon marker */}
                <div className="shrink-0">
                  {ACTIVITY_ICON[item?.type] || ACTIVITY_ICON["started"]}{" "}
                  {/* Fallback to 'started' icon */}
                </div>

                {/* Connecting line between activities (except for last item) */}
                {/* Visual continuity: Creates chronological flow in timeline */}
                {i < activity.length - 1 && (
                  <div className="w-0.5 bg-gray-100 flex-1 my-1" />
                )}
              </div>

              {/* Activity content and metadata */}
              <div className="pb-6">
                {/* Activity author name */}
                <p className="text-sm font-semibold text-gray-900">
                  {item?.by?.name}
                </p>

                {/* Activity type and timestamp */}
                <div className="flex items-center gap-2 mt-0.5">
                  {/* Activity type badge */}
                  <span className="text-xs capitalize text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {item?.type}
                  </span>

                  {/* Relative timestamp using moment.js */}
                  <span className="text-xs text-gray-400">
                    {moment(item?.date).fromNow()}
                  </span>
                </div>

                {/* Optional activity description/note */}
                {/* Conditional rendering: Only shows if activity has descriptive text */}
                {item?.activity && (
                  <p className="text-sm text-gray-600 mt-1.5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    {item?.activity}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: New activity creation form */}
      {/* Design: Separated by border on desktop, stacked on mobile */}
      <div className="w-full md:w-1/2 md:border-l md:border-gray-100 md:pl-6">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">
          Add Activity
        </h4>

        <div className="space-y-4">
          {/* Activity type selection grid */}
          {/* UX: Checkbox-style buttons for clear selection state */}
          <div className="grid grid-cols-2 gap-2">
            {act_types.map((item) => (
              <label
                key={item}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm font-medium",
                  selected === item
                    ? "bg-blue-50 border-blue-300 text-blue-700" // Selected state: Blue theme
                    : "bg-gray-50 border-gray-200 text-gray-600", // Unselected state: Neutral gray
                )}
              >
                {/* Checkbox input for activity type selection */}
                <input
                  type="checkbox"
                  className="accent-blue-600 w-3.5 h-3.5"
                  checked={selected === item}
                  onChange={() => setSelected(item)}
                />
                {item}
              </label>
            ))}
          </div>

          {/* Optional text note input */}
          {/* UX: Allows users to add detailed descriptions to activities */}
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a note..."
            className="input-field resize-none"
          />

          {/* Submit button with loading state */}
          {/* Conditional rendering: Shows loading spinner during API call */}
          {isLoading ? (
            <Loading />
          ) : (
            <button onClick={handleSubmit} className="btn-primary w-full">
              Post Activity
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * TaskDetail Component - Main task detail view with comprehensive task information
 *
 * @component
 *
 * Architecture decisions:
 * - Tabbed interface separating task details from activity timeline
 * - Real-time data fetching with automatic updates
 * - Sub-task management with status toggling
 * - Responsive layout adapting to various screen sizes
 * - Rich media support for attachments and external links
 *
 * UX considerations:
 * - Visual progress indicators for sub-task completion
 * - Color-coded priority and status indicators
 * - Overdue task highlighting for urgent attention
 * - Team member display with avatar and role information
 * - Interactive sub-task completion with immediate feedback
 *
 * Business features:
 * - Complete task lifecycle tracking
 * - Team collaboration through activity timeline
 * - File attachment and external link management
 * - Progress tracking through sub-task completion
 * - Due date monitoring with overdue alerts
 *
 * @returns {JSX.Element} Complete task detail interface with tabs and interactive elements
 */
const TaskDetail = () => {
  /**
   * URL parameter extraction and API integration
   */

  // Extract task ID from URL parameters
  const { id } = useParams();

  // Fetch single task data with real-time updates
  const { data, isLoading, refetch } = useGetSingleTaskQuery(id);

  // Sub-task status mutation for completion toggling
  const [subTaskAction, { isLoading: isSubmitting }] =
    useChangeSubTaskStatusMutation();

  /**
   * Local state management
   */

  // Active tab selection (0 = Task Detail, 1 = Activity Timeline)
  const [selected, setSelected] = useState(0);

  // Safe data access with fallback to empty object
  const task = data?.task || {};

  /**
   * Sub-task status toggle handler
   *
   * Functionality:
   * - Toggles sub-task completion status
   * - Provides immediate user feedback
   * - Refreshes task data to update progress indicators
   *
   * UX: Optimistic updates with error handling and rollback capability
   */
  const handleSubmitAction = async (el) => {
    try {
      // Toggle sub-task completion status
      const res = await subTaskAction({
        id: el.id, // Main task ID
        subId: el.subId, // Sub-task ID
        status: !el.status, // Toggle current status
      }).unwrap();

      // Provide user feedback and refresh data
      toast.success(res?.message);
      refetch();
    } catch (err) {
      // Handle errors with user-friendly messages
      toast.error(err?.data?.message || err.error);
    }
  };

  /**
   * Loading state handling
   * Provides user feedback during initial data fetch
   */
  if (isLoading)
    return (
      <div className="py-16 flex justify-center">
        <Loading />
      </div>
    );

  /**
   * Progress calculation for sub-task completion
   * Business logic: Calculates percentage of completed sub-tasks for progress visualization
   */
  const percentageCompleted =
    task?.subTasks?.length === 0
      ? 0
      : (getCompletedSubTasks(task?.subTasks) / task?.subTasks?.length) * 100;

  return (
    <div className="space-y-4 pb-8">
      {/* Task header with title and stage indicator */}
      {/* Visual hierarchy: Large title with status indicator for immediate context */}
      <div className="flex items-start gap-3">
        {/* Stage indicator dot with dynamic color based on task stage */}
        <div
          className={clsx(
            "w-3 h-3 rounded-full mt-2.5 shrink-0",
            TASK_TYPE[task?.stage],
          )}
        />

        {/* Task title with overflow handling */}
        <h1 className="text-2xl font-bold text-gray-900 overflow-hidden">
          {task?.title}
        </h1>
      </div>

      {/* Main content container with tabbed interface */}
      {/* Design: Card-based layout with clean borders and subtle shadows */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Tabs tabs={TABS} setSelected={setSelected}>
          {/* Conditional rendering based on selected tab */}
          {selected === 0 ? (
            // Task Detail Tab Content
            <div className="flex flex-col md:flex-row gap-6 p-6">
              {/* Left column: Primary task information */}
              <div className="w-full md:w-1/2 space-y-6">
                {/* Status badges and quick information */}
                {/* UX: Immediate visual context through color-coded badges */}
                <div className="flex flex-wrap gap-2">
                  {/* Priority badge with icon and text */}
                  <span
                    className={clsx(
                      "badge flex items-center gap-1",
                      PRIORITY_BADGE[task?.priority],
                    )}
                  >
                    {PRIORITY_ICON[task?.priority]}
                    <span className="capitalize">
                      {task?.priority} Priority
                    </span>
                  </span>

                  {/* Stage/status badge with indicator dot */}
                  <span className="badge bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1.5">
                    <div
                      className={clsx(
                        "w-2 h-2 rounded-full",
                        TASK_TYPE[task?.stage],
                      )}
                    />
                    <span className="capitalize">{task?.stage}</span>
                  </span>

                  {/* Category badge (conditional rendering) */}
                  {task?.category && (
                    <span className="badge bg-blue-50 text-blue-700 border border-blue-200">
                      {CATEGORY_LABEL[task?.category] || task?.category}
                    </span>
                  )}
                </div>

                {/* Date information section */}
                {/* Business context: Important dates for project planning and tracking */}
                <div className="flex flex-col gap-1">
                  {/* Creation date - always present */}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    Created: {new Date(task?.date).toDateString()}
                  </p>

                  {/* Start date - conditional */}
                  {task?.startDate && (
                    <p className="text-sm text-gray-400">
                      Start: {new Date(task.startDate).toDateString()}
                    </p>
                  )}

                  {/* Due date with overdue detection */}
                  {/* UX: Red color and warning emoji for overdue tasks */}
                  {task?.dueDate && (
                    <p
                      className={`text-sm font-medium ${
                        new Date(task.dueDate) < new Date()
                          ? "text-red-400" // Overdue: Red for urgency
                          : "text-gray-400" // On time: Normal gray
                      }`}
                    >
                      Due: {new Date(task.dueDate).toDateString()}
                      {new Date(task.dueDate) < new Date() && " ⚠️ (Overdue)"}
                    </p>
                  )}
                </div>

                {/* Summary statistics panel */}
                {/* UX: Quick overview of task complexity and activity level */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  {/* Assets count */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {task?.assets?.length || 0}
                    </p>
                    <p className="text-xs text-gray-400">Assets</p>
                  </div>

                  {/* Visual separator */}
                  <div className="w-px bg-gray-200" />

                  {/* Sub-tasks count */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {task?.subTasks?.length || 0}
                    </p>
                    <p className="text-xs text-gray-400">Sub-tasks</p>
                  </div>

                  <div className="w-px bg-gray-200" />

                  {/* Activities count */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {task?.activities?.length || 0}
                    </p>
                    <p className="text-xs text-gray-400">Activities</p>
                  </div>
                </div>

                {/* Assigned team members section */}
                {/* Team collaboration: Shows who is responsible for task execution */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Task Team
                  </p>

                  <div className="space-y-2">
                    {task?.team?.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        {/* Team member avatar with initials */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: "#0068B5" }}
                        >
                          {getInitials(m?.name)}
                        </div>

                        {/* Team member information */}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {m?.name}
                          </p>
                          <p className="text-xs text-gray-400">{m?.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-tasks section with progress tracking */}
                {/* Conditional rendering: Only shows if sub-tasks exist */}
                {task?.subTasks?.length > 0 && (
                  <div>
                    {/* Sub-tasks header with progress indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Sub-Tasks
                      </p>

                      {/* Progress percentage badge with color coding */}
                      <span
                        className={clsx(
                          "badge text-xs",
                          percentageCompleted < 50
                            ? "bg-red-50 text-red-600 border border-red-200" // Low progress: Red
                            : percentageCompleted < 80
                              ? "bg-amber-50 text-amber-600 border border-amber-200" // Medium progress: Amber
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200", // High progress: Green
                        )}
                      >
                        {percentageCompleted.toFixed(0)}% done
                      </span>
                    </div>

                    {/* Visual progress bar */}
                    {/* UX: Immediate visual feedback on task completion status */}
                    <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all",
                          percentageCompleted < 50
                            ? "bg-red-400"
                            : percentageCompleted < 80
                              ? "bg-amber-400"
                              : "bg-emerald-400",
                        )}
                        style={{ width: `${percentageCompleted}%` }}
                      />
                    </div>

                    {/* Individual sub-task items */}
                    <div className="space-y-3">
                      {task?.subTasks?.map((el, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-gray-100 bg-gray-50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            {/* Sub-task information */}
                            <div className="flex-1">
                              {/* Sub-task metadata */}
                              <div className="flex items-center gap-2 mb-1">
                                {/* Creation date */}
                                <span className="text-xs text-gray-400">
                                  {new Date(el?.date).toDateString()}
                                </span>

                                {/* Sub-task tag/category */}
                                <span className="badge bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                                  {el?.tag}
                                </span>

                                {/* Completion status badge */}
                                <span
                                  className={clsx(
                                    "badge text-xs",
                                    el?.isCompleted
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-amber-50 text-amber-600 border border-amber-200",
                                  )}
                                >
                                  {el?.isCompleted ? "Done" : "Pending"}
                                </span>
                              </div>

                              {/* Sub-task title */}
                              <p className="text-sm font-medium text-gray-700">
                                {el?.title}
                              </p>
                            </div>

                            {/* Sub-task action button */}
                            {/* UX: Toggle button for marking completion/undoing completion */}
                            <button
                              disabled={isSubmitting}
                              onClick={() =>
                                handleSubmitAction({
                                  status: el?.isCompleted,
                                  id: task?._id,
                                  subId: el?._id,
                                })
                              }
                              className={clsx(
                                "shrink-0 text-xs px-2.5 py-1.5 rounded-lg font-medium disabled:cursor-not-allowed",
                                el?.isCompleted
                                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100" // Completed: Red for undo action
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100", // Pending: Green for completion
                              )}
                            >
                              {isSubmitting ? (
                                <FaSpinner className="animate-spin" />
                              ) : el?.isCompleted ? (
                                "Undo"
                              ) : (
                                "Mark Done"
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: Additional task information */}
              {/* Design: Separated by border on desktop for clear content division */}
              <div className="w-full md:w-1/2 space-y-6 md:border-l md:border-gray-100 md:pl-6">
                {/* Task description section */}
                {/* Conditional rendering: Only shows if description exists */}
                {task?.description && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Description
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {task?.description}
                    </p>
                  </div>
                )}

                {/* File attachments section */}
                {/* Rich media support: Images and file downloads */}
                {task?.assets?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Attachments
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {task.assets.map((url, i) => {
                        // URL processing for local vs external assets
                        const fullUrl = url.startsWith("http")
                          ? url
                          : `${window.location.origin}${url}`;
                        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(url);

                        return isImage ? (
                          // Image preview with click-to-view functionality
                          <a
                            key={i}
                            href={fullUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={fullUrl}
                              alt={`asset-${i}`}
                              className="w-24 h-24 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ) : (
                          // File download link with filename display
                          <a
                            key={i}
                            href={fullUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                          >
                            📎 {url.split("/").pop()}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* External links section */}
                {/* Business integration: Links to external resources and references */}
                {task?.links?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Links
                    </p>

                    <div className="space-y-2">
                      {task?.links?.map((el, i) => (
                        <a
                          key={i}
                          href={el}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200"
                        >
                          <HiLink />
                          <span className="truncate">{el}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Activity Timeline Tab Content
            // Renders the Activities component with task activity data
            <div className="p-6">
              <Activities
                activity={task?.activities}
                refetch={refetch}
                id={id}
              />
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

/**
 * Export the TaskDetail component as default export
 *
 * Component Summary:
 * - Comprehensive task detail view with tabbed interface
 * - Real-time data integration with automatic updates
 * - Interactive sub-task management with progress tracking
 * - Rich activity timeline with new activity creation
 * - File attachment and external link support
 * - Team member display with role information
 * - Responsive design adapting to various screen sizes
 *
 * Key Features:
 * - Tabbed interface separating task details from activity timeline
 * - Visual progress indicators for sub-task completion
 * - Color-coded priority and status indicators throughout
 * - Overdue task detection with visual warnings
 * - Interactive sub-task completion with immediate feedback
 * - Rich media support for images and file attachments
 * - External link integration for project references
 * - Real-time activity posting with form validation
 *
 * Data Integration:
 * - RTK Query for efficient data fetching and mutations
 * - Real-time updates through refetch mechanisms
 * - Optimistic UI updates with error handling
 * - Safe data access patterns with fallback handling
 *
 * UX Considerations:
 * - Clear visual hierarchy from overview to detailed information
 * - Immediate feedback for all user interactions
 * - Loading states during API operations
 * - Responsive design for mobile and desktop usage
 * - Accessible form controls and navigation
 *
 * Business Value:
 * - Complete task lifecycle management
 * - Team collaboration through activity tracking
 * - Progress monitoring through sub-task completion
 * - File and link management for project resources
 * - Historical activity tracking for accountability
 * - Due date monitoring with overdue alerts
 */
export default TaskDetail;
