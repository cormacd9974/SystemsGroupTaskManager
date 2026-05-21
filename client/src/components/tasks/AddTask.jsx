import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiImages } from "react-icons/bi";
import { toast } from "sonner";
import { useCreateTaskMutation, useUpdateTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { dateFormatter } from "../../utils";
import { Loading, ModalWrapper, SelectList, Textbox } from "../";
import UserList from "./UsersSelect";

const STAGES = ["todo", "in-progress", "completed"];// These constants define the possible stages, priorities, and categories for tasks. They are used to populate the dropdowns and buttons in the form, allowing users to select the appropriate values when creating or updating a task.
const PRIORITY = ["high", "medium", "normal", "low"];// The categories are grouped for better organization in the UI, and each category has a label for display purposes.

const CATEGORY_GROUPS = [
  { group: "Reports", options: ["REPORT-CREATED", "REPORT-ENHANCED", "REPORT-VALIDATED"], labels: { "REPORT-CREATED": "Created", "REPORT-ENHANCED": "Enhanced", "REPORT-VALIDATED": "Validated" } },
  { group: "Configurations", options: ["CONFIG-NEW", "CONFIG-UPDATED"], labels: { "CONFIG-NEW": "New", "CONFIG-UPDATED": "Updated" } },
  { group: "Projects", options: ["PROJECT-NEW"], labels: { "PROJECT-NEW": "New" } },
];
const ALL_CATS = CATEGORY_GROUPS.flatMap(g => g.options);
const SUGGESTED_TITLES = [
  { category: "Reports", title: "Report updates and troubleshooting" },
  { category: "Reports", title: "Creating new reports based on factory requirements" },
  { category: "Reports", title: "Report Changes" },
  { category: "Reports", title: "Check FSCO drumbeat TARGET update due to failure email" },
  { category: "Reports", title: "Investigate POR SGO STRS auto-update failure" },
  { category: "Reports", title: "VFMFGID/CEID misconfiguration in Executive Summary" },
  { category: "Reports", title: "Investigate missing CEID in Manufacturing Availability Report" },
  { category: "Reports", title: "Executive Summary Maintenance" },
  { category: "Reports", title: "FM TacOps DM Scorecard Maintenance" },
  { category: "Reports", title: "Manufacturing Indicators Maintenance" },
  { category: "Configurations", title: "UE configuration error troubleshooting" },
  { category: "Configurations", title: "Creation Requests" },
  { category: "Configurations", title: "Reacting to scripthost job fails" },
  { category: "Configurations", title: "Add a new VFMFGID to an entity" },
  { category: "Configurations", title: "Investigate INV management" },
  { category: "Configurations", title: "COS/Ae job Maintenance" },
  { category: "Configurations", title: "REV CEID creation" },
  { category: "Configurations", title: "REV CEID change" },
  { category: "Configurations", title: "VFMFGID creation" },
  { category: "Configurations", title: "Factory Merge Work" },
  { category: "Configurations", title: "POU Maintenance" },
  { category: "Configurations", title: "MA Maintenance" },
  { category: "Configurations", title: "Pareto DPML Maintenance" },
  { category: "Configurations", title: "Layer Count Maintenance" },
  { category: "Configurations", title: "VF Transfer Work" },
  { category: "Configurations", title: "STRS Auto-Update Maintenance" },
  { category: "Projects", title: "COS 3in1" },
  { category: "Projects", title: "COS_LIMITERS" },
  { category: "Projects", title: "Reticle" },
  { category: "Projects", title: "Re-NPI" },
  { category: "Projects", title: "CT Goal Work" },
  { category: "Projects", title: "CT Gifting Work" },
  { category: "Projects", title: "First Pass / Last Pass Work" },
  { category: "Projects", title: "New Automation Systems Investigations" },
  { category: "Projects", title: "TST Integration Work" },
];


const AddTask = ({ open, setOpen, task }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { title: task?.title || "", date: dateFormatter(task?.date || new Date()), startDate: task?.startDate ? dateFormatter(new Date(task.startDate)) : "", dueDate:  task?.dueDate ? dateFormatter(new Date(task.dueDate)) : "",description: task?.description || "", links: task?.links?.join(",") || "" },
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [titleInput, setTitleInput] = useState(task?.title || "");
  const [stage, setStage] = useState(task?.stage || STAGES[0]);
  const [priority, setPriority] = useState(task?.priority || PRIORITY[2]);
  const [category, setCategory] = useState(task?.category?.toUpperCase()?.replace("-", "_") || ALL_CATS[0]);
  const [team, setTeam] = useState(task?.team || []);
  const [assets, setAssets] = useState([]);
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpd }] = useUpdateTaskMutation();

  const handleOnSubmit = async (data) => {
    try {
      let assetUrls = [];
      if (assets.length > 0) {
        const formData = new FormData();
        Array.from(assets).forEach(file => formData.append("files", file));
        const uploadRes = await fetch("/api/task/upload", {
          method: "POST",
          headers: {
            authorization: `Bearer ${JSON.parse(localStorage.getItem("userInfo"))?.token}`,
          },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        assetUrls = uploadData.urls || [];
      }

      const payload = {
        ...data,
        team,
        stage: stage.toLowerCase(),
        priority: priority.toLowerCase(),
        category: category ? category.toLowerCase().replace("_", "-") : "report-created",
        assets: assetUrls,
        startDate: data.startDate || undefined,
        dueDate: data.dueDate || undefined,
      };

      const res = task?._id
        ? await updateTask({ ...payload, _id: task._id }).unwrap()
        : await createTask(payload).unwrap();
      toast.success(res.message);
      setTimeout(() => setOpen(false), 500);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };


  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)} className="overflow-visible">
        <h2 className="text-base font-bold text-gray-900 mb-4">{task ? "Update Task" : "New Task"}</h2>
        <div className="flex flex-col gap-5">
          <div className="relative flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Task Title</label>
            <input
              type="text"
              placeholder="Type or choose a suggestion..."
              value={titleInput}
              {...register("title", { required: "Title is required" })}
              onChange={(e) => {
                setTitleInput(e.target.value);
                setValue("title", e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="input-field"
            />
            {errors?.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto mt-1">
                {["Reports", "Configurations", "Projects"].map((cat) => {
                  const filtered = SUGGESTED_TITLES.filter(t =>
                    t.category === cat &&
                    t.title.toLowerCase().includes(titleInput.toLowerCase())
                  );
                  if (filtered.length === 0) return null;
                  return (
                    <div key={cat}>
                      <p className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                        {cat}
                      </p>
                      {filtered.map((item) => (
                        <button
                          key={item.title}
                          type="button"
                          onMouseDown={() => {
                            setTitleInput(item.title);
                            setValue("title", item.title);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0068B5] transition-colors"
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  );
                })}
                {SUGGESTED_TITLES.filter(t =>
                  t.title.toLowerCase().includes(titleInput.toLowerCase())
                ).length === 0 && (
                    <p className="px-4 py-2 text-sm text-gray-400">No suggestions — your custom title will be used</p>
                  )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-col gap-3">
              {CATEGORY_GROUPS.map(g => (
                <div key={g.group}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{g.group}</p>
                  <div className="flex flex-wrap gap-2">
                    {g.options.map(opt => (
                      <button key={opt} type="button" onClick={() => setCategory(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${category === opt ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                        {g.labels[opt]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <SelectList label="Stage" lists={STAGES} selected={stage} setSelected={setStage} />
            <SelectList label="Priority" lists={PRIORITY} selected={priority} setSelected={setPriority} />
          </div>
          <div className="flex gap-4">
            <div className="w-full">
              <Textbox placeholder="Date" type="date" name="date" label="Task Date" className="w-full rounded-xl" register={register("date", { required: "Date is required" })} error={errors.date?.message} />
              <Textbox placeholder="Start Date" type="date" name="startDate" label="Start Date (optional)" className="w-full rounded-xl mt-2" register={register("startDate")} />
              <Textbox placeholder="Due Date" type="date" name="dueDate" label="Due Date (optional)" className="w-full rounded-xl mt-2" register={register("dueDate")} />
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

          {open && <UserList setTeam={setTeam} team={team} />}

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
