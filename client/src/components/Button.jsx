import clsx from "clsx"

// Reusable button component
// Accepts:
// - classname: extra Tailwind/CSS classes
// - label: button text
// - type: button type (defaults to "button")
// - onClick: click handler
// - icon: optional icon displayed before the label
const Button = ({ classname, label, type, onClick = () => {}, icon}) => (
    <button
        type={type || "button"}
        className={clsx(
            "px-4 py-2 outline-none rounded-xl font-medium text-sm transition-all duration-150",
            classname
        )}
        onClick={onClick}
        >
            {/* Render icon only if provided */}
            {icon&&icon}

            {/* Button label */}
            <span>{label}</span>
    </button>
);

// Export the Button component
export default Button;