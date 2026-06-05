// External library imports for styling and utility functions
import clsx from "clsx"; // Utility for conditionally joining CSS class names

// Internal imports for API integration, components, and utilities
import { useGetDashboardStatsQuery } from "../redux/slices/api/taskApiSlice"; // RTK Query hook for team data
import { Loading, Title } from "../components"; // Reusable UI components
import { getInitials, CATEGORY_LABEL } from "../utils"; // Utility functions and constants
import { Link } from "react-router-dom"; // React Router for navigation

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
 * Stage badge styling configuration
 * Provides visual differentiation for task workflow states
 * Color coding aligns with common workflow visualization patterns
 */
const STAGE_BADGE = {
  todo: "bg-gray-100 text-gray-600 border-gray-200", // To-do: Neutral gray for pending tasks
  "in-progress": "bg-amber-50 text-amber-700 border-amber-200", // In-progress: Amber for active work
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200", // Completed: Green for finished tasks
};

/**
 * Team Component - Displays team members and their current workload
 *
 * @component
 *
 * Architecture decisions:
 * - Reuses dashboard API endpoint for team data to leverage existing caching
 * - Card-based layout for individual team member workload display
 * - Responsive grid layout adapting from single to dual columns
 * - Empty state handling for teams with no active work
 *
 * UX considerations:
 * - Visual hierarchy from team member info to individual tasks
 * - Color-coded priority and stage indicators for quick scanning
 * - Hover effects on clickable tasks for clear interactivity
 * - Active task count badges for immediate workload awareness
 * - Empty states with friendly messaging when no work is active
 *
 * Business context:
 * - Provides team managers with workload visibility
 * - Enables quick identification of team member capacity
 * - Supports workload balancing and task redistribution decisions
 * - Facilitates team coordination and collaboration
 *
 * @returns {JSX.Element} Team workload overview with individual member cards
 */
const Team = () => {
  /**
   * Data fetching for team workload information
   * Reuses dashboard stats query for efficiency and consistency
   * RTK Query provides caching and automatic updates
   */

  // Fetch dashboard data to get team workload/status information
  // Design decision: Reuses existing API endpoint to avoid duplicate data fetching
  const { data, isLoading } = useGetDashboardStatsQuery();

  /**
   * Loading state handling
   * Provides user feedback during data fetching operations
   */
  if (isLoading)
    return (
      <div className="py-16 flex justify-center">
        <Loading />
      </div>
    );

  /**
   * Data processing and safe access
   * Defensive programming to handle undefined API responses
   */

  // Extract team status data with fallback to empty array
  // Each team member includes their in-progress tasks for workload visualization
  const teamStatus = data?.teamStatus || [];

  return (
    <div className="space-y-4">
      {/* Page header with title and description */}
      {/* Provides context about what information is being displayed */}
      <div>
        <Title title="Team" />
        <p className="text-sm text-gray-400 mt-0.5">All in-progress tasks</p>
      </div>

      {/* Conditional rendering: Empty state vs team member cards */}
      {teamStatus.length === 0 ? (
        // Empty state when no team data is available
        // UX: Friendly message instead of blank screen
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center gap-3">
          <p className="text-gray-400 font-medium">No data available</p>
        </div>
      ) : (
        // Team member grid layout
        // Responsive design: Single column on mobile, dual columns on large screens
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {teamStatus.map((member, i) => (
            // Individual team member card
            // Design: Card-based layout with header and task list sections
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Team member header with avatar, info, and task count */}
              {/* Visual hierarchy: Avatar, name/title, and active task indicator */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                {/* Team member avatar with initials */}
                {/* Consistent styling: Uses brand blue background for all avatars */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: "#0068B5" }}
                >
                  {getInitials(member.name)}
                </div>

                {/* Team member information */}
                {/* Layout: Flexible container to handle varying name/title lengths */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-400">{member.title}</p>
                </div>

                {/* Active task count badge */}
                {/* Color coding: Amber for active tasks, gray for no active work */}
                <span
                  className={clsx(
                    "badge text-xs",
                    member.inProgressTasks?.length > 0
                      ? "bg-amber-50 text-amber-700 border border-amber-200" // Active tasks: Amber theme
                      : "bg-gray-50 text-gray-400 border border-gray-200", // No active tasks: Muted gray
                  )}
                >
                  {member.inProgressTasks?.length || 0} active
                </span>
              </div>

              {/* Conditional rendering: Task list or empty state */}
              {member.inProgressTasks?.length > 0 ? (
                // Task list for team members with active work
                // Design: Divided list with hover effects for interactivity
                <div className="divide-y divide-gray-50">
                  {member.inProgressTasks.map((task, j) => (
                    // Individual task item with navigation
                    // UX: Entire row is clickable for better usability
                    <Link
                      to={`/task/${task._id}`} // Navigate to task detail page
                      key={j}
                      className="flex items-start justify-between px-5 py-3 hover:bg-blue-50/50 transition-colors group"
                    >
                      {/* Task information section */}
                      <div className="flex-1 min-w-0 mr-3">
                        {/* Task title with hover effect */}
                        {/* UX: Color change on hover indicates clickability */}
                        <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 truncate">
                          {task.title}
                        </p>

                        {/* Task metadata badges */}
                        {/* Layout: Flexible wrap to handle varying badge combinations */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {/* Category badge - conditional rendering */}
                          {/* Business context: Shows task categorization when available */}
                          {task.category && (
                            <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                              {CATEGORY_LABEL[task.category]}
                            </span>
                          )}

                          {/* Stage badge with semantic coloring */}
                          {/* Workflow visualization: Shows current task state */}
                          <span
                            className={clsx(
                              "badge text-xs border",
                              STAGE_BADGE[task.stage],
                            )}
                          >
                            {task.stage}
                          </span>
                        </div>
                      </div>

                      {/* Priority badge positioned on the right */}
                      {/* Visual balance: Priority information easily scannable */}
                      <span
                        className={clsx(
                          "badge text-xs border shrink-0 mt-0.5",
                          PRIORITY_BADGE[task.priority],
                        )}
                      >
                        {task.priority}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                // Empty state for team members with no active tasks
                // UX: Clear messaging about current workload status
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-gray-300">No task in-progress</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Export the Team component as default export
 *
 * Component Summary:
 * - Team workload overview displaying each member's active tasks
 * - Card-based layout with responsive grid for optimal space usage
 * - Color-coded priority and stage indicators for quick information scanning
 * - Interactive task links for detailed task management
 * - Empty state handling for teams with no active work
 *
 * Key Features:
 * - Individual team member cards with avatar and basic information
 * - Active task count badges with semantic color coding
 * - Clickable task items linking to detailed task views
 * - Priority and stage visualization through consistent badge styling
 * - Category labels for additional task context
 * - Responsive design adapting from mobile to desktop layouts
 * - Hover effects indicating interactive elements
 *
 * Data Integration:
 * - Reuses dashboard API endpoint for efficient data fetching
 * - RTK Query provides caching and automatic updates
 * - Safe data access patterns with fallback handling
 * - Consistent data structure expectations across components
 *
 * UX Design Principles:
 * - Clear visual hierarchy from team member to individual tasks
 * - Consistent color coding for priority and stage information
 * - Interactive feedback through hover states and transitions
 * - Empty states provide context when no data is available
 * - Responsive grid layout optimizes space usage across devices
 *
 * Business Value:
 * - Provides managers with immediate team workload visibility
 * - Enables quick identification of team member capacity
 * - Supports workload balancing and task redistribution decisions
 * - Facilitates team coordination through shared workload awareness
 * - Helps identify potential bottlenecks or overallocation
 *
 * Architecture Patterns:
 * - Reuses existing API endpoints for data efficiency
 * - Component composition with reusable UI elements
 * - Conditional rendering for different data states
 * - Responsive design patterns for cross-device compatibility
 * - Consistent styling patterns with application design system
 *
 * Performance Considerations:
 * - Leverages RTK Query caching for efficient data management
 * - Conditional rendering minimizes DOM complexity
 * - Efficient list rendering with proper key usage
 * - Hover effects use CSS transitions for smooth performance
 */
export default Team;
