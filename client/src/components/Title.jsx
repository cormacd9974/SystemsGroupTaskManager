import clsx from "clsx"

const Title = ({ title, className }) => (
    <h2 className={clsx("text-xl font-bold text-gray-900 capitalize", className)}>
     {title}
    </h2>
);

export default Title;