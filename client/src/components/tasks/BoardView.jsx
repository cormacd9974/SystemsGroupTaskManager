import clsx from "clsx";
import TaskCard from "./TaskCard";

// Configuration for the board columns/groups.
// Each group contains:
// - key: unique identifier
// - label: display name
// - color/lightBg/border/text: styling classes
// - categories: task categories that belong to the group
// - subLabels: user-friendly labels for each category
const GROUPS = [
  {
    key: "reports",
    label: "Reports",
    color: "bg-blue-500",
    lightBg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    categories: ["report-created", "report-enhanced", "report-validated"],
    subLabels: {
      "report-created": "Created",
      "report-enhanced": "Enhanced",
      "report-validated": "Validated",
    },
  },
  {
    key: "configurations",
    label: "Configurations",
    color: "bg-violet-500",
    lightBg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    categories: ["config-new", "config-updated"],
    subLabels: {
      "config-new": "New",
      "config-updated": "Updated",
    },
  },
  {
    key: "projects",
    label: "Projects",
    color: "bg-emerald-500",
    lightBg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    categories: ["project-new"],
    subLabels: {
      "project-new": "New",
    },
  },
];

// Board view component that displays tasks grouped by category type
const BoardView = ({ tasks }) => {
  // If no tasks are provided, render nothing
  if (!tasks) return null;

  return (
    <div className="w-full py-4 grid grid-cols-1 md:grid-cols-3 gap-5 px-4 pb-6">
      {GROUPS.map(group => {
        // Filter tasks that belong to the current group based on category
        const groupTasks = tasks.filter(t => {
          const cat = t.category?.toLowerCase().trim();
          return group.categories.includes(cat);
        });

        return (
          <div key={group.key} className="flex flex-col gap-3">
            {/* Group header with colored indicator and total task count */}
            <div className={clsx(
              "flex items-center justify-between px-3 py-2 rounded-xl border",
              group.lightBg, group.border
            )}>
              <div className="flex items-center gap-2">
                <div className={clsx("w-2.5 h-2.5 rounded-full", group.color)} />
                <span className={clsx("text-sm font-semibold", group.text)}>
                  {group.label}
                </span>
              </div>
              <span className={clsx("badge text-xs border", group.lightBg, group.border, group.text)}>
                {groupTasks.length}
              </span>
            </div>

            {/* Sub-category count chips for the current group */}
            <div className="flex flex-wrap gap-1.5 px-1">
              {group.categories.map(cat => (
                <span key={cat} className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                  {group.subLabels[cat]}: {tasks.filter(t => t.category?.toLowerCase().trim() === cat).length}
                </span>
              ))}
            </div>

            {/* Task cards for the group, or empty state if none exist */}
            <div className="flex flex-col gap-3">
              {groupTasks.length > 0
                ? groupTasks.map((task, i) => <TaskCard task={task} key={i} />)
                : (
                  <div className="text-center py-8 text-sm text-gray-300 border border-dashed border-gray-200 rounded-xl">
                    No tasks
                  </div>
                )
              }
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Export the board view component
export default BoardView;
