import { useEffect, useRef, useState } from "react";
import { MdCheck, MdKeyboardArrowDown } from "react-icons/md";

const SelectList = ({ lists, selected, setSelected, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-full cursor-default rounded-xl bg-white pl-3.5 pr-10 py-2.5 text-left border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
                >
                    <span className="block truncate text-gray-800">{selected}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <MdKeyboardArrowDown className="h-4 w-4 text-gray-400" />
                    </span>
                </button>

                {isOpen && (
                    <div
                        className="absolute z-9999 mt-1 w-full rounded-xl bg-white py-1 text-sm shadow-xl border border-gray-200"
                        style={{ zIndex: 9999 }}
                    >
                        {lists.map((list, i) => (
                            <div
                                key={i}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelected(list);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-blue-50 ${selected === list ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                                    }`}
                            >
                                <span>{list}</span>
                                {selected === list && <MdCheck className="h-4 w-4 text-blue-600" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectList;

