import clsx from "clsx";

// Small reusable component for rendering a colored circular indicator.
// The incoming className is merged with the default size and shape styles.
const TaskColor = ({ className }) => (
    <div className={clsx("w-4 h-4 rounded-full", className)} />
);

// Export the TaskColor component
export default TaskColor;