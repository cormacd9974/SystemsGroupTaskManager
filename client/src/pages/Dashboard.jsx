// External library imports for styling, date handling, and state management
import clsx from "clsx"; // Utility for conditionally joining CSS class names
import moment from "moment"; // Date manipulation and formatting library
import { useEffect } from "react"; // React hook for side effects
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md"; // Material Design priority icons
import {
  HiCheckCircle,
  HiClock,
  HiCollection,
  HiLightningBolt,
  HiExclamationCircle,
} from "react-icons/hi"; // Heroicons for dashboard stats

// Internal component and utility imports
import { Chart, Loading, UserInfo } from "../components"; // Reusable UI components
import { useGetDashboardStatsQuery } from "../redux/slices/api/taskApiSlice"; // RTK Query hook for dashboard data
import { TASK_TYPE, CATEGORY_LABEL, getInitials } from "../utils"; // Utility constants and helper functions
import { useSelector } from "react-redux"; // Redux hook for accessing auth state
import { Link } from "react-router-dom"; // React Router for navigation

/**
 * Priority badge styling configuration
 * Consistent with other components for unified visual language
 * Maps priority levels to semantic color schemes for immediate recognition
 */
const PRIORITY_BADGE = {
  high: "text-red-600 bg-red-50 border border-red-200", // High priority: Red for urgency
  medium: "text-amber-600 bg-amber-50 border border-amber-200", // Medium priority: Amber for caution
  normal: "text-blue-600 bg-blue-50 border border-blue-200", // Normal priority: Blue for standard
  low: "text-slate-500 bg-slate-50 border border-slate-200", // Low priority: Muted slate
};

/**
 * Priority icon mapping for visual hierarchy reinforcement
 * Uses directional arrows to communicate priority levels intuitively
 */
const PRIORITY_ICON = {
  high: <MdKeyboardDoubleArrowUp />, // Double arrow for highest urgency
  medium: <MdKeyboardArrowUp />, // Single up arrow for elevated priority
  normal: <MdKeyboardArrowDown />, // Down arrow for standard priority
  low: <MdKeyboardArrowDown />, // Down arrow for low priority
};

/**
 * StatCard Component - Reusable dashboard metric display card
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.label - Primary label for the statistic
 * @param {number} props.count - Numeric value to display
 * @param {React.ReactNode} props.icon - Icon component for visual context
 * @param {string} props.colorClass - CSS class for color theming
 * @param {string} props.accent - CSS classes for icon container styling
 * @param {string} props.subLabel - Optional secondary label (defaults to "Past year")
 *
 * Design decisions:
 * - Card-based layout for scannable information architecture
 * - Large numeric display for quick metric comprehension
 * - Icon reinforcement for visual categorization
 * - Consistent spacing and typography hierarchy
 *
 * @returns {JSX.Element} Styled metric card with icon and labels
 */
const StatCard = ({ label, count, icon, colorClass, accent, subLabel }) => (
  <div className={clsx("stat-card p-5 card-lift", colorClass)}>
    <div className="flex items-start justify-between">
      <div>
        {/* Primary statistic label */}
        {/* Typography: Small, uppercase, tracked text for category identification */}
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-300 uppercase tracking-wider mb-2">
          {label}
        </p>

        {/* Main statistic value */}
        {/* Typography: Large, bold number for immediate impact and readability */}
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {count}
        </p>

        {/* Supporting context label */}
        {/* UX: Provides temporal context for the statistic (e.g., "Past year", "Currently") */}
        <p className="text-xs text-gray-400 mt-1">{subLabel || "Past 3 months"}</p>
      </div>

      {/* Icon container with themed background */}
      {/* Design: Rounded square container with semantic color coding */}
      {/* Visual hierarchy: Icons provide quick categorization and visual interest */}
      <div
        className={clsx(
          "w-11 h-11 rounded-xl flex items-center justify-center text-xl",
          accent,
        )}
      >
        {icon}
      </div>
    </div>
  </div>
);

/**
 * Dashboard Component - Main dashboard view with comprehensive project overview
 *
 * @component
 *
 * Architecture decisions:
 * - Single-page dashboard with multiple information panels
 * - Real-time data fetching with automatic refetch on mount
 * - Role-based content display (admin-only sections)
 * - Responsive grid layouts for various screen sizes
 * - Modular sub-components for maintainability
 *
 * UX considerations:
 * - Personalized greeting with time-based salutation
 * - Visual hierarchy from high-level stats to detailed task lists
 * - Color-coded priority and status indicators throughout
 * - Overdue task highlighting for urgent attention
 * - Progressive disclosure of information based on user role
 *
 * Performance optimizations:
 * - Conditional rendering based on data availability
 * - Loading states for better perceived performance
 * - Efficient data structure access with safe fallbacks
 *
 * @returns {JSX.Element} Complete dashboard interface with stats, charts, and task lists
 */
const Dashboard = () => {
  /**
   * Data fetching and state management
   */

  // Fetch comprehensive dashboard statistics from API
  // refetchOnMountOrArgChange ensures fresh data on each visit
  const { data, isLoading, isError } = useGetDashboardStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Get current authenticated user for personalization and role-based features
  const { user } = useSelector((s) => s.auth);

  /**
   * Side effects and initialization
   */

  // Scroll to top when dashboard mounts for consistent user experience
  // Smooth scrolling provides polished navigation feel
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  /**
   * Data processing and safe access patterns
   * Implements defensive programming to handle undefined/null API responses
   */

  // Safely access task counts by status with fallback to empty object
  const totals = data?.tasks || {};

  // Safely access current task counts by status
  const current = data?.currentTasks || {};

  /**
   * Loading state handling
   * Provides user feedback during data fetching
   */
  if (isLoading)
    return (
      <div className="py-16 flex justify-center">
        <Loading />
      </div>
    );
  if (isError)
    return (
      <div className="py-16 flex justify-center">
        <p className="text-red-500">Failed to load Dashboard, Try again.</p>
      </div>
    );

  /**
   * Dashboard statistics configuration
   * Defines the metric cards displayed at the top of the dashboard
   * Each stat includes semantic icons and color coding for quick comprehension
   */
  const stats = [
    {
      label: "Total Tasks",
      total: data?.totalTasks || 0,
      icon: <HiCollection className="text-blue-600" />,
      colorClass: "blue",
      accent: "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
      subLabel: "Currently",
    },
    {
      label: "Completed",
      total: totals["completed"] || 0,
      icon: (
        <HiCheckCircle className="text-emerald-600 dark:text-emerald-600" />
      ),
      colorClass: "green",
      accent:
        "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "in-progress",
      total: current["in-progress"] || 0,
      icon: <HiLightningBolt className="text-amber-600" />,
      colorClass: "amber",
      accent:
        "bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
      subLabel: "Currently",
    },
    {
      label: "To Do",
      total: current["todo"] || 0,
      icon: <HiClock className="text-rose-600" />,
      colorClass: "rose",
      accent: "bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
      subLabel: "Currently",
    },
    {
      label: "Overdue",
      total: data?.overdueCount || 0,
      icon: <HiExclamationCircle className="text-rose-600" />,
      colorClass: "rose",
      accent: "bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
      subLabel: "Currently",
    },
  ];

  return (
    <div className="py-4 space-y-6">
      {/* Dashboard header with personalized greeting and date */}
      {/* UX: Creates welcoming, personalized experience for users */}
      <div className="flex items-center justify-between">
        <div>
          {/* Dynamic greeting based on time of day */}
          {/* Personalization: Uses first name and appropriate salutation */}
          <h2 className="text-xl font-bold text-gray-900">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            , {user?.name?.split(" ")[0]} 👋
          </h2>

          {/* Contextual subtitle explaining dashboard purpose */}
          <p className="text-sm text-gray-400 mt-0.5">
            Here's what's happening with your team today.
          </p>
        </div>

        {/* Current date display - hidden on mobile for space efficiency */}
        {/* Responsive design: Shows detailed date info only on larger screens */}
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-gray-700">
            {moment().format("dddd, MMMM D")}
          </p>
          <p className="text-xs text-gray-400">{moment().format("YYYY")}</p>
        </div>
      </div>

      {/* Dashboard statistics cards grid */}
      {/* Responsive grid: 2 columns on mobile, 5 on large screens */}
      {/* Visual hierarchy: Most important metrics displayed prominently */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} count={s.total} />
        ))}
      </div>

      {/* Priority breakdown visualization section */}
      {/* Data visualization: Chart component shows task distribution by priority */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Priority Breakdown</h3>

          {/* Context badge indicating chart scope */}
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            All tasks
          </span>
        </div>

        {/* Chart container with overflow handling for responsive design */}
        <div className="w-full overflow-visible">
          <Chart data={data?.graphData} />
        </div>
      </div>

      {/* Two-column layout for recent tasks and team information */}
      {/* Responsive design: Stacks vertically on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Recent tasks table - always visible when data exists */}
        {data && <RecentTasksTable tasks={data?.last10Task} />}

        {/* Team members table - admin-only feature */}
        {/* Role-based rendering: Only admins see team management information */}
        {data && user?.isAdmin && <TeamMembersTable users={data?.users} />}
      </div>

      {/* Team workload panel - admin-only, conditional on data availability */}
      {/* Progressive disclosure: Shows detailed team status only when relevant */}
      {user?.isAdmin && data?.teamStatus?.length > 0 && (
        <TeamWorkPanel teamStatus={data.teamStatus} />
      )}
    </div>
  );
};;

/**
 * RecentTasksTable Component - Displays the 10 most recent tasks
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of recent task objects
 *
 * Features:
 * - Overdue task highlighting with red background
 * - Clickable task titles linking to detail pages
 * - Priority badges with icons for quick scanning
 * - Team member avatars with overlapping design
 * - Responsive column hiding for mobile optimization
 *
 * @returns {JSX.Element} Table displaying recent tasks with full context
 */
const RecentTasksTable = ({ tasks }) => (
  <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    {/* Table header with title */}
    <div className="px-5 py-4 border-b border-gray-100">
      <h3 className="font-bold text-gray-900 text-sm">Recent Tasks</h3>
    </div>

    <table className="w-full data-table">
      <thead>
        <tr>
          {/* Column width optimization for content hierarchy */}
          <th style={{ width: "64%" }}>Task</th>
          <th style={{ width: "6%" }}>Priority</th>
          <th style={{ width: "20%" }}>Team</th>
          <th className="hidden md:table-cell" style={{ width: "10%" }}>
            Created
          </th>
        </tr>
      </thead>

      <tbody>
        {tasks?.map((task, i) => (
          // Conditional row styling for overdue tasks
          // UX: Red background immediately draws attention to urgent items
          <tr
            key={i}
            className={`${task?.dueDate && new Date(task.dueDate) < new Date() ? "bg-red-50 border-l-4 border-l-red-400" : ""}`}
          >
            {/* Task title cell with status indicator and navigation */}
            <td className="max-w-0">
              <Link to={`/task/${task._id}`}>
                <div className="flex items-center gap-2">
                  {/* Stage indicator dot with dynamic color */}
                  <div
                    className={clsx(
                      "w-2 h-2 rounded-full shrink-0",
                      TASK_TYPE[task.stage],
                    )}
                  />

                  {/* Task title with truncation for layout stability */}
                  <span className="font-medium text-gray-800 text-xs line-clamp-1 truncate max-w-xs">
                    {task?.title}
                  </span>
                </div>
              </Link>
            </td>

            {/* Priority badge with icon and text */}
            {/* Consistent styling with other priority displays across app */}
            <td>
              <span
                className={clsx(
                  "badge text-xs flex items-center gap-1 w-fit",
                  PRIORITY_BADGE[task?.priority],
                )}
              >
                {PRIORITY_ICON[task?.priority]}
                <span className="capitalize">{task?.priority}</span>
              </span>
            </td>

            {/* Team member avatars with overlapping design */}
            {/* Space-efficient display for multiple team members */}
            <td>
              <div className="flex -space-x-1">
                {task?.team?.map((m, idx) => (
                  <div
                    key={idx}
                    className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs border-2 border-white font-bold"
                    // Dynamic color assignment from predefined palette
                    style={{
                      backgroundColor: [
                        "#0068B5",
                        "#005a9e",
                        "#004f8c",
                        "#0079cc",
                        "#0086e0",
                        "#003d6b",
                        "#0057a0",
                        "#0073c6",
                      ][idx % 8],
                    }}
                  >
                    <UserInfo user={m} />
                  </div>
                ))}
              </div>
            </td>

            {/* Relative creation time - hidden on mobile */}
            {/* Uses moment.js for human-readable time formatting */}
            <td className="hidden md:table-cell text-gray-400 text-xs">
              {moment(task?.date).fromNow()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * TeamMembersTable Component - Displays all team members with status
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.users - Array of user objects with status information
 *
 * Admin-only feature for team management and oversight
 * Shows active/inactive status for team member management
 *
 * @returns {JSX.Element} Table displaying team members and their status
 */
const TeamMembersTable = ({ users }) => (
  <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    {/* Table header */}
    <div className="px-5 py-4 border-b border-gray-100">
      <h3 className="font-bold text-gray-900 text-sm">Team Members</h3>
    </div>

    <table className="w-full data-table">
      <thead>
        <tr>
          <th style={{ width: "90%" }}>Name</th>
          <th style={{ width: "10%" }}>Status</th>
        </tr>
      </thead>

      <tbody>
        {users?.map((user, i) => (
          <tr key={i}>
            {/* User information with avatar and role */}
            <td>
              <div className="flex items-center gap-2.5">
                {/* User avatar with initials and dynamic color */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{
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
                  {getInitials(user?.name)}
                </div>

                {/* User name and role information */}
                <div>
                  <p className="font-medium text-gray-900 text-xl">
                    {user.name}
                  </p>
                  <p className="text-gray-400 text-xs">{user?.role}</p>
                </div>
              </div>
            </td>

            {/* Active/inactive status badge */}
            {/* Color coding: Green for active, amber for inactive */}
            <td>
              <span
                className={clsx(
                  "badge text-xs",
                  user?.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200",
                )}
              >
                {user?.isActive ? "Active" : "Inactive"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * TeamWorkPanel Component - Shows detailed team workload breakdown
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.teamStatus - Array of team members with their in-progress tasks
 *
 * Admin-only feature providing detailed insight into team workload distribution
 * Helps managers understand team capacity and task allocation
 *
 * Features:
 * - Individual team member sections
 * - In-progress task count badges
 * - Clickable task links with priority indicators
 * - Category labels for task context
 * - Empty state handling for members with no active tasks
 *
 * @returns {JSX.Element} Comprehensive team workload overview panel
 */
const TeamWorkPanel = ({ teamStatus }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    {/* Panel header with description */}
    <div className="px-5 py-4 border-b border-gray-100">
      <h3 className="font-bold text-gray-900 text-sm">
        What the team is working on
      </h3>
      <p className="text-xs text-gray-400 mt-0.5">
        All in-progress tasks by member
      </p>
    </div>

    {/* Team member sections with dividers */}
    <div className="divide-y divide-gray-100">
      {teamStatus.map((member, i) => (
        <div key={i} className="px-5 py-4">
          {/* Member header with avatar, info, and task count */}
          <div className="flex items-center gap-3 mb-3">
            {/* Member avatar with dynamic color */}
            <div
              className="w-8 h-8 rounded-xl bg-linear-to-br flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{
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
              {getInitials(member.name)}
            </div>

            {/* Member name and title */}
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {member.name}
              </p>
              <p className="text-xs text-gray-400">{member.title}</p>
            </div>

            {/* In-progress task count badge */}
            {/* Color coding: Amber for active tasks, gray for no tasks */}
            <span
              className={clsx(
                "ml-auto badge text-xs",
                member.inProgressTasks?.length > 0
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-gray-50 text-gray-400 border border-gray-200",
              )}
            >
              {member.inProgressTasks?.length || 0} in-progress
            </span>
          </div>

          {/* Task list or empty state */}
          {member.inProgressTasks?.length > 0 ? (
            // List of in-progress tasks with full context
            <div className="flex flex-col gap-2 pl-11">
              {member.inProgressTasks.map((task, j) => (
                // Individual task card with hover effects and navigation
                <Link
                  to={`/task/${task._id}`}
                  key={j}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* In-progress indicator dot */}
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />

                    {/* Task title with truncation */}
                    <span className="text-xs font-medium text-gray-800 truncate">
                      {task.title}
                    </span>

                    {/* Category label - hidden on mobile */}
                    {task.category && (
                      <span className="hidden md:inline text-xs text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded-full shrink-0">
                        {CATEGORY_LABEL[task.category] || task.category}
                      </span>
                    )}
                  </div>

                  {/* Priority badge */}
                  <span
                    className={clsx(
                      "badge text-xs shrink-0 ml-2",
                      PRIORITY_BADGE[task.priority],
                    )}
                  >
                    {task.priority}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            // Empty state for members with no active tasks
            <p className="text-xs text-gray-300 pl-11">No active tasks</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Export the Dashboard component as default export
 *
 * Component Summary:
 * - Comprehensive project dashboard with multiple information panels
 * - Real-time data integration with automatic refresh capabilities
 * - Role-based feature access (admin vs regular user views)
 * - Responsive design adapting to various screen sizes
 * - Rich data visualization with charts and interactive elements
 *
 * Key Features:
 * - Personalized greeting with time-based salutations
 * - High-level statistics with semantic color coding
 * - Priority breakdown visualization via Chart component
 * - Recent tasks table with overdue highlighting
 * - Team member management (admin-only)
 * - Detailed team workload analysis (admin-only)
 * - Consistent navigation patterns throughout
 *
 * Data Integration:
 * - RTK Query for efficient data fetching and caching
 * - Redux integration for user authentication state
 * - Defensive programming with safe data access patterns
 * - Loading states for improved user experience
 *
 * UX Considerations:
 * - Visual hierarchy from overview to detailed information
 * - Color-coded priority and status indicators
 * - Responsive grid layouts for optimal space usage
 * - Hover effects and smooth transitions for interactivity
 * - Progressive disclosure based on user roles and data availability
 *
 * Performance Optimizations:
 * - Conditional rendering to minimize DOM complexity
 * - Efficient data structure access with fallbacks
 * - Modular component architecture for code reusability
 * - Optimized re-rendering through proper key usage
 */
export default Dashboard;
