// Icon imports for visual indicators in the task metadata
import { BiMessageAltDetail } from "react-icons/bi"; // Message/comment icon
import { FaList } from "react-icons/fa"; // List icon for sub-tasks
import { MdAttachFile } from "react-icons/md"; // Attachment/file icon

// Utility function to calculate completed sub-tasks from sub-tasks array
import { getCompletedSubTasks } from "../../utils";

/**
 * TaskAssets Component
 *
 * A compact metadata display component that shows key task statistics at a glance.
 * This component provides users with quick visual indicators of task engagement,
 * resources, and progress without needing to open the full task details.
 *
 * The component displays three key metrics:
 * 1. Activities/Comments - Shows level of discussion and collaboration
 * 2. Attachments - Indicates supporting files and resources
 * 3. Sub-task Progress - Shows completion status of sub-tasks
 *
 * Design Philosophy:
 * - Minimal visual footprint to avoid cluttering task cards
 * - Consistent icon-text pairing for easy recognition
 * - Muted colors to serve as supporting information rather than primary content
 * - Horizontal layout for efficient space usage
 *
 * @param {number} activities - Total number of activities/comments on the task
 * @param {number} assets - Total number of file attachments on the task
 * @param {Array} subTasks - Array of sub-task objects for progress calculation
 */
const TaskAssets = ({ activities, assets, subTasks }) => (
  // Main container with horizontal layout and consistent spacing
  <div className="flex items-center gap-3">
    {/* ACTIVITIES/COMMENTS INDICATOR */}
    {/* Shows the total number of comments, discussions, or activity entries */}
    <div className="flex gap-1 items-center text-xs text-gray-500">
      {/* Message icon to represent comments/discussions */}
      <BiMessageAltDetail />
      {/* Display the count of activities */}
      <span>{activities}</span>
    </div>

    {/* ATTACHMENTS INDICATOR */}
    {/* Shows the total number of files attached to the task */}
    <div className="flex gap-1 items-center text-xs text-gray-500">
      {/* Paperclip/attachment icon to represent files */}
      <MdAttachFile />
      {/* Display the count of attached files */}
      <span>{assets}</span>
    </div>

    {/* SUB-TASKS PROGRESS INDICATOR */}
    {/* Shows completed sub-tasks vs total sub-tasks (e.g., "3/5") */}
    <div className="flex gap-1 items-center text-xs text-gray-500">
      {/* List icon to represent sub-tasks/checklist items */}
      <FaList />
      {/*
       * Display progress as "completed/total" format
       * - getCompletedSubTasks() calculates how many sub-tasks are done
       * - subTasks?.length provides total count (with optional chaining for safety)
       * - Results in display like "2/5" meaning 2 out of 5 sub-tasks completed
       */}
      <span>
        {getCompletedSubTasks(subTasks)}/{subTasks?.length}
      </span>
    </div>
  </div>
);

// Export the component for use in task cards and other task-related UI elements
export default TaskAssets;

/**
 * COMPONENT SUMMARY
 *
 * TaskAssets is a lightweight metadata component designed to provide quick insights
 * into task engagement and progress. It's typically used within task cards to give
 * users immediate context about task activity without requiring interaction.
 *
 * KEY FEATURES:
 * - Compact horizontal layout optimized for small spaces
 * - Icon-based visual language for quick recognition
 * - Real-time progress tracking for sub-tasks
 * - Consistent styling with muted colors to avoid visual competition
 * - Safe handling of undefined/null data with optional chaining
 *
 * VISUAL DESIGN:
 * - Uses small (text-xs) font size to minimize space usage
 * - Gray color scheme (text-gray-500) for subtle, non-intrusive display
 * - Consistent gap spacing (gap-1 within items, gap-3 between items)
 * - Icons paired with numbers for clear meaning
 *
 * DATA EXPECTATIONS:
 * - activities: Should be a number representing total activity count
 * - assets: Should be a number representing total attachment count
 * - subTasks: Should be an array of sub-task objects (can be null/undefined)
 *
 * USAGE CONTEXTS:
 * - Task cards in board/list views
 * - Task preview components
 * - Dashboard task summaries
 * - Any UI element requiring compact task metadata
 *
 * USAGE EXAMPLE:
 * ```jsx
 * <TaskAssets
 *   activities={12}           // 12 comments/activities
 *   assets={3}               // 3 attached files
 *   subTasks={[              // Array of sub-task objects
 *     { completed: true, title: "Research" },
 *     { completed: false, title: "Implementation" },
 *     { completed: true, title: "Testing" }
 *   ]}
 * />
 * // Would display: [💬 12] [📎 3] [📋 2/3]
 * ```
 *
 * ACCESSIBILITY CONSIDERATIONS:
 * - Icons provide visual context but should be supplemented with tooltips for screen readers
 * - Numbers provide concrete information that's accessible to all users
 * - Consider adding aria-labels for better screen reader support
 *
 * PERFORMANCE NOTES:
 * - Lightweight component with minimal rendering overhead
 * - getCompletedSubTasks() is called on every render - consider memoization for large sub-task arrays
 * - No internal state or effects, making it highly performant
 *
 * EXTENSIBILITY:
 * - Additional metadata indicators can be easily added following the same pattern
 * - Icon and styling can be customized through props if needed
 * - Could be enhanced with click handlers to show detailed breakdowns
 */
