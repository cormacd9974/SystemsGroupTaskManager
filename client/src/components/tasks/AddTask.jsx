import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiImages } from "react-icons/bi";
import { toast } from "sonner";
import { useCreateTaskMutation, useUpdateTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { dateFormatter } from "../../utils";
import { Loading, ModalWrapper, SelectList, Textbox } from "../";
import UserList from "./UsersSelect";

// Task form constants used to define available options in the UI.

// Possible task stages
const STAGES = ["todo", "in-progress", "completed"];// These constants define the possible stages, priorities, and categories for tasks. They are used to populate the dropdowns and buttons in the form, allowing users to select the appropriate values when creating or updating a task.

// Possible task priorities
const PRIORITY = ["high", "medium", "normal", "low"];// The categories are grouped for better organization in the UI, and each category has a label for display purposes.

// Category groups and their display labels
const CATEGORY_GROUPS = [
  { group: "Reports", options: ["REPORT-CREATED", "REPORT-ENHANCED", "REPORT-VALIDATED"], labels: { "REPORT-CREATED": "Created", "REPORT-ENHANCED": "Enhanced", "REPORT-VALIDATED": "Validated" } },
  { group: "Configurations", options: ["CONFIG-NEW", "CONFIG-UPDATED"], labels: { "CONFIG-NEW": "New", "CONFIG-UPDATED": "Updated" } },
  { group: "Projects", options: ["PROJECT-NEW"], labels: { "PROJECT-NEW": "New" } },
];

// Flatten all category values into a single array
const ALL_CATS = CATEGORY_GROUPS.flatMap(g => g.options);

// Suggested task titles organized by category
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


// Main component for adding a new task or editing an existing one.
// It receives:
// - open: controls modal visibility
// - setOpen: function to close/open the modal
// - task: existing task data when editing
const AddTask = ({ open, setOpen, task }) => {
  // Initialize react-hook-form with default values.
  // If a task exists, its values are prefilled for editing.
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { title: task?.title || "", date: dateFormatter(task?.date || new Date()), startDate: task?.startDate ? dateFormatter(new Date(task.startDate)) : "", dueDate: task?.dueDate ? dateFormatter(new Date(task.dueDate)) : "", description: task?.description || "", links: task?.links?.join(",") || "" },
  });

  // Controls whether title suggestions are shown
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Stores the current title input value separately for suggestion handling
  const [titleInput, setTitleInput] = useState(task?.title || "");

  // Stores the selected task stage
  const [stage, setStage] = useState(task?.stage || STAGES[0]);

  // Stores the selected task priority
  const [priority, setPriority] = useState(task?.priority || PRIORITY[2]);

  // Stores the selected category
  // Existing task category is normalized to match the UI format
  const [category, setCategory] = useState(task?.category?.toLowerCase().replace(/_/g, "-") || ALL_CATS[0]);

  // Stores selected team members assigned to the task
  const [team, setTeam] = useState(task?.team || []);

  // Stores uploaded asset files before sending them to the backend
  const [assets, setAssets] = useState([]);

  // Mutation hook for creating a task
  const [createTask, { isLoading }] = useCreateTaskMutation();

  // Mutation hook for updating an existing task
  const [updateTask, { isLoading: isUpd }] = useUpdateTaskMutation();

  // Handles form submission for both create and update flows
  const handleOnSubmit = async (data) => {
    try {
      //Due date can not come before start date
      if(data.startDate && data.dueDate && new Date(data.dueDate) < new Date(data.startDate)) {
        toast.error("Due date can not come before start date");
        return;
      }
      //Due date can not be in the past
      if(!task?._id && data.dueDate && new Date(data.dueDate) < new Date()) {
        toast.error("Due date can not be in the past");
        return;
      }
      //Please assign at least one team member
      if(team.length === 0) {
        toast.error("Please assign at least one team member");
        return;
      }
      // Holds uploaded file URLs returned from the backend
      let assetUrls = [];

      // If files are selected, upload them first
      if (assets.length > 0) {
        const formData = new FormData();

        // Append each selected file to the FormData object
        Array.from(assets).forEach(file => formData.append("files", file));

        // Upload files to the task upload endpoint
        const uploadRes = await fetch("/api/task/upload", {
          method: "POST",
          headers: {
            authorization: `Bearer ${JSON.parse(localStorage.getItem("userInfo"))?.token}`,
          },
          body: formData,
        });

        // Parse upload response
        const uploadData = await uploadRes.json();

        // Extract uploaded file URLs from the response
        assetUrls = uploadData.urls || [];
      }

      // Build the final payload to send to the API
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

      // If the task already exists, update it.
      // Otherwise, create a brand new task.
      const res = task?._id
        ? await updateTask({ ...payload, _id: task._id }).unwrap()
        : await createTask(payload).unwrap();

      // Show success message returned from the API
      toast.success(res.message);

      // Close the modal and reset local component state after a short delay
      setTimeout(() => {
        setOpen(false);
        setTitleInput("");
        setStage(STAGES[0]);
        setPriority(PRIORITY[2]);
        setCategory(ALL_CATS[0]);
        setTeam([]);
        setAssets([]);
      }, 500);
    } catch (err) {
      // Show backend or fallback error message if submission fails
      toast.error(err?.data?.message || err.error);
    }
  };


  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)} className="overflow-visible">
        {/* Modal title changes depending on whether we are editing or creating */}
        <h2 className="text-base font-bold text-gray-900 mb-4">{task ? "Update Task" : "New Task"}</h2>

        <div className="flex flex-col gap-5">
          {/* Title input with grouped live suggestions */}
          <div className="relative flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Task Title</label>
            <input
              type="text"
              placeholder="Type or choose a suggestion..."
              value={titleInput}
              {...register("title", { required: "Title is required" })}
              onChange={(e) => {
                // Keep local title state and react-hook-form value in sync
                setTitleInput(e.target.value);
                setValue("title", e.target.value);
                setShowSuggestions(true);
              }}
              // Show suggestions when the input gains focus
              onFocus={() => setShowSuggestions(true)}
              // Delay hiding so suggestion button clicks can register
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="input-field"
            />

            {/* Validation error for title */}
            {errors?.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}

            {/* Suggestion dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto mt-1">
                <div className="px-4 py-2 text-sm text-gray-500 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white">
                  <span className="font-semibold text-xs text-gray-400">Suggestions</span>
                  <button 
                  type="button" 
                  onMouseDown={() => setShowSuggestions(false)} 
                  className="text-gray-400 hover:text-red-600 text-lg fopnt-bol leading-none"
                  >
                    x
                  </button>
                </div>
                {["Reports", "Configurations", "Projects"].map((cat) => {
                  // Filter suggestions by category and current user input
                  const filtered = SUGGESTED_TITLES.filter(t =>
                    t.category === cat &&
                    t.title.toLowerCase().includes(titleInput.toLowerCase())
                  );

                  // Skip category sections with no matching suggestions
                  if (filtered.length === 0) return null;

                  return (
                    <div key={cat}>
                      {/* Category heading inside the suggestions dropdown */}
                      <p className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                        {cat}
                      </p>

                      {/* Render matching suggestions as selectable buttons */}
                      {filtered.map((item) => (
                        <button
                          key={item.title}
                          type="button"
                          onMouseDown={() => {
                            // Use onMouseDown so selection works before the input blur hides the menu
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

                {/* Fallback message when no suggestions match the current input */}
                {SUGGESTED_TITLES.filter(t =>
                  t.title.toLowerCase().includes(titleInput.toLowerCase())
                ).length === 0 && (
                    <p className="px-4 py-2 text-sm text-gray-400">No suggestions — your custom title will be used</p>
                  )}
              </div>
            )}
          </div>

          {/* Category selection grouped by type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-col gap-3">
              {CATEGORY_GROUPS.map(g => (
                <div key={g.group}>
                  {/* Category group heading */}
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{g.group}</p>

                  {/* Buttons for selecting a category option */}
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

          {/* Stage and priority selectors */}
          <div className="flex gap-4">
            <SelectList label="Stage" lists={STAGES} selected={stage} setSelected={setStage} />
            <SelectList label="Priority" lists={PRIORITY} selected={priority} setSelected={setPriority} />
          </div>

          {/* Date fields and attachments section */}
          <div className="flex gap-4">
            <div className="w-full">
              {/* Required main task date */}
              <Textbox placeholder="Date" type="date" name="date" label="Task Date" className="w-full rounded-xl" register={register("date", { required: "Date is required" })} error={errors.date?.message} />

              {/* Optional start date */}
              <Textbox placeholder="Start Date" type="date" name="startDate" label="Start Date (optional)" className="w-full rounded-xl mt-2" register={register("startDate")} />

              {/* Optional due date */}
              <Textbox placeholder="Due Date" type="date" name="dueDate" label="Due Date (optional)" className="w-full rounded-xl mt-2" register={register("dueDate")} />
            </div>

            <div className="w-full">
              {/* File upload section for task attachments */}
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Attachments</label>
              <label htmlFor="imgUpload" className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#0068B5] transition-colors">
                <input type="file" className="hidden" id="imgUpload" onChange={e => setAssets(prev => [...prev, ...Array.from(e.target.files)])} accept=".jpg,.png,.jpeg,.pdf,.doc,.docx,.xlsx,.csv,.txt" multiple />
                <BiImages className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  {assets.length > 0 ? `${assets.length} file(s) selected` : "Click to attach files"}
                </span>
              </label>

              {/* Preview selected files with remove option */}
              {assets.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.from(assets).map((file, i) => (
                    <span key={i} className="flex items-center justify-between gap-3 text-sm bg-blue-100 border-blue-200 px-3 py-1.5 rounded-lg w-full">
                      {file.name}
                      <button
                        type="button"
                        onClick={() => {
                          // Remove selected file from local state
                          const updated = assets.filter((_, idx) => idx !== i);
                          setAssets(updated);
                        }}
                        className="text-red-800 hover:text-red-500 transition-colors font-bold text-base ml-auto"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Task description field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea {...register("description")} rows={3} className="input-field resize-none" placeholder="Add details..." />
          </div>

          {/* Team/user selection is only rendered when the modal is open */}
          {open && <UserList setTeam={setTeam} team={team} />}

          {/* Optional links field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Links <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <textarea {...register("links")} rows={2} className="input-field resize-none" placeholder="https://..." />
          </div>
        </div>

        {/* Show loading spinner while creating or updating */}
        {isLoading || isUpd ? <div className="py-4"><Loading /></div> : (
          <div className="flex flex-row-reverse gap-3 mt-6">
            {/* Submit button text changes depending on mode */}
            <button type="submit" className="btn-primary px-8">{task ? "Update" : "Create"}</button>

            {/* Cancel closes the modal without submitting */}
            <button type="button" onClick={() => setOpen(false)} className="px-6 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        )}

      </form>
    </ModalWrapper>
  );
};

// Export the AddTask component for use in other parts of the app
export default AddTask;