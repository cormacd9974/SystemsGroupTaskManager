import { useEffect, useRef, useState } from "react";
import { MdCheck, MdKeyboardArrowDown } from "react-icons/md";
import { useGetTeamListsQuery } from "../../redux/slices/api/userApiSlice";
import { getInitials } from "../../utils";

// Multi-select dropdown component used to assign task team members
export default function UserList({ team, setTeam }) {
    // Fetch available team members from the API
    const { data, isLoading } = useGetTeamListsQuery({ search: "" });

    // Stores the full selected user objects for display
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Controls dropdown open/close state
    const [isOpen, setIsOpen] = useState(false);

    // Ref used to detect clicks outside the dropdown
    const dropdownRef = useRef(null);

    // Prevents the default user initialization from happening more than once
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (isLoading) return;
        if (!data || data.length === 0) return;
        if (hasInitialized.current) return;

        hasInitialized.current = true;

        // If no team is preselected, automatically select the first user
        if(!team || team.length < 1) {
           setTimeout(() => {
            setSelectedUsers([data[0]]);
            setTeam([data[0]._id]);
           }, 0);
            
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            // Close dropdown when user clicks outside of it
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Add or remove a user from the current selection
    const toggleUser = (user) => {
        const isSelected = selectedUsers.some(u => u._id === user._id);
        let updated;

        if (isSelected) {
            updated = selectedUsers.filter(u => u._id !== user._id);
        } else {
            updated = [...selectedUsers, user];
        }

        // Update local selected user objects
        setSelectedUsers(updated);

        // Send only selected user IDs back to the parent component
        setTeam(updated.map(u => u._id));
    };

    return (
        <div className="w-full" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Assign To
            </label>

            <div className="relative">
                {/* Dropdown trigger button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-full cursor-default rounded-xl bg-white pl-3.5 pr-10 py-2.5 text-left border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
                >
                    <span className="block truncate">
                        {selectedUsers.length > 0
                            ? selectedUsers.map(u => u.name).join(", ")
                            : "Select team members"}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <MdKeyboardArrowDown className="h-4 w-4 text-gray-400" />
                    </span>
                </button>

                {/* Dropdown list of users */}
                {isOpen && (
                    <div className="absolute z-9999 mt-1 w-full rounded-xl bg-white py-1 text-sm shadow-xl border border-gray-200"
                        style={{ zIndex: 9999 }}>
                        {data?.map((user, i) => {
                            const isSelected = selectedUsers.some(u => u._id === user._id);

                            return (
                                <div
                                    key={i}
                                    onMouseDown={(e) => {
                                        // Use onMouseDown to avoid losing focus before selection is processed
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleUser(user);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-blue-50 ${isSelected ? "bg-blue-50" : ""}`}
                                >
                                    {/* User initials avatar */}
                                    <div className="w-6 h-6 rounded-full bg-[#0068B5] text-white flex items-center justify-center text-xs shrink-0">
                                        {getInitials(user.name)}
                                    </div>

                                    {/* User name */}
                                    <span className={isSelected ? "font-semibold text-blue-700" : "text-gray-700"}>
                                        {user.name}
                                    </span>

                                    {/* Checkmark shown when selected */}
                                    {isSelected && (
                                        <MdCheck className="ml-auto text-blue-600 h-4 w-4" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}