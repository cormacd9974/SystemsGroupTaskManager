import { useState, useEffect } from "react";
import { FaList } from "react-icons/fa";
//import { useSelector } from "react-redux";
import { IoMdAdd } from "react-icons/io";
import { MdGridView } from "react-icons/md";
import { Loading, Table, Tabs, Title } from "../components";
import { AddTask, BoardView } from "../components/tasks";
import { useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice";
import { useSearchParams } from "react-router-dom";

const TABS = [
    { title: "Board View", icon: <MdGridView /> },
    { title: "List View", icon: <FaList /> }
];

const Tasks = () => {
    const [searchParams] = useSearchParams();
    const [searchTerm] = useState(searchParams.get("search") || "");
    const [open, setOpen] = useState(false);
    //const { user } = useSelector((state) => state.auth);
    const [selected, setSelected] = useState(0);
    const { data, isLoading, refetch } = useGetAllTaskQuery({ strQuery: "", isTrashed: "", search: searchTerm});

    useEffect(() => {
        refetch();
        window.scrollTo({ top: 0, left: 0, behavior: "smooth"});
    }, [open]);
    

    return isLoading ? (
        <div className="py-16 flex justify-center">
            <Loading />
        </div>
    ) : (
        <div className="w-full space-y-4">
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
            <AddTask open={open} setOpen={setOpen} />
        </div>
    );
};

export default Tasks;
