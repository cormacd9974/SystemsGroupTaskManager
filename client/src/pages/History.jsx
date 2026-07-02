// External library imports for styling, date handling, and state management
import clsx from "clsx"; // Utility for conditionally joining CSS class names
import moment from "moment"; // Date manipulation and formatting library
import { useState } from "react"; // React hook for component state management
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md"; // Material Design priority icons
import { HiOutlineClipboardCheck } from "react-icons/hi"; // Heroicon for empty state illustration
import { useSelector } from "react-redux";
// Internal component and utility imports
import { Loading, Title, UserInfo } from "../components"; // Reusable UI components
import { useGetTaskHistoryQuery } from "../redux/slices/api/taskApiSlice"; // RTK Query hook for fetching completed tasks
import { CATEGORY_LABEL } from "../utils"; // Utility constant for category display mapping
import { Link } from "react-router-dom"; // React Router for navigation
import CompletionsTable from "../components/CompletionsTable";
import { FiDownload } from "react-icons/fi"; // Icon for export functionality]

/**
 * Priority badge styling configuration
 * Maintains visual consistency with other components throughout the application
 * Uses semantic color coding for immediate priority recognition
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
 * Consistent with priority display patterns across the application
 */
const PRIORITY_ICON = {
  high: <MdKeyboardDoubleArrowUp />, // Double arrow indicates highest urgency
  medium: <MdKeyboardArrowUp />, // Single up arrow for elevated priority
  normal: <MdKeyboardArrowDown />, // Down arrow for standard priority level
  low: <MdKeyboardArrowDown />, // Down arrow for low priority (same as normal for simplicity)
};

/**
 * History Component - Displays completed tasks with filtering and search capabilities
 *
 * @component
 *
 * Architecture decisions:
 * - Client-side filtering for responsive search and category filtering
 * - Table-based layout for structured data presentation
 * - Responsive design with mobile-optimized column hiding
 * - Empty state handling for improved user experience
 *
 * UX considerations:
 * - Real-time search filtering for immediate feedback
 * - Category-based filtering for task organization
 * - Visual completion indicators (green dots) for all tasks
 * - Consistent priority and team member displays
 * - Task count display for filter result awareness
 *
 * Performance optimizations:
 * - Single API call with client-side filtering
 * - Efficient array filtering with multiple criteria
 * - Conditional rendering for empty states
 * - Responsive table with horizontal scrolling
 *
 * Business context:
 * - Provides historical task completion tracking
 * - Enables retrospective analysis of completed work
 * - Supports project reporting and team performance review
 *
 * @returns {JSX.Element} Complete history interface with search, filtering, and task display
 */
const History = () => {
  /**
   * Data fetching and loading state management
   */

  // Fetch completed task history from the API
  // RTK Query provides caching, loading states, and error handling
  const { data, isLoading, isError } = useGetTaskHistoryQuery();
  const { user } = useSelector((state) => state.auth);
  /**
   * Local state for filtering and search functionality
   * Client-side filtering provides immediate user feedback
   */

  // Search input state for real-time task title filtering
  const [search, setSearch] = useState("");

  // Category filter state for task categorization
  // Defaults to "all" to show all tasks initially
  const [filterCategory, setFilterCat] = useState("all");

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
  if( isError ) {
    return (
      <div className="py-16 flex justify-center">
        <p className="text-red-600">Failed to load History please try again.</p>
      </div>
    )
  }

  /**
   * Data processing and safe access
   * Defensive programming to handle undefined API responses
   */

  // Fallback to empty array if no tasks exist in API response
  const tasks = data?.tasks || [];

  /**
   * Client-side filtering logic
   * Combines search text matching and category filtering
   *
   * Performance consideration: Filters on every render but acceptable for typical dataset sizes
   * Could be optimized with useMemo for very large datasets
   */
  const filtered = tasks.filter((t) => {
    // Case-insensitive search matching on task titles
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());

    // Category filtering with "all" option to show everything
    // Uses startsWith for flexible category matching (e.g., "project-web" matches "project")
    const matchCat =
      filterCategory === "all" || t.category?.startsWith(filterCategory);

    // Both conditions must be true for task to appear in results
    return matchCat && matchSearch;
  });

  /**
   * Filter button configuration
   * Defines available category filters with user-friendly labels
   * Business logic: Categories align with common task organization patterns
   */
  const categories = [
    { key: "all", label: "All" }, // Show all completed tasks
    { key: "report", label: "Reports" }, // Reporting and documentation tasks
    { key: "config", label: "Configurations" }, // System configuration tasks
    { key: "project", label: "Projects" }, // Project-related tasks
  ];

  const exportToCSV = () => {
    if(filtered.length === 0) return alert("No tasks to export with current filters.");

    const headers = ["Title", "Category", "Priority", "Team", "Completed Date"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = filtered.map((t) => [
      esc(t.title),
      esc(t.category),
      esc(t.priority),
      esc((t.team || []).map((m) => m.name).join("; ")),
      esc(t.updatedAt ? new Date(t.updatedAt).toLocaleDateString("en-IE") : "")
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {user?.isAdmin && <CompletionsTable tasks={data?.tasks || []} />}
      {/* Page header section */}
      {/* Provides context and description for the history view */}
      <div>
        <Title title="History" />
        <p className="text-sm text-gray-400 mt-0.5">
          Completed tasks over the past year.
        </p>
      </div>

      {/* Search and filtering controls */}
      {/* Responsive layout: Stacks vertically on mobile, horizontal on desktop */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search input field */}
        {/* Real-time filtering: Updates results as user types */}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)} // Immediate state update for responsive filtering
          className="input-field max-w-xs"
        />

        {/* Category filter buttons */}
        {/* Toggle-style buttons with active state styling */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilterCat(c.key)} // Update category filter
              className={clsx(
                "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                filterCategory === c.key
                  ? "text-white border-[#0068B5] bg-[#0068B5]" // Active state: Brand blue background
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300", // Inactive state: Subtle hover effect
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Results counter */}
        {/* UX: Shows user how many tasks match current filters */}
        <div className="ml-auto text-sm text-gray-500">
          <span className="font-medium text-gray-700">{filtered.length} tasks</span>
          <button onClick={exportToCSV} disabled={filtered.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-[#0068B5] hover:text-[#0068B5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-4">
            <FiDownload />
            Export
          </button>
        </div>
      </div>

      {/* Conditional rendering: Empty state vs task table */}
      {filtered.length === 0 ? (
        // Empty state when no tasks match current filters
        // UX: Friendly illustration and message instead of blank space
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center gap-3">
          {/* Empty state icon */}
          <HiOutlineClipboardCheck className="text-5xl text-gray-500" />

          {/* Empty state message */}
          <p className="text-gray-400 font-medium">No completed tasks found</p>
        </div>
      ) : (
        // Task table when results exist
        // Design: Card-style container with responsive table inside
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Horizontal scroll container for mobile responsiveness */}
          {/* Accessibility: Maintains table structure while allowing overflow scrolling */}
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              {/* Table header with column labels */}
              <thead>
                <tr>
                  <th>Task</th> 
                  <th>Category</th> 
                  <th>Priority</th> 
                  <th>Team</th>
                  <th className="hidden md:table-cell">Completed</th>
                  {/* Responsive: Hidden on mobile */}
                </tr>
              </thead>

              <tbody>
                {/* Iterate through filtered tasks to render table rows */}
                {filtered.map((task) => (
                  <tr key={task._id}>
                    {/* Task title cell with completion indicator and navigation */}
                    <td>
                      <Link
                        to={`/task/${task._id}`}
                        className="group flex items-center gap-2"
                      >
                        {/* Completion indicator - green dot for all completed tasks */}
                        {/* Visual consistency: All history items show completion status */}
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />

                        {/* Task title with hover effect and truncation */}
                        {/* UX: Hover effect indicates clickability */}
                        <span className="font-medium text-gray-800 group-hover:text-blue-600 text-xs line-clamp-1">
                          {task.title}
                        </span>
                      </Link>
                    </td>

                    {/* Category display with pill-style badge */}
                    <td>
                      {/* Consistent badge styling with fallback handling */}
                      {/* Data safety: Shows raw category or dash if no mapping exists */}
                      <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                        {CATEGORY_LABEL[task.category] || task.category || "-"}
                      </span>
                    </td>

                    {/* Priority badge with icon and color coding */}
                    <td>
                      {/* Combines visual (icon/color) and textual (label) priority indicators */}
                      {/* Accessibility: Multiple ways to communicate priority level */}
                      <span
                        className={clsx(
                          "badge text-xs flex items-center gap-1 w-fit",
                          PRIORITY_BADGE[task.priority],
                        )}
                      >
                        {PRIORITY_ICON[task.priority]}
                        <span className="capitalize">{task.priority}</span>
                      </span>
                    </td>

                    {/* Team member avatars with overflow handling */}
                    <td>
                      {/* Overlapping avatar design for space efficiency */}
                      {/* Performance: Limits display to first 3 members + count */}
                      <div className="flex -space-x-1 items-center">
                        {task?.team?.slice(0, 3).map((m, idx) => (
                          <div
                            key={idx}
                            className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs border-2 border-white font-bold"
                            // Dynamic background colors from predefined palette
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
                            title={m?.name} // Accessibility: Tooltip shows full name
                          >
                            {/* UserInfo component provides expandable user details */}
                            <UserInfo user={m} />
                          </div>
                        ))}

                        {/* Overflow indicator for large teams */}
                        {/* UX: Shows additional team member count without UI clutter */}
                        {task?.team?.length > 3 && (
                          <div
                            className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs border-2 border-white font-bold"
                            style={{ backgroundColor: "#003d6b" }}
                          >
                            +{task.team.length - 3}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Task completion date - hidden on mobile for space */}
                    {/* Uses moment.js for consistent date formatting */}
                    <td className="hidden md:table-cell text-gray-400 text-xs">
                      {moment(task.updatedAt).format("DD MMM YYYY")}
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

/**
 * Export the History component as default export
 *
 * Component Summary:
 * - Displays completed tasks with comprehensive filtering capabilities
 * - Provides real-time search and category-based filtering
 * - Uses consistent visual patterns from other task display components
 * - Implements responsive design for various screen sizes
 * - Handles empty states gracefully with user-friendly messaging
 *
 * Key Features:
 * - Real-time search filtering on task titles
 * - Category-based filtering with predefined options
 * - Visual completion indicators for all tasks
 * - Team member avatar displays with overflow handling
 * - Priority badges with semantic color coding
 * - Responsive table design with mobile optimization
 * - Task count display for filter result awareness
 * - Navigation links to individual task detail pages
 *
 * Data Integration:
 * - RTK Query for efficient data fetching and caching
 * - Client-side filtering for immediate user feedback
 * - Safe data access patterns with fallback handling
 * - Consistent date formatting using moment.js
 *
 * UX Considerations:
 * - Progressive disclosure with expandable user information
 * - Consistent visual language with other application components
 * - Clear visual hierarchy from search controls to task details
 * - Responsive design adapts to different screen constraints
 * - Empty state provides guidance when no results match filters
 *
 * Performance Optimizations:
 * - Single API call with client-side filtering
 * - Efficient array operations for search and category filtering
 * - Conditional rendering minimizes DOM complexity
 * - Responsive image loading through avatar components
 *
 * Business Value:
 * - Enables historical task analysis and reporting
 * - Supports project retrospectives and performance reviews
 * - Provides searchable archive of completed work
 * - Facilitates team workload and productivity analysis
 */
export default History;
