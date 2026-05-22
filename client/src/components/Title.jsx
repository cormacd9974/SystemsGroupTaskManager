import clsx from "clsx"

// Reusable heading component for section/page titles
const Title = ({ title, className }) => (
    <h2 className={clsx("text-xl font-bold text-gray-900 capitalize", className)}>
     {title}
    </h2>
);

// Export the Title component
export default Title;