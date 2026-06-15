/**
 * TEAM COMPLETIONS TABLE COMPONENT
 *
 * This component displays a comprehensive analytics table showing team member
 * task completion statistics with date range filtering, priority breakdowns,
 * and detailed task drill-down capabilities. It serves as a key performance
 * dashboard for project managers and team leads to track productivity and
 * identify top performers.
 */

// REACT IMPORTS
import { useState } from "react"; // State management for date filters and breakdown panel
import { Link } from "react-router-dom"; // Navigation to individual task detail pages

// UTILITY IMPORTS
import { CATEGORY_LABEL } from "../utils"; // Task category display labels for user-friendly formatting

// ICON IMPORTS - Heroicons for consistent UI iconography
import { HiChevronRight, HiX, HiCheckCircle, HiUsers } from "react-icons/hi";

/**
 * PRIORITY CONFIGURATION CONSTANTS
 *
 * BUSINESS LOGIC: Defines the complete priority hierarchy used throughout
 * the task management system, ensuring consistent priority handling and
 * display across all components.
 *
 * ORDERING: Array order determines display sequence in table headers
 * and affects sorting logic for priority-based analytics.
 */
const PRIORITIES = ["high", "medium", "normal", "low"];

/**
 * PRIORITY VISUAL STYLING SYSTEM
 *
 * DESIGN SYSTEM: Comprehensive styling configuration that provides consistent
 * visual representation of task priorities across light and dark themes.
 *
 * ACCESSIBILITY: Color choices follow WCAG guidelines with sufficient contrast
 * ratios and are supplemented with text labels for colorblind users.
 *
 * UX PSYCHOLOGY: Color associations leverage universal conventions:
 * - Red (high): Urgency, immediate attention required
 * - Blue (medium): Important but manageable, professional priority
 * - Amber (normal): Standard workflow, balanced attention
 * - Emerald (low): Low urgency, can be deferred
 *
 * THEME SUPPORT: Includes both light and dark mode variants for consistent
 * user experience across different viewing preferences and environments.
 */
const PRIORITY_STYLES = {
  high: {
    dot: "bg-red-500", // URGENT: Red dot for high priority indicators
    badge:
      "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
  medium: {
    dot: "bg-blue-500", // IMPORTANT: Blue dot for medium priority
    badge:
      "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  normal: {
    dot: "bg-amber-500", // STANDARD: Amber dot for normal priority
    badge:
      "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  },
  low: {
    dot: "bg-emerald-500", // DEFERRED: Green dot for low priority
    badge:
      "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  },
};

/**
 * AVATAR COMPONENT
 *
 * USER IDENTIFICATION: Creates personalized visual identifiers for team members
 * when profile photos aren't available, supporting user recognition and
 * visual consistency across the application.
 *
 * ALGORITHM: Extracts initials from full names using space-separated word
 * parsing, limited to 2 characters for consistent sizing and readability.
 *
 * DESIGN CONSISTENCY: Uses brand color (#0068B5) for unified visual identity
 * and professional appearance across all user representations.
 *
 * ACCESSIBILITY: High contrast white text on blue background ensures
 * readability for users with visual impairments.
 */
const Avatar = ({ name }) => {
  // INITIAL EXTRACTION: Parse name and create 2-character initials
  // ALGORITHM: Split by spaces, take first character of each word, limit to 2 chars
  const initials = name
    ?.split(" ") // PARSING: Split full name by spaces
    .map((n) => n[0]) // EXTRACTION: First character of each word
    .join("") // CONCATENATION: Combine initials
    .slice(0, 2) // LIMITATION: Maximum 2 characters for consistency
    .toUpperCase(); // FORMATTING: Uppercase for readability

  return (
    // AVATAR CONTAINER: Circular design with brand color background
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
      style={{ backgroundColor: "#0068B5" }} // BRAND COLOR: Consistent blue theme
    >
      {initials}
    </div>
  );
};

/**
 * DATE RANGE INITIALIZATION
 *
 * DEFAULT BEHAVIOR: Sets up sensible default date range for initial component
 * load, showing the last 30 days of completed tasks which provides immediate
 * value while being computationally reasonable.
 *
 * PERFORMANCE CONSIDERATION: 30-day default prevents loading excessive data
 * on component mount while still providing meaningful analytics context.
 */
// CURRENT DATE: Today's date in ISO format for date input compatibility
const today = new Date().toISOString().split("T")[0];

// DEFAULT RANGE: 30 days ago for reasonable initial data scope
const monthAgo = new Date(Date.now() - 30 * 86400000) // 30 days * 24 hours * 60 minutes * 60 seconds * 1000ms
  .toISOString()
  .split("T")[0];

/**
 * MAIN COMPLETIONS TABLE COMPONENT
 *
 * ANALYTICS DASHBOARD: Comprehensive team performance analytics component
 * that processes completed tasks and presents actionable insights for
 * project management and team performance evaluation.
 *
 * INTERACTIVE FEATURES:
 * - Date range filtering for temporal analysis
 * - Priority-based breakdowns for detailed insights
 * - Drill-down capability to individual task details
 * - Top performer identification and highlighting
 *
 * BUSINESS VALUE: Enables data-driven team management decisions by providing
 * clear visibility into individual and team productivity patterns.
 */
const CompletionsTable = ({ tasks }) => {
  // STATE MANAGEMENT: Date range filtering controls
  const [fromDate, setFromDate] = useState(monthAgo); // START DATE: Beginning of analysis period
  const [toDate, setToDate] = useState(today); // END DATE: End of analysis period

  // STATE MANAGEMENT: Task breakdown panel for detailed drill-down
  const [breakdown, setBreakdown] = useState(null); // BREAKDOWN DATA: Selected member's task details

  /**
   * DATE RANGE PROCESSING
   *
   * TEMPORAL FILTERING: Creates precise date boundaries for task filtering,
   * ensuring accurate analytics by including all tasks completed within
   * the specified date range, including end-of-day completions.
   */
  // DATE BOUNDARIES: Convert string dates to Date objects for comparison
  const cutoff = new Date(fromDate); // START BOUNDARY: Beginning of range
  const ceiling = new Date(toDate); // END BOUNDARY: End of range
  ceiling.setHours(23, 59, 59, 999); // INCLUSIVE END: Include entire end date

  /**
   * TASK FILTERING LOGIC
   *
   * TEMPORAL ANALYSIS: Filters completed tasks to only include those updated
   * (completed) within the selected date range, providing accurate completion
   * metrics for the specified time period.
   *
   * DATA INTEGRITY: Uses updatedAt timestamp to determine completion date,
   * which reflects when tasks were actually marked as completed rather than
   * their original creation or due dates.
   */
  const inRange = tasks.filter((t) => {
    const d = new Date(t.updatedAt); // COMPLETION DATE: When task was last updated (completed)
    return d >= cutoff && d <= ceiling; // RANGE CHECK: Within selected date boundaries
  });

  /**
   * TEAM MEMBER AGGREGATION ALGORITHM
   *
   * DATA PROCESSING: Aggregates task completion data by team member,
   * calculating both total completions and priority-based breakdowns
   * for comprehensive performance analysis.
   *
   * PERFORMANCE OPTIMIZATION: Single-pass algorithm that processes each
   * task once while building complete member statistics, minimizing
   * computational complexity for large datasets.
   *
   * DATA STRUCTURE: Creates nested object structure for efficient lookup
   * and display of member statistics across different priority levels.
   */
  const members = {};
  inRange.forEach((task) => {
    // TEAM ITERATION: Process each team member assigned to the task
    (task.team || []).forEach((m) => {
      // MEMBER IDENTIFICATION: Handle both populated and reference-only team data
      const id = m._id || m; // ID EXTRACTION: Support both object and string references

      // MEMBER INITIALIZATION: Create member record if not exists
      if (!members[id]) {
        members[id] = {
          name: m.name || "Unknown", // DISPLAY NAME: User-friendly identifier
          total: [], // TOTAL TASKS: All completed tasks
          byPriority: {}, // PRIORITY BREAKDOWN: Tasks grouped by priority
        };
        // PRIORITY STRUCTURE: Initialize empty arrays for each priority level
        PRIORITIES.forEach((p) => (members[id].byPriority[p] = []));
      }

      // TASK AGGREGATION: Add task to member's statistics
      members[id].total.push(task); // TOTAL COUNT: Add to overall completion count

      // PRIORITY CATEGORIZATION: Add task to appropriate priority bucket
      if (members[id].byPriority[task.priority]) {
        members[id].byPriority[task.priority].push(task);
      }
    });
  });

  /**
   * PERFORMANCE RANKING
   *
   * SORTING ALGORITHM: Ranks team members by total task completions in
   * descending order, enabling identification of top performers and
   * productivity patterns across the team.
   *
   * BUSINESS LOGIC: Total completion count serves as primary performance
   * metric, providing clear and objective ranking criteria for team
   * performance evaluation and recognition.
   */
  const rows = Object.values(members).sort(
    (a, b) => b.total.length - a.total.length, // DESCENDING SORT: Highest completions first
  );

  /**
   * BREAKDOWN PANEL HANDLER
   *
   * DRILL-DOWN FUNCTIONALITY: Opens detailed task breakdown panel for
   * specific team member and priority combination, enabling detailed
   * analysis of individual performance and task composition.
   *
   * UX OPTIMIZATION: Prevents opening empty breakdowns to avoid
   * confusing user interactions and maintains clean interface state.
   *
   * STATE MANAGEMENT: Updates breakdown state with member context,
   * priority filter, and task list for detailed display.
   */
  const openBreakdown = (name, label, list) => {
    // VALIDATION: Only open breakdown if tasks exist
    if (list.length === 0) return;

    // STATE UPDATE: Set breakdown data for panel display
    setBreakdown({ name, label, list });
  };

  return (
    // MAIN CONTAINER: Rounded card design with shadow and border for visual separation
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
      {/* HEADER SECTION
          DESIGN: Brand-colored header with icon, title, and interactive controls
          FUNCTIONALITY: Displays summary statistics and date range controls */}
      <div className="bg-[#0068B5] px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        {/* HEADER CONTENT: Icon, title, and summary statistics */}
        <div className="flex items-center gap-3">
          {/* HEADER ICON: Visual identifier for the analytics section */}
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <HiUsers className="text-white text-lg" />
          </div>

          {/* HEADER TEXT: Title and dynamic summary information */}
          <div>
            <h2 className="text-white font-semibold text-base">
              Team Completions
            </h2>
            {/* DYNAMIC SUMMARY: Shows filtered task count with proper pluralization */}
            <p className="text-blue-100 text-xs mt-0.5">
              {inRange.length} task{inRange.length !== 1 ? "s" : ""} completed
              in selected range
            </p>
          </div>
        </div>

        {/* DATE RANGE CONTROLS
            FUNCTIONALITY: Interactive date pickers for filtering analytics data
            UX: Responsive layout with proper labeling and validation */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* FROM DATE PICKER: Start of analysis range */}
          <div className="flex flex-col">
            <span className="text-blue-100 text-xs mb-1">From</span>
            <input
              type="date"
              value={fromDate}
              max={toDate} // VALIDATION: Prevent start date after end date
              onChange={(e) => {
                setFromDate(e.target.value);
                setBreakdown(null); // RESET: Clear breakdown when date changes
              }}
              className="border-0 rounded-lg px-3 py-1.5 text-sm bg-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* TO DATE PICKER: End of analysis range */}
          <div className="flex flex-col">
            <span className="text-blue-100 text-xs mb-1">To</span>
            <input
              type="date"
              value={toDate}
              min={fromDate} // VALIDATION: Prevent end date before start date
              max={today} // VALIDATION: Prevent future dates
              onChange={(e) => {
                setToDate(e.target.value);
                setBreakdown(null); // RESET: Clear breakdown when date changes
              }}
              className="border-0 rounded-lg px-3 py-1.5 text-sm bg-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
        </div>
      </div>

      {/* ANALYTICS TABLE SECTION
          DATA PRESENTATION: Comprehensive table showing member statistics
          INTERACTIVITY: Clickable cells for detailed breakdowns */}
      <div className="bg-white dark:bg-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          {/* TABLE HEADER: Column definitions and priority badges */}
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700">
              {/* MEMBER COLUMN: Team member identification */}
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Member
              </th>

              {/* TOTAL COLUMN: Overall completion count */}
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>

              {/* PRIORITY COLUMNS: Individual priority breakdowns */}
              {PRIORITIES.map((p) => (
                <th key={p} className="text-center py-3 px-4">
                  {/* PRIORITY BADGE: Visual priority indicator with dot and label */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${PRIORITY_STYLES[p].badge}`}
                  >
                    {/* PRIORITY DOT: Color-coded visual indicator */}
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${PRIORITY_STYLES[p].dot}`}
                    />
                    {p}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* TABLE BODY: Member statistics and interactive elements */}
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {/* EMPTY STATE: Display when no completed tasks in date range */}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  {/* EMPTY STATE ICON: Visual indicator for no data */}
                  <HiCheckCircle className="text-gray-300 text-4xl mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    No completed tasks in this date range.
                  </p>
                </td>
              </tr>
            )}

            {/* MEMBER ROWS: Individual team member statistics */}
            {rows.map((m, idx) => (
              <tr
                key={m.name}
                className={`hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors ${
                  // TOP PERFORMER HIGHLIGHTING: Special styling for highest performer
                  idx === 0 && rows.length > 1
                    ? "bg-blue-50/30 dark:bg-blue-900/10"
                    : ""
                }`}
              >
                {/* MEMBER CELL: Avatar, name, and performance indicators */}
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    {/* USER AVATAR: Visual user identifier */}
                    <Avatar name={m.name} />

                    <div>
                      {/* MEMBER NAME: Primary identifier */}
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {m.name}
                      </p>

                      {/* TOP PERFORMER BADGE: Recognition for highest completions */}
                      {idx === 0 && rows.length > 1 && (
                        <p className="text-xs text-[#0068B5] font-medium">
                          Top performer
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* TOTAL COMPLETIONS: Interactive button showing overall count */}
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => openBreakdown(m.name, "All", m.total)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0068B5] text-white text-sm font-bold hover:bg-[#005a9e] transition-colors shadow-sm"
                  >
                    {m.total.length}
                  </button>
                </td>

                {/* PRIORITY BREAKDOWN CELLS: Individual priority statistics */}
                {PRIORITIES.map((p) => (
                  <td key={p} className="py-3.5 px-4 text-center">
                    {m.byPriority[p].length > 0 ? (
                      // INTERACTIVE PRIORITY BADGE: Clickable for detailed breakdown
                      <button
                        onClick={() =>
                          openBreakdown(m.name, p, m.byPriority[p])
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer ${PRIORITY_STYLES[p].badge}`}
                      >
                        {m.byPriority[p].length}
                        {/* CHEVRON INDICATOR: Shows interactivity */}
                        <HiChevronRight className="text-xs" />
                      </button>
                    ) : (
                      // EMPTY STATE: Visual indicator for zero completions
                      <span className="text-gray-300 dark:text-gray-600 text-sm">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BREAKDOWN PANEL SECTION
          DRILL-DOWN INTERFACE: Detailed task list for selected member/priority
          CONDITIONAL RENDERING: Only shown when breakdown data exists */}
      {breakdown && (
        <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          {/* BREAKDOWN HEADER: Member info, filter context, and close button */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            {/* BREAKDOWN CONTEXT: Member identification and filter information */}
            <div className="flex items-center gap-3">
              {/* MEMBER AVATAR: Consistent user identification */}
              <Avatar name={breakdown.name} />

              <div>
                {/* MEMBER NAME: Primary identifier */}
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {breakdown.name}
                </p>

                {/* FILTER CONTEXT: Shows current filter and task count */}
                <div className="flex items-center gap-2 mt-0.5">
                  {/* FILTER BADGE: Visual indicator of current filter */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      breakdown.label === "All"
                        ? "bg-[#0068B5]/10 text-[#0068B5]" // ALL TASKS: Brand color styling
                        : PRIORITY_STYLES[breakdown.label]?.badge ||
                          "bg-gray-100 text-gray-600" // PRIORITY SPECIFIC: Priority color styling
                    }`}
                  >
                    {breakdown.label === "All"
                      ? "All priorities"
                      : `${breakdown.label} priority`}
                  </span>

                  {/* TASK COUNT: Number of tasks in breakdown */}
                  <span className="text-xs text-gray-400">
                    {breakdown.list.length} task
                    {breakdown.list.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* CLOSE BUTTON: Dismiss breakdown panel */}
            <button
              onClick={() => setBreakdown(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <HiX />
            </button>
          </div>

          {/* TASK LIST: Grid of individual task cards with navigation links */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
            {breakdown.list.map((t) => (
              // TASK CARD: Individual task with navigation to detail view
              <Link
                key={t._id}
                to={`/task/${t._id}`} // NAVIGATION: Direct link to task detail page
                className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md hover:-translate-y-0.5 transition-all border border-gray-100 dark:border-gray-700 group"
              >
                {/* PRIORITY INDICATOR: Color-coded dot showing task priority */}
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_STYLES[t.priority]?.dot || "bg-gray-400"}`}
                />

                {/* TASK INFORMATION: Title, category, and completion date */}
                <div className="min-w-0 flex-1">
                  {/* TASK TITLE: Primary task identifier with hover effect */}
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate group-hover:text-[#0068B5] transition-colors">
                    {t.title}
                  </p>

                  {/* TASK METADATA: Category and completion date */}
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">
                    {CATEGORY_LABEL[t.category] || t.category} ·{" "}
                    {/* FORMATTED DATE: Localized date display */}
                    {new Date(t.updatedAt).toLocaleDateString("en-IE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* NAVIGATION INDICATOR: Chevron showing link interactivity */}
                <HiChevronRight className="text-gray-300 group-hover:text-[#0068B5] transition-colors shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletionsTable;

/**
 * COMPONENT USAGE & INTEGRATION NOTES:
 *
 * 1. DATA REQUIREMENTS:
 *    - Expects tasks array with completed tasks containing team, priority, updatedAt fields
 *    - Tasks should have populated team member objects with _id and name properties
 *    - Requires CATEGORY_LABEL utility for proper category display
 *
 * 2. PERFORMANCE CONSIDERATIONS:
 *    - Filters and processes tasks client-side - consider server-side filtering for large datasets
 *    - Date range changes trigger full re-calculation - could be optimized with memoization
 *    - Breakdown panel limits display to prevent UI performance issues
 *
 * 3. ACCESSIBILITY FEATURES:
 *    - Proper semantic HTML structure with table headers and labels
 *    - Color coding supplemented with text labels for colorblind users
 *    - Keyboard navigation support through standard HTML elements
 *
 * 4. RESPONSIVE DESIGN:
 *    - Horizontal scrolling for table on small screens
 *    - Responsive grid layout for breakdown task cards
 *    - Flexible header layout with wrapping controls
 *
 * 5. FUTURE ENHANCEMENTS:
 *    - Export functionality for analytics data
 *    - Comparison with previous periods
 *    - Team performance trends and charts
 *    - Configurable date range presets (last week, month, quarter)
 */
