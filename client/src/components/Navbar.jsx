import { useState, useEffect } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { HiMenuAlt2 } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { setOpenSidebar } from "../redux/slices/authSlice";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import UserAvatar from "./UserAvatar"

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    const newURL = `${location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    navigate(newURL, { replace: true });
  }, [searchTerm]);

  const pageName = location.pathname.split("/")[1];
  const displayName = pageName ? pageName.charAt(0).toUpperCase() + pageName.slice(1) : "Dashboard";

  return (
    <div className="flex hustify-between items-center bg-white border-b border-gray-100 px-5 py-3.5 sticky z-10 top-0 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(setOpenSidebar(true))}
          className="text-gray-500 hover:text-blue-600 block md:hidden p-1.5 rounded-lg hover:bg-blue-50"
        >
          <HiMenuAlt2 sixe={22} />
        </button>
        <div className="hidden md:block">
          <h1 className="text-lg font-bold text-gray-900 capitalize">{displayName}</h1>
          <p className="text-xs text-gray-400">Systems Group-Production Department</p>
        </div>
        {location.pathname !== "/dashboard" && (
          <div className="flex items-center gap-2 bg-gray-50 border border=gray-200 rounded-xl py-2 px-3.5 w-56 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <MdOutlineSearch className="text-gray-400 text-lg shrink-0" />
            <input
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
              type="text"
              placeholder="Search tasks..."
              className="flex-1 outline-none bg-transparent placeholder:text-gray-400 text-sm text-gray-800"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <NotificationPanel />
        <UserAvatar />
      </div>
    </div>
  );
};

export default Navbar;