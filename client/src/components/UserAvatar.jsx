import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FaUser, FaUserLock } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getInitials } from '../utils';
import { toast } from "sonner";
import { useLogoutMutation } from "../redux/slices/api/authApiSlice";
import ChangePassword from "./ChangePassword";
import AddUser from "./AddUser";
import { logout } from "../redux/slices/authSlice";

// User profile dropdown component shown in the navbar
const UserAvatar = () => {
    // Controls profile edit modal visibility
    const [open, setOpen] = useState(false);

    // Controls change password modal visibility
    const [openPassword, setOpenPassword] = useState(false);

    // Get current authenticated user from Redux store
    const { user } = useSelector((state) => state.auth);

    // Logout API mutation hook
    const [logoutUser] = useLogoutMutation();

    // Redux dispatch and React Router navigation
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Handles user logout
    const logoutHandler = async () => {
        try {
            await logoutUser().unwrap();
            dispatch(logout());
            navigate("/log-in");
        } catch (err) {
            toast.error(err?.data?.message || "Something went wrong");
        }   
    };

    return (
        <>
            <Menu as="div" className="relative inline-block text-left">
                {/* Dropdown trigger with avatar and basic user info */}
                <MenuButton className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                        {getInitials(user?.name)}
                    </div>
                    <div className="hidden md:block text-sm text-gray-700">
                        <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{user?.isAdmin ? "Admin" : "User"}</p>
                        </div>
                </MenuButton>

                {/* Dropdown transition */}
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"    
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 scale-95"
                >
                    <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 focus:outline-none z-50">
                        {/* User summary section */}
                        <div className="px-4 py-3 bg-blue-50 border-b border-gray-100">
                            <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>

                        {/* Profile-related actions */}
                        <div className="p-1.5">
                         <MenuItem>
                         {() => (
                            <button
                            onClick={() =>setOpen(true)}
                            className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 text-blue-700"
                            }
                            >
                            <FaUser className="text-xs" />
                            Edit Profile
                            </button>
                         )}
                        </MenuItem>

                        <MenuItem>
                         {() => (
                            <button
                            onClick={() =>setOpenPassword(true)}
                            className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 text-blue-700"}
                            >
                            <FaUserLock className="text-xs" />
                            Change Password
                            </button>
                         )}
                        </MenuItem>
                        </div>

                        {/* Logout action */}
                        <div>
                            <MenuItem>
                             <button
                             onClick={logoutHandler}
                            className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-700"}
                             >
                                <IoLogOutOutline />
                              Sign Out
                             </button>
                            </MenuItem>
                        </div>
                        </MenuItems>
                        </Transition>
                        </Menu>

                        {/* Edit profile modal */}
                        <AddUser open={open} setOpen={setOpen} userData={user} />

                        {/* Change password modal */}
                        <ChangePassword open={openPassword} setOpen={setOpenPassword} />
                        </>
    );
};

// Export the UserAvatar component
export default UserAvatar;