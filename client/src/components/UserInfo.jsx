import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { getInitials } from "../utils";

// UserInfo component displays a clickable user avatar
// and reveals a small profile panel when opened.
export default function UserInfo({ user }) {
  return (
    // Popover creates an accessible dropdown-style menu
    <Popover className="relative">
        {/* Button that toggles the popover open/closed */}
        <PopoverButton className="outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 rounded-full">
            {/* Screen-reader only label for accessibility */}
            <span className="sr-only">User menu</span>

            {/* Circular avatar showing the user's initials */}
            <span className="inline-flex items-center justify-center h-full w-full rounded-full text-white text-xs font-bold tracking-white">
                {getInitials(user.name)}
            </span>
        </PopoverButton>

        {/* Transition controls the animation when the panel appears/disappears */}
        <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
        >
            {/* PopoverPanel contains the user details dropdown */}
            <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-80 -translate-x-1/2 transform">
               {/* Card-style container for the user information */}
               <div className="flex items-center gap-3 rounded-xl shadow-lg bg-white p-4 border border-gray-100">
                {/* Larger avatar shown inside the dropdown */}
                <div className="w-12 h-12 bg-[#0068B5] rounded-xl text-white flex items-center justify-center font-bold shrink-0">
                    {getInitials(user?.name)}
                </div>

                {/* User text details */}
                <div className="miw-w-0 overflow-hidden">
                    {/* User's name */}
                    <p className="font-medium text-gray-900 text-sm truncate">{user?.name}</p>

                    {/* User's email */}
                    <p className="text-sm text-gray-500 truncate max-w-50">{user?.email}</p>

                    {/* User's title/role */}
                    <p className="text-xs text-gray-400 truncate">{user?.title}</p>
                </div>
               </div>
            </PopoverPanel>
        </Transition>
    </Popover>
  );
}