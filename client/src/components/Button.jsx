import clsx from "clsx"

const Button = ({ classname, label, type, onClick = () => {}, icon}) => (
    <button
        type={type || "button"}
        className={clsx(
            "px-4 py-2 outline-none rounded-xl font-medium text-sm transition-all duration-150",
            classname
        )}
        onClick={onClick}
        >
            {icon&&icon}
            <span>{label}</span>
    </button>
);

export default Button;