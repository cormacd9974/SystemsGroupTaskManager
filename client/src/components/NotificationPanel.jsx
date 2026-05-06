import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import moment from "moment";
import { BiSolidMessageRounded } from "react-icons/bi";
import { HiBellAlert } from "react-icons/hi2";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useGetNotificationsQuery, useMarkNotiAsReadMutation } from "../redux/slices/api/userApiSlice";
import ViewNotification from "./ViewNotification";

const ICONS = {
    alert: <HiBellAlert className="h-4 w-4 text-blue-600" />,
    message: <BiSolidMessageRounded className="h-4 w-4 text-blue-600" />,
};

export default function NotificationPanel() {
    const [markAsRead] = useMarkNotiAsReadMutation();
    const { data, refetch } = useGetNotificationsQuery();
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);

    return (
        <>
        <Popover className="relative">
            <PopoverButton className="relative w-9 h-9 flex items-center justify-center 
            rounded-xl hover:bg-gray-100 overflow-hidden">
                <IoIosNotificationsOutline className="h-5 w-5 text-gray-600" />
                {data?.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {data.length > 9 ? "9+" : data.length}
                    </span>
                )}  
            </PopoverButton>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveto="opacity-0"
            >
                <PopoverPanel className="absolute right-0 z-10 mt-2w-80">
                    {({ close }) => (
                        data?.length > 0 ? (
                            <div className="bg-white rounded 2xl shadow-lg border border-gray-100">
                                <div className="px-4 py-3 border-b border-gray-500">
                                    <p className="text-sm font-bold text-gray-900">Notifications</p>
                                    <p className="text-xs text-gray-400">{data.length} unread</p>
                                </div>

                                <div className="max-h-64 overflow-y-auto">
                                    {data.slice(0, 5).map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0"
                                        onClick={() => { setSelected(item); setOpen(true); }}
                                    >  
                                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                        {ICONS[item.notiType]} 
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-semibold text-gray-900 capitalize">{item.notiType}</p>
                                                <span className="text-xs text-gray-400">{moment (item.createdAt).fromNow()}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.text}</p>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            

                            <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-50">
                                <button
                                onClick ={() => {markAsRead({type: "all", id: null}); refetch(); close();}}
                                className="py-3 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                >
                                Mark all read
                                </button>
                                <button
                                onClick ={() => {close();}}
                                className="py-3 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                >
                                Close
                                </button>

                            </div>
                        </div>
                        ) : (
                            <div className="bg-white rounded 2xl shadow-lg border border-gray-100 p-6 text-center">
                                <p className="flex flex-col text-sm items-center gap-2"></p>
                            </div>
                        )
                    )}
                </PopoverPanel>
            </Transition>
        </Popover>

        <ViewNotification open={open} setOpen={setOpen} el={selected}/>
        </>
    );
    
}