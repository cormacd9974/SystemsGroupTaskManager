// Utility for conditionally joining CSS class names
import clsx from "clsx";

/**
 * STAGE STYLING CONFIGURATION
 * 
 * Maps primary stage color classes to their corresponding soft UI styling.
 * This creates a consistent visual language where each stage has:
 * - A primary color for indicators (dots, badges)
 * - A soft background color for containers
 * - A matching text color for readability
 * - A subtle border color for definition
 * 
 * Color Psychology:
 * - Blue: Todo/Planning stage (calm, organized)
 * - Amber: In-progress stage (active, attention-getting)
 * - Emerald: Completed stage (success, achievement)
 */
const STAGE_STYLES = {
    // Blue theme for todo/planning stages
    "bg-blue-600": { 
        bg: "bg-blue-50",           // Light blue background
        text: "text-blue-700",      // Dark blue text for contrast
        border: "border-blue-200"   // Medium blue border
    },
    // Amber theme for in-progress stages
    "bg-amber-600": { 
        bg: "bg-amber-50",          // Light amber background
        text: "text-amber-700",     // Dark amber text
        border: "border-amber-200"  // Medium amber border
    },
    // Emerald theme for completed stages
    "bg-emerald-600": { 
        bg: "bg-emerald-50",        // Light emerald background
        text: "text-emerald-700",   // Dark emerald text
        border: "border-emerald-200" // Medium emerald border
    },
};

/**
 * TaskTitle Component
 * 
 * A reusable component that displays task stage labels with consistent visual styling.
 * It combines a colored indicator dot with text in a styled container that matches
 * the stage's color theme.
 * 
 * Features:
 * - Automatic color theme resolution based on stage
 * - Fallback styling for unknown stages
 * - Consistent spacing and typography
 * - Accessible color contrast ratios
 * - Flexible layout that adapts to content
 * 
 * Design Pattern:
 * This component follows the "indicator + label" pattern commonly used in
 * task management interfaces to provide quick visual recognition of status.
 * 
 * @param {string} label - The text to display (e.g., "To Do", "In Progress", "Completed")
 * @param {string} className - The primary color class that determines the theme (e.g., "bg-blue-600")
 */
const TaskTitle = ({ label, className}) => {
    /**
     * Resolve the complete style set based on the provided stage color class.
     * If the className doesn't match any predefined stage, fall back to neutral gray styling.
     * This ensures the component always renders with appropriate styling even for
     * unexpected or custom stage types.
     */
    const s = STAGE_STYLES[className] || {
        bg: "bg-gray-50",       // Neutral gray background for unknown stages
        text: "text-gray-700",  // Neutral gray text
        border: "border-gray-200" // Neutral gray border
    };

    return (
        // Main container with flexible layout and consistent styling
        <div className={clsx(
            // Base styling: flexible layout, padding, rounded corners, border, typography
            "flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold",
            // Dynamic styling based on resolved stage theme
            s.bg,     // Background color matching the stage
            s.text,   // Text color with proper contrast
            s.border  // Border color completing the theme
        )}>
            {/* Colored dot indicator */}
            {/* Small circular indicator that uses the primary stage color */}
            <div className={clsx("w-2 h-2 rounded-full", className)} />

            {/* Label text */}
            {/* The stage name or description text */}
            {label}
        </div>
    );
};

// Export the TaskTitle component for use throughout the application
export default TaskTitle;

/**
 * USAGE EXAMPLES:
 * 
 * // Todo stage with blue theme
 * <TaskTitle label="To Do" className="bg-blue-600" />
 * 
 * // In-progress stage with amber theme
 * <TaskTitle label="In Progress" className="bg-amber-600" />
 * 
 * // Completed stage with emerald theme
 * <TaskTitle label="Completed" className="bg-emerald-600" />
 * 
 * // Custom or unknown stage (falls back to gray)
 * <TaskTitle label="Custom Stage" className="bg-purple-600" />
 * 
 * COMPONENT BENEFITS:
 * - Consistent visual language across the application
 * - Automatic color coordination between indicators and containers
 * - Graceful handling of unexpected stage types
 * - Accessible color combinations with proper contrast
 * - Reusable across different contexts (headers, cards, lists)
 * - Easy to extend with new stage types by updating STAGE_STYLES
 */