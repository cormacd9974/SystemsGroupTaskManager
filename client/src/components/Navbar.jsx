import { useState, useEffect } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { HiMenuAlt2 } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { setOpenSidebar } from "../redux/slices/authSlice";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import NotificationPanel from "./NotificationPanel";
import UserAvatar from "./UserAvatar"

const Navbar = () => {
  const dispatch = useDispatch();// Access the dispatch function from Redux
  const navigate = useNavigate();// Access the navigate function from React Router
  const location = useLocation();// Access the current location object from React Router
  const [searchParams] = useSearchParams();// Access the search parameters from the URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");// State to hold the current search term, initialized from the URL search parameters
 // Effect to update the URL search parameters whenever the search term changes
  useEffect(() => {
    const params = new URLSearchParams();// Create a new URLSearchParams object to build the query string
    if (searchTerm) params.set("search", searchTerm);// If there is a search term, set it in the URL search parameters
    const newURL = `${location.pathname}${params.toString() ? "?" + params.toString() : ""}`;// Construct the new URL with the current pathname and the updated search parameters
    navigate(newURL, { replace: true });// Navigate to the new URL, replacing the current entry in the history stack to avoid creating a new entry for each search term change
  }, [searchTerm]);// Dependency array for the effect, ensuring it runs whenever the search term changes

  const pageName = location.pathname.split("/")[1];// Extract the page name from the current pathname by splitting it and taking the second segment
  const displayName = pageName ? pageName.charAt(0).toUpperCase() + pageName.slice(1) : "Dashboard";// Format the page name for display by capitalizing the first letter and concatenating it with the rest of the string, or default to "Dashboard" if there is no page name
  // The return statement defines the JSX structure of the navbar, including conditional rendering for the search input and responsive design elements
  return (
    // Main container for the navbar, styled with Tailwind CSS classes for layout, background, borders, padding, and shadow
    <div className="flex justify-between items-center bg-white border-b border-gray-100 px-5 py-3.5 sticky z-10 top-0 shadow-sm">
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
//
export default Navbar;
// This component defines a responsive navigation bar that includes a menu button for smaller screens, a page title,
// a search input for non-dashboard pages, and user-related components such as notifications and avatar. 
// It uses React hooks for state management and side effects, and integrates with Redux for global state management 
// and React Router for navigation.