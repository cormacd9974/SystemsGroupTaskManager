import clsx from "clsx";
import { MdDashboard, MdSettings } from "react-icons/md";
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import { IoMdBook } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setOpenSidebar } from "../redux/slices/authSlice";

const linkData = [
    { label: "Dashboard", link: "/dashboard", icon: <MdDashboard /> },
    { label: "Tasks", link: "/tasks", icon: <FaTasks /> },
    { label: "Team", link: "/team", icon: <FaUsers /> },
    { label: "History", link: "/history", icon: <IoMdBook /> },
    { label: "Trash", link: "/trashed", icon: <FaTrashAlt /> },
];

const Sidebar = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();
    const path = location.pathname.split("/")[1];
    const sidebarLinks = user?.isAdmin ? linkData : linkData.slice(0, 3);

    const closeSidebar = () => {
        dispatch(setOpenSidebar(false));
    };

    const NavLink = ({ el, onClose }) => {
        const location = useLocation();
            const path = location.pathname.split("/")[1];
        const isActive = path === el.link.split("/")[1];
        return (
            <Link
                to={el.link}
                onClick={onClose}
                className={clsx(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive ? "bg-white/15 text-white border-l-[3px] border-blue-400 pl-3.25"
                        : "text-blue-200 hover:bg-white/10 hover:text-white"
                )}
            >
                <span className={clsx("text-base", isActive ? "text-blue-400" : "text-blue-400/70")}>
                    {el.icon}
                </span>
                <span>{el.label}</span>
            </Link>
        );
    };

    {sidebarLinks.map(link => (
        <NavLink el={link} key={link.label} onClose={closeSidebar} />
    ))}

    return (
        <div className="w-full h-full flex flex-col sidebar-bg">
            <div className="px-5 py-6 border-b border-white/10">
                <span className="text-white font-bold text-lg leading-none">Systems Group</span>
                <p className="text-blue-300 text-xs mt-0.5">Production Department</p>
            </div>

            <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                <p className="text-blue-400/50 text-xs font-semibold uppercase tracking-widest px-4 mb-3">
                    Navigation
                </p>
                {sidebarLinks.map(link => (
                    <NavLink el={link} key={link.label} />
                ))}
            </div>

            <div className="px-3 py-4 border-t border-white/10">
                {user?.isAdmin && (
                <Link
                    to="/settings"
                    onClick={closeSidebar}
                    className={clsx(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                        path === "settings"
                            ? "bg-white/15 text-white border-l-[3px] border-blue-400 pl-3.25"
                            : "text-blue-300 hover:text-white hover:bg-white/10"
                    )}
                >
                    <MdSettings className="text-base" />
                    <span>Settings</span>
                </Link>
                )}      
                {user && (
                    <div
                        className="mt-3 px-4 py-3 rounded-xl flex items-center gap-3"
                        style={{ background: "rgba(255,255,255,0.07)" }}
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{user.name}</p>
                            <p className="text-blue-400/70 text-xs truncate">
                                {user.isAdmin ? "Admin" : "Member"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

export default Sidebar;