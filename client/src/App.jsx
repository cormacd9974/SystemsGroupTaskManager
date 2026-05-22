import { Toaster } from "sonner";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { setOpenSidebar } from "./redux/slices/authSlice";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux"
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { Dashboard, History, Login, TaskDetail, Tasks, Team, Trash, Users } from "./pages"

// Protected layout shown only when a user is logged in
function Layout() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // If user exists, render the main app layout
  // Otherwise redirect to login page
  return user ? (
    <div className='w-full h-screen flex flex-col md:flex-row overflow-hidden'>
      {/* Desktop sidebar */}
      <div className='w-64 h-screen shrink-0 hidden md:block sticky top-0'>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <MobileSidebar />

      {/* Main content area */}
      <div className='flex-1 flex flex-col overflow-hidden bg-gray-50'>
        <Navbar />
        <div className='flex-1 overflow-y-auto p-5 2xl:px-8'>
          <Outlet />
        </div>
      </div>
    </div>
  ) : <Navigate to="/log-in" state={{ from: location }} replace />;
}

// Mobile-only sidebar wrapper with backdrop and close button
const MobileSidebar = () => {
  const { isSidebarOpen } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const closeSidebar = () => dispatch(setOpenSidebar(false));

  // Don't render anything when sidebar is closed
  if (!isSidebarOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={closeSidebar}>
      {/* Stop click propagation so clicking inside sidebar doesn't close it */}
      <div className="w-72 h-full" onClick={e => e.stopPropagation()}>
        <Sidebar />
        <button onClick={closeSidebar} className="absolute top-4 right-4 text-white/70 hover:text-white p-1">
          <IoMdClose size={22} />
        </button>
      </div>
    </div>
  );
};

const App = () => {
  /*const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [darkMode]);*/

  return (
    <main className='w-full min-h-screen bg-gray-50'>
      {/* App routes */}
      <Routes>
        <Route element={<Layout />}>
          <Route index path='/' element={<Navigate to='/dashboard' />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/tasks' element={<Tasks />} />
          <Route path='/team' element={<Team />} />
          <Route path='/history' element={<History />} />
          <Route path='/trashed' element={<Trash />} />
          <Route path='/task/:id' element={<TaskDetail />} />
          <Route path='/settings' element={<Users />} />
        </Route>

        {/* Public login page */}
        <Route path="/log-in" element={<Login />} />
      </Routes>

      {/* Global toast notifications */}
      <Toaster richColors position="top-center" />
      
    </main>
  );
};

/*<button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white"
        style {...{ backgroundColor: "#0068B5" }}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>*/


export default App;
