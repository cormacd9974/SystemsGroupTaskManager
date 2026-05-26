import { useState, useEffect } from "react";
import { FaList } from "react-icons/fa";

//import { useSelector } from "react-redux";
//import { IoMdAdd } from "react-icons/io";
//import { FiDownload } from "react-icons/fi"

import { MdGridView } from "react-icons/md";
import { Loading, Table, Tabs, Title } from "../components";
import { AddTask, BoardView } from "../components/tasks";
import { useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice";
import { useSearchParams } from "react-router-dom";

// Tab options for switching between board and list layouts
const TABS = [
    { title: "Board View", icon: <MdGridView /> },
    { title: "List View", icon: <FaList /> }
];

const Tasks = () => {
    // Read the search query from the URL
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get("search") || "";

    // Controls whether the "Add Task" modal is open
    const [open, setOpen] = useState(false);

    //const { user } = useSelector((state) => state.auth);

    // Tracks which view tab is selected
    const [selected, setSelected] = useState(0);

    // Stores the current stage filter: all, todo, or in-progress
    const [stageFilter, setStageFilter] = useState("");

    // Fetch all tasks using the selected filter and search term
    const { data, isLoading } = useGetAllTaskQuery({ strQuery: stageFilter, isTrashed: "", search: searchTerm}, { refetchOnMountOrArgChange: true });
    
    /*const { user } = useSelector(s => s.auth);
    const exportToCSV = () => {
        const tasks = data?.tasks || [];
        if(tasks.length === 0) return;
        const headers = ["Title", "Category", "Stage", "Priority", "Start Date", "Due Date", "Team", "Sub-tasks"];
        const rows = tasks.map(t => [
            `"${(t.title || "").replace(/"/g, '""')}"`,
                t.category || "",
                t.stage || "",
                t.priority || "",
                t.startDate ? new Date(t.startDate).toLocaleDateString() : "",
                t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "",

        ])
    }*/ //Possible export to csv function
    // Scroll to the top whenever the add-task modal state changes
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth"});
    }, [open]);
    

    // Show loading spinner while tasks are being fetched
    return isLoading ? (
        <div className="py-16 flex justify-center">
            <Loading />
        </div>
    ) : (
        <div className="w-full space-y-4">
            {/* Header with page title and new task button */}
            <div className="flex items-center justify-between">
                <div>
                  <Title title="Tasks"/>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {data?.tasks?.length || 0} tasks
                  </p>
                </div>
                
                    <button
                    onClick={() => setOpen(true)}
                    className="btn-primary flex items-center gap-2"
                    >
                        <IoMdAdd className="text-lg"/>
                        <span>New Task</span>
                    </button>
            </div>

            {/* Stage filter buttons */}
            <div>
                {["", "todo", "in-progress"].map((stage) => (
                    <button
                        key={stage}
                        onClick={() => setStageFilter(stage)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium border tracking-all ${
                            stageFilter === stage
                                ? "border-[#0068B5] text-white"
                                : "text-gray-700 border-gray-200 bg-white hover:border-[#0068B5]"
                        }`}
                        style={stageFilter === stage ? { backgroundColor: "#0068B5"} : {}}
                    >
                        {stage === "" ? "All" : stage === "todo" ? "To Do" : "In Progress"}
                    </button>
                ))}
            </div>

            {/* Main content area for board/list views */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <Tabs tabs={TABS} setSelected={setSelected}>
                    <div className={selected === 0 ? "" : "p-4"}>
                        {selected === 0
                          ? <BoardView tasks={data?.tasks}/>
                          : <Table tasks={data?.tasks}/>
                        }
                    </div>
                </Tabs>
            </div>

            {/* Modal for creating a new task */}
            <AddTask open={open} setOpen={setOpen} />
        </div>
    );
};

export default Tasks;