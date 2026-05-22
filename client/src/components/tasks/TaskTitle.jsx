import clsx from "clsx";

// Maps a stage color class to a matching soft background, text color, and border style
const STAGE_STYLES = {
    "bg-blue-600": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200"},
    "bg-amber-600": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200"},
    "bg-emerald-600": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200"},
};

// Reusable title/tag component used to display a task stage label with matching color styling
const TaskTitle = ({ label, className}) => {
    // Resolve the full style set based on the provided stage color class
    const s = STAGE_STYLES[className] || {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200"
    };

    return (
        <div className={clsx(
            "flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold",
            s.bg, s.text, s.border
        )}>
            {/* Colored dot indicator */}
            <div className={clsx("w-2 h-2 rounded-full", className)} />

            {/* Label text */}
            {label}
        </div>
    );
};

// Export the TaskTitle component
export default TaskTitle;