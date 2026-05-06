import clsx from "clsx";

const TaskColor = ({ className }) => (
    <div className={clsx("w-4 h-4 rounded-full", className)} />
);

export default TaskColor;