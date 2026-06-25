// Utility for conditionally joining CSS class names
import clsx from "clsx";
// Individual task card component for rendering tasks within each group
import TaskCard from "./TaskCard";

/**
 * BOARD CONFIGURATION
 *
 * Defines the structure and styling for each task category group in the board view.
 * This configuration drives the entire board layout and determines how tasks are
 * organized and displayed visually.
 *
 * Each group object contains:
 * - key: Unique identifier for React keys and internal logic
 * - label: Human-readable display name shown in the UI
 * - color: Primary color class for the group indicator dot
 * - lightBg: Light background color for headers and badges
 * - border: Border color class for consistent theming
 * - text: Text color class for labels and counts
 * - categories: Array of task category values that belong to this group
 * - subLabels: User-friendly display names for each category
 */
const GROUPS = [
  {
    key: "reports",
    label: "Reports",
    // Blue color scheme for report-related tasks
    color: "bg-blue-500", // Solid blue for indicator dot
    lightBg: "bg-blue-50", // Light blue background
    border: "border-blue-200", // Blue border color
    text: "text-blue-700", // Dark blue text
    // Task categories that belong to the Reports group
    categories: ["report-created", "report-enhanced", "report-validated"],
    // User-friendly labels for each report category
    subLabels: {
      "report-created": "Created", // New reports
      "report-enhanced": "Enhanced", // Improved reports
      "report-validated": "Validated", // Verified reports
    },
  },
  {
    key: "configurations",
    label: "Configurations",
    // Violet color scheme for configuration-related tasks
    color: "bg-violet-500",
    lightBg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    // Task categories for configuration work
    categories: ["config-new", "config-updated"],
    subLabels: {
      "config-new": "New", // New configuration setups
      "config-updated": "Updated", // Configuration modifications
    },
  },
  {
    key: "projects",
    label: "Projects",
    // Emerald color scheme for project-related tasks
    color: "bg-emerald-500",
    lightBg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    // Project categories (currently only new projects)
    categories: ["project-new"],
    subLabels: {
      "project-new": "New", // New project initiatives
    },
  },
  {
    key: "other",
    label: "Other",
    // Gray color scheme for miscellaneous tasks
    color: "bg-gray-400",
    lightBg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-600",
    // Catch-all category for tasks that don't fit elsewhere
    categories: ["other"],
    subLabels: {
      other: "Other", // Generic tasks
    },
  },
];

/**
 * BoardView Component
 *
 * Renders a Kanban-style board that organizes tasks into category-based columns.
 * Each column represents a different type of work (Reports, Configurations, Projects, Other)
 * and displays tasks that belong to those categories.
 *
 * Features:
 * - Responsive grid layout (2 columns on small screens, 4 on extra large)
 * - Color-coded groups with consistent theming
 * - Task count indicators for each group and sub-category
 * - Empty state handling when no tasks exist
 * - Sub-category breakdown showing distribution within each group
 *
 * @param {Array} tasks - Array of task objects to be displayed on the board
 * @param {string} tasks[].category - Task category used for grouping
 * @param {string} tasks[]._id - Unique task identifier
 * @param {string} tasks[].title - Task title
 * @param {Object} tasks[].team - Assigned team members
 * @param {string} tasks[].priority - Task priority level
 * @param {string} tasks[].stage - Current task stage
 */
const BoardView = ({ tasks }) => {
  // Early return if no tasks are provided to prevent rendering errors
  if (!tasks) return null;

  return (
    // Main board container with responsive grid layout
    <div className="w-full py-4 grid sm:grid-cols-2 xl:grid-cols-4 gap-4 px-4 pb-6">
      {/* Iterate through each group configuration to create columns */}
      {GROUPS.map((group) => {
        /**
         * Filter tasks that belong to the current group
         *
         * This filtering logic:
         * 1. Gets the task's category and normalizes it (lowercase, trimmed)
         * 2. Checks if the normalized category exists in the group's categories array
         * 3. Returns only tasks that match the current group's categories
         */
        const groupTasks = tasks.filter((t) => {
          const cat = t.category?.toLowerCase().trim();
          return group.categories.includes(cat);
        });

        return (
          // Individual group column container
          <div key={group.key} className="flex flex-col gap-3">
            {/* GROUP HEADER */}
            {/* Contains group name, color indicator, and total task count */}
            <div
              className={clsx(
                "flex items-center justify-between px-3 py-2 rounded-xl border",
                group.lightBg, // Light background color specific to group
                group.border, // Border color specific to group
              )}
            >
              {/* Left side: Color indicator and group name */}
              <div className="flex items-center gap-2">
                {/* Colored dot indicator for visual group identification */}
                <div
                  className={clsx("w-2.5 h-2.5 rounded-full", group.color)}
                />

                {/* Group label with themed text color */}
                <span className={clsx("text-sm font-semibold", group.text)}>
                  {group.label}
                </span>
              </div>

              {/* Right side: Total task count badge */}
              <span
                className={clsx(
                  "badge text-xs border",
                  group.lightBg, // Background matches group theme
                  group.border, // Border matches group theme
                  group.text, // Text color matches group theme
                )}
              >
                {groupTasks.length}
              </span>
            </div>

            {/* SUB-CATEGORY BREAKDOWN */}
            {/* Shows count of tasks for each sub-category within the group */}
            <div className="flex flex-wrap gap-1.5 px-1">
              {group.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full"
                >
                  {/* Display user-friendly label and count for this sub-category */}
                  {group.subLabels[cat]}:{" "}
                  {
                    tasks.filter(
                      (t) => t.category?.toLowerCase().trim() === cat,
                    ).length
                  }
                </span>
              ))}
            </div>

            {/* TASK CARDS SECTION */}
            {/* Renders individual task cards or empty state */}
            <div className="flex flex-col gap-3">
              {groupTasks.length > 0 ? (
                // Render task cards when tasks exist in this group
                groupTasks.map((task) => (
                  <TaskCard
                    task={task}
                    key={task._id} // Using index as key (consider using task._id for better performance)
                  />
                ))
              ) : (
                // Empty state when no tasks exist in this group
                <div className="text-center py-8 text-sm text-gray-300 border border-dashed border-gray-200 rounded-xl">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Export the component for use in other parts of the application
export default BoardView;

/**
 * COMPONENT SUMMARY
 *
 * The BoardView component creates a visual task management board similar to Trello or Jira.
 * It automatically organizes tasks into predefined categories and provides visual feedback
 * about task distribution and workload.
 *
 * KEY FEATURES:
 * - Automatic task categorization based on task.category field
 * - Color-coded groups for easy visual distinction
 * - Responsive design that adapts to different screen sizes
 * - Real-time task count indicators at group and sub-category levels
 * - Empty state handling for groups with no tasks
 * - Consistent theming across all groups
 *
 * RESPONSIVE BEHAVIOR:
 * - Mobile/Small screens: 2 columns side by side
 * - Large screens: 4 columns (one for each group)
 * - Maintains readability and usability across all screen sizes
 *
 * DATA REQUIREMENTS:
 * - Expects an array of task objects with at least a 'category' field
 * - Task categories should match the values defined in GROUPS configuration
 * - Handles missing or undefined task data gracefully
 *
 * STYLING APPROACH:
 * - Uses Tailwind CSS for consistent styling
 * - clsx utility for conditional class application
 * - Color schemes defined in GROUPS configuration for easy theming
 * - Maintains visual hierarchy with proper spacing and typography
 *
 * USAGE EXAMPLE:
 * ```jsx
 * const tasks = [
 *   { _id: '1', category: 'report-created', title: 'Monthly Report' },
 *   { _id: '2', category: 'config-new', title: 'Setup Database' }
 * ];
 *
 * <BoardView tasks={tasks} />
 * ```
 *
 * PERFORMANCE CONSIDERATIONS:
 * - Filters tasks multiple times (once per group, once per sub-category)
 * - Consider memoizing filtered results for large task arrays
 * - Using array index as React key - consider using task._id for better performance
 *
 * EXTENSIBILITY:
 * - New task categories can be added by updating the GROUPS configuration
 * - Color schemes can be easily modified in the GROUPS array
 * - Additional group metadata can be added to support new features
 */
