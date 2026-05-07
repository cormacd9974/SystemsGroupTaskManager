import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiImages } from "react-icons/bi";
import { toast } from "sonner";
import { useCreateTaskMutation, useUpdateTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { dateFormatter } from "../../utils";
import { Loading, ModalWrapper, SelectList, Textbox } from "../";
import UserList from "./UsersSelect";

const STAGES   = ["todo","in-progress","completed"];
const PRIORITY = ["high","medium","normal","low"];
const CATEGORY_GROUPS = [
  { group:"Reports",       options:["REPORT-CREATED","REPORT-ENHANCED","REPORT-VALIDATED"], labels:{"REPORT-CREATED":"Created","REPORT-ENHANCED":"Enhanced","REPORT-VALIDATED":"Validated"} },
  { group:"Configurations",options:["CONFIG-NEW","CONFIG-UPDATED"],                         labels:{"CONFIG-NEW":"New","CONFIG-UPDATED":"Updated"} },
  { group:"Projects",      options:["PROJECT-NEW"],                                          labels:{"PROJECT-NEW":"New"} },
];
const ALL_CATS = CATEGORY_GROUPS.flatMap(g => g.options);

const AddTask = ({ open, setOpen, task }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { title: task?.title||"", date: dateFormatter(task?.date||new Date()), description: task?.description||"", links: task?.links?.join(",")||"" },
  });
  const [stage,    setStage]    = useState(task?.stage || STAGES[0]);
  const [priority, setPriority] = useState(task?.priority || PRIORITY[2]);
  const [category, setCategory] = useState(task?.category?.toUpperCase()?.replace("-","_") || ALL_CATS[0]);
  const [team,     setTeam]     = useState(task?.team || []);
  const [ setAssets]   = useState([]);
  const [createTask, { isLoading }]       = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpd }] = useUpdateTaskMutation();

  const handleOnSubmit = async (data) => {
    try {
      const payload = { ...data, team, stage: stage.toLowerCase(), priority: priority.toLowerCase(), category: category ? category.toLowerCase().replace("_","-"): "report-created" };
      const res = task?._id
        ? await updateTask({ ...payload, _id: task._id }).unwrap()
        : await createTask(payload).unwrap();
      toast.success(res.message);
      setTimeout(() => setOpen(false), 500);
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)} className="overflow-visible">
        <h2 className="text-base font-bold text-gray-900 mb-4">{task ? "Update Task" : "New Task"}</h2>
        <div className="flex flex-col gap-5">
          <Textbox placeholder="Task title" type="text" name="title" label="Task Title" className="w-full rounded-xl" register={register("title",{required:"Title is required"})} error={errors.title?.message} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-col gap-3">
              {CATEGORY_GROUPS.map(g => (
                <div key={g.group}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{g.group}</p>
                  <div className="flex flex-wrap gap-2">
                    {g.options.map(opt => (
                      <button key={opt} type="button" onClick={() => setCategory(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${category===opt ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                        {g.labels[opt]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <SelectList label="Stage"    lists={STAGES}   selected={stage}    setSelected={setStage} />
            <SelectList label="Priority" lists={PRIORITY} selected={priority} setSelected={setPriority} />
          </div>
          <div className="flex gap-4">
            <div className="w-full">
              <Textbox placeholder="Date" type="date" name="date" label="Task Date" className="w-full rounded-xl" register={register("date",{required:"Date is required"})} error={errors.date?.message} />
            </div>
            <div className="w-full flex items-end pb-1">
              <label className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 cursor-pointer" htmlFor="imgUpload">
                <input type="file" className="hidden" id="imgUpload" onChange={e => setAssets(e.target.files)} accept=".jpg,.png,.jpeg" multiple />
                <BiImages /><span>Assets</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea {...register("description")} rows={3} className="input-field resize-none" placeholder="Add details..." />
          </div>

          { open && <UserList setTeam={setTeam} team={team} />  }

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Links <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <textarea {...register("links")} rows={2} className="input-field resize-none" placeholder="https://..." />
          </div>
        </div>
        {isLoading || isUpd ? <div className="py-4"><Loading /></div> : (
          <div className="flex flex-row-reverse gap-3 mt-6">
            <button type="submit" className="btn-primary px-8">{task ? "Update" : "Create"}</button>
            <button type="button" onClick={() => setOpen(false)} className="px-6 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        )}
        
      </form>
    </ModalWrapper>
  );
};
export default AddTask;
