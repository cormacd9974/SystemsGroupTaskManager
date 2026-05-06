import { Toaster } from "sonner";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { setOpenSidebar } from "./redux/slices/authSlice";
import { Transition } from "@headlessui/react";
import { Fragment } from "react";
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

function Layout() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  return user ? (
    <div className='w-full h-screen flex flex-col md:flex-row overflow-hidden'>
      <div className='w-64 h-screen shrink-0 hidden md:block sticky top-0'>
        <Sidebar />
      </div>
      <MobileSidebar />
      <div className='flex-1 flex flex-col overflow-hidden bg-gray-50'>
        <Navbar />
        <div className='flex-1 overflow-y-auto p-5 2xl:px-8'>
          <Outlet />
        </div>
      </div>
    </div>
  ) : <Navigate to="/log-in" state={{ from: location }} replace />;
}

const MobileSidebar = () => {
  const { isSidebarOpen } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const closeSidebar = () => dispatch(setOpenSidebar(false));

  return (
    <>
      <Transition
        show={isSidebarOpen}
        as={Fragment}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={closeSidebar}>
          <div className="w-72 h-full" onClick={e => e.stopPropagation()}>
            <Sidebar />
            <button onClick={closeSidebar} className="absolute top-4 right-4 text-white/70 hover:text-white p-1">
              <IoMdClose size={22}/>
            </button>
          </div>
        </div>
      </Transition>
    </>
  );
};

const App = () => (
    <main className='w-full min-h-screen bg-gray-50'>
      <Routes>
        <Route element={<Layout />}>
          <Route index path='/' element={<Navigate to='/dashboard' />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/tasks' element={<Tasks />} />
          <Route path='/team' element={<Team />} />
          <Route path='/history' element={<History />} />
          <Route path='/trashed' element={<Trash />} />
          <Route path='/task/:id' element={<TaskDetail/>} />
          <Route path='/settings' element={<Users />} />
        </Route>
        <Route path = "/log-in" element={<Login />} />
      </Routes>
      <Toaster richColors position="top-center"/>
    </main>
);

export default App;
