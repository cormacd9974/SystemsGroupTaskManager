import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { getInitials } from "../utils";

export default function UserInfo({ user }) {
  return (
    <Popover className="relative">
        <PopoverButton className="outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full">
            <span className="sr-only">User menu</span>
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 text-gray-700">
                {getInitials(user.name)}
            </span>
        </PopoverButton>
        <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
        >
            <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-64 -translate-x-1/2 transform">
               <div className="flex items-center gap-3 rounded-xl shadow-lg bg-white p-4 border border-gray-100">
                <div className="w-12 h-12 bg-[#0068B5] rounded-xl text-white flex items-center justify-center font-bold">
                    {getInitials(user?.name)}
                </div>
                <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400">{user?.title}</p>
                </div>
               </div>
            </PopoverPanel>
        </Transition>
    </Popover>
  );
}