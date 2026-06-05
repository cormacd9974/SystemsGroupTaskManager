// React hooks for state management
import { useState } from "react";
// Form handling and validation library
import { useForm } from "react-hook-form";
// Icon for file upload button
import { BiImages } from "react-icons/bi";
// Toast notifications for user feedback
import { toast } from "sonner";
// Redux mutation hooks for task API operations
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
// Utility function for formatting dates
import { dateFormatter } from "../../utils";
// Reusable UI components
import { Loading, ModalWrapper, SelectList, Textbox } from "../";
// Custom component for selecting team members
import UserList from "./UsersSelect";

/**
 * TASK FORM CONSTANTS
 * These constants define the available options in the UI dropdowns and form fields.
 * They provide standardized values that ensure consistency across the application.
 */

/**
 * Available task stages that represent the current state of a task
 * Used in the stage dropdown selector
 */
const STAGES = ["todo", "in-progress", "completed"];

/**
 * Task priority levels from highest to lowest importance
 * Used in the priority dropdown selector
 */
const PRIORITY = ["high", "medium", "normal", "low"];

/**
 * Category groups organize task types into logical sections
 * Each group contains:
 * - group: Display name for the category section
 * - options: Available category values (used internally)
 * - labels: User-friendly display names for each option
 */
const CATEGORY_GROUPS = [
  {
    group: "Reports", // Report-related tasks
    options: ["REPORT-CREATED", "REPORT-ENHANCED", "REPORT-VALIDATED"],
    labels: {
      "REPORT-CREATED": "Created", // New report creation
      "REPORT-ENHANCED": "Enhanced", // Report improvements
      "REPORT-VALIDATED": "Validated", // Report verification
    },
  },
  {
    group: "Configurations", // Configuration management tasks
    options: ["CONFIG-NEW", "CONFIG-UPDATED"],
    labels: {
      "CONFIG-NEW": "New", // New configuration setup
      "CONFIG-UPDATED": "Updated", // Configuration modifications
    },
  },
  {
    group: "Projects", // Project-related tasks
    options: ["PROJECT-NEW"],
    labels: { "PROJECT-NEW": "New" }, // New project initialization
  },
  {
    group: "Other", // Miscellaneous tasks that don't fit other categories
    options: ["OTHER"],
    labels: { OTHER: "Other" },
  },
];

/**
 * Flattened array of all category options for easy access
 * Used for default values and validation
 */
const ALL_CATS = CATEGORY_GROUPS.flatMap((g) => g.options);

/**
 * Pre-defined task title suggestions organized by category
 * These provide users with common task templates to speed up task creation
 * Each suggestion includes:
 * - category: Which category group it belongs to
 * - title: The suggested task title text
 */
const SUGGESTED_TITLES = [
  // Report-related task suggestions
  { category: "Reports", title: "Report updates and troubleshooting" },
  {
    category: "Reports",
    title: "Creating new reports based on factory requirements",
  },
  { category: "Reports", title: "Report Changes" },
  {
    category: "Reports",
    title: "Check FSCO drumbeat TARGET update due to failure email",
  },
  {
    category: "Reports",
    title: "Investigate POR SGO STRS auto-update failure",
  },
  {
    category: "Reports",
    title: "VFMFGID/CEID misconfiguration in Executive Summary",
  },
  {
    category: "Reports",
    title: "Investigate missing CEID in Manufacturing Availability Report",
  },
  { category: "Reports", title: "Executive Summary Maintenance" },
  { category: "Reports", title: "FM TacOps DM Scorecard Maintenance" },
  { category: "Reports", title: "Manufacturing Indicators Maintenance" },

  // Configuration-related task suggestions
  {
    category: "Configurations",
    title: "UE configuration error troubleshooting",
  },
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

  // Project-related task suggestions
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

/**
 * AddTask Component
 *
 * A comprehensive modal form for creating new tasks or editing existing ones.
 * This component handles the complete task lifecycle including:
 * - Form validation and submission
 * - File uploads for task attachments
 * - Team member assignment
 * - Smart title suggestions based on categories
 * - Date validation to prevent scheduling conflicts
 *
 * @param {boolean} open - Controls modal visibility state
 * @param {function} setOpen - Function to toggle modal open/closed
 * @param {Object|null} task - Existing task data for editing (null for new tasks)
 */
const AddTask = ({ open, setOpen, task }) => {
  /**
   * Initialize react-hook-form with default values
   * When editing an existing task, form fields are pre-populated with current values
   * When creating a new task, sensible defaults are provided
   */
  const {
    register, // Register form inputs for validation
    handleSubmit, // Handle form submission with validation
    setValue, // Programmatically set form field values
    reset, // Reset form to default values
    formState: { errors }, // Form validation errors
  } = useForm({
    defaultValues: {
      // Pre-fill title if editing existing task
      title: task?.title || "",
      // Format date for HTML date input (existing task date or current date)
      date: dateFormatter(task?.date || new Date()),
      // Format start date if it exists on the task
      startDate: task?.startDate ? dateFormatter(new Date(task.startDate)) : "",
      // Format due date if it exists on the task
      dueDate: task?.dueDate ? dateFormatter(new Date(task.dueDate)) : "",
      // Pre-fill description if editing
      description: task?.description || "",
      // Convert links array to comma-separated string for textarea
      links: task?.links?.join(",") || "",
    },
  });

  /**
   * LOCAL STATE MANAGEMENT
   * These state variables manage UI interactions and form data that isn't directly
   * handled by react-hook-form
   */

  // Controls visibility of the title suggestions dropdown
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Tracks current title input for real-time suggestion filtering
  // Separate from form state to enable immediate UI updates
  const [titleInput, setTitleInput] = useState(task?.title || "");

  // Selected task stage (todo, in-progress, completed)
  const [stage, setStage] = useState(task?.stage || STAGES[0]);

  // Selected task priority (high, medium, normal, low)
  const [priority, setPriority] = useState(task?.priority || PRIORITY[2]);

  // Selected task category with normalization for existing tasks
  // Converts underscores to hyphens and lowercases for consistency
  const [category, setCategory] = useState(
    task?.category?.toLowerCase().replace(/_/g, "-") || ALL_CATS[0],
  );

  // Array of selected team members assigned to this task
  const [team, setTeam] = useState(task?.team || []);

  // New files selected for upload (File objects)
  const [assets, setAssets] = useState([]);

  // Existing file URLs from the task (when editing)
  const [existingAssets, setExistingAssets] = useState(task?.assets || []);

  /**
   * API MUTATION HOOKS
   * These hooks provide functions to create/update tasks and track loading states
   */

  // Hook for creating new tasks
  const [createTask, { isLoading }] = useCreateTaskMutation();

  // Hook for updating existing tasks
  const [updateTask, { isLoading: isUpd }] = useUpdateTaskMutation();

  /**
   * Form submission handler
   * Validates data, uploads files, and creates/updates the task
   *
   * @param {Object} data - Form data from react-hook-form
   */
  const handleOnSubmit = async (data) => {
    try {
      /**
       * VALIDATION CHECKS
       * Perform business logic validation before submitting
       */

      // Ensure due date is not before start date
      if (
        data.startDate &&
        data.dueDate &&
        new Date(data.dueDate) < new Date(data.startDate)
      ) {
        toast.error("Due date can not come before start date");
        return; // Exit early if validation fails
      }

      // For new tasks, ensure due date is not in the past
      if (!task?._id && data.dueDate && new Date(data.dueDate) < new Date()) {
        toast.error("Due date can not be in the past");
        return;
      }

      // Ensure at least one team member is assigned
      if (team.length === 0) {
        toast.error("Please assign at least one team member");
        return;
      }

      /**
       * FILE UPLOAD HANDLING
       * Upload new files before creating/updating the task
       */
      let assetUrls = []; // Will store URLs of uploaded files

      // Only upload if new files are selected
      if (assets.length > 0) {
        // Create FormData object for multipart file upload
        const formData = new FormData();

        // Append each selected file to the form data
        Array.from(assets).forEach((file) => formData.append("files", file));

        // Upload files to the server
        const uploadRes = await fetch("/api/task/upload", {
          method: "POST",
          headers: {
            // Include authentication token from localStorage
            authorization: `Bearer ${JSON.parse(localStorage.getItem("userInfo"))?.token}`,
          },
          body: formData, // Send files as multipart form data
        });

        // Parse the upload response
        const uploadData = await uploadRes.json();

        // Extract file URLs from the response
        assetUrls = uploadData.urls || [];
      }

      /**
       * BUILD TASK PAYLOAD
       * Combine form data with component state and uploaded file URLs
       */
      const payload = {
        ...data, // Spread form data (title, dates, description, links)
        team, // Selected team members
        stage: stage.toLowerCase(), // Normalize stage to lowercase
        priority: priority.toLowerCase(), // Normalize priority to lowercase
        // Normalize category format (lowercase with hyphens)
        category: category
          ? category.toLowerCase().replace("_", "-")
          : "report-created", // Default fallback category
        // Combine existing assets with newly uploaded ones
        assets: [...existingAssets, ...assetUrls],
        // Only include dates if they have values (undefined removes empty fields)
        startDate: data.startDate || undefined,
        dueDate: data.dueDate || undefined,
      };

      /**
       * API CALL
       * Create new task or update existing one based on whether task._id exists
       */
      const res = task?._id
        ? await updateTask({ ...payload, _id: task._id }).unwrap() // Update existing
        : await createTask(payload).unwrap(); // Create new

      // Show success message from API response
      toast.success(res.message);

      /**
       * CLEANUP AND RESET
       * Reset component state and close modal after successful submission
       */
      setTimeout(() => {
        setOpen(false); // Close the modal

        // Reset all local state to initial values
        setTitleInput("");
        setStage(STAGES[0]);
        setPriority(PRIORITY[2]);
        setCategory(ALL_CATS[0]);
        setTeam([]);
        setAssets([]);
        setExistingAssets([]);

        // Reset form to default values
        reset({
          title: "",
          date: dateFormatter(new Date()),
          startDate: "",
          dueDate: "",
          description: "",
          links: "",
        });
      }, 500); // Small delay to allow user to see success message
    } catch (err) {
      // Display error message from API or fallback generic error
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    // Modal wrapper handles backdrop, positioning, and close behavior
    <ModalWrapper open={open} setOpen={setOpen}>
      {/* Main form with overflow visible to show suggestion dropdown */}
      <form
        onSubmit={handleSubmit(handleOnSubmit)}
        className="overflow-visible"
      >
        {/* Dynamic modal title based on create vs edit mode */}
        <h2 className="text-base font-bold text-gray-900 mb-4">
          {task ? "Update Task" : "New Task"}
        </h2>

        {/* Form fields container with consistent spacing */}
        <div className="flex flex-col gap-5">
          {/* TITLE INPUT WITH SMART SUGGESTIONS */}
          <div className="relative flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Task Title
            </label>

            {/* Title input field with suggestion integration */}
            <input
              type="text"
              placeholder="Type or choose a suggestion..."
              value={titleInput} // Controlled input for real-time updates
              {...register("title", { required: "Title is required" })}
              onChange={(e) => {
                // Keep local state and form state synchronized
                setTitleInput(e.target.value);
                setValue("title", e.target.value);
                setShowSuggestions(true); // Show suggestions on input change
              }}
              // Show suggestions when input gains focus
              onFocus={() => setShowSuggestions(true)}
              // Delay hiding suggestions to allow button clicks to register
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="input-field"
            />

            {/* Display validation error for title field */}
            {errors?.title && (
              <p className="text-red-500 text-xs">{errors.title.message}</p>
            )}

            {/* SUGGESTIONS DROPDOWN */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto mt-1">
                {/* Dropdown header with close button */}
                <div className="px-4 py-2 text-sm text-gray-500 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white">
                  <span className="font-semibold text-xs text-gray-400">
                    Suggestions
                  </span>
                  <button
                    type="button"
                    onMouseDown={() => setShowSuggestions(false)} // Use onMouseDown to fire before onBlur
                    className="text-gray-400 hover:text-red-600 text-lg font-bold leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Render suggestions grouped by category */}
                {["Reports", "Configurations", "Projects"].map((cat) => {
                  // Filter suggestions by category and current input
                  const filtered = SUGGESTED_TITLES.filter(
                    (t) =>
                      t.category === cat &&
                      t.title.toLowerCase().includes(titleInput.toLowerCase()),
                  );

                  // Skip categories with no matching suggestions
                  if (filtered.length === 0) return null;

                  return (
                    <div key={cat}>
                      {/* Category section header */}
                      <p className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                        {cat}
                      </p>

                      {/* Render matching suggestion buttons */}
                      {filtered.map((item) => (
                        <button
                          key={item.title}
                          type="button"
                          onMouseDown={() => {
                            // Use onMouseDown so selection works before input blur
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

                {/* Show message when no suggestions match current input */}
                {SUGGESTED_TITLES.filter((t) =>
                  t.title.toLowerCase().includes(titleInput.toLowerCase()),
                ).length === 0 && (
                  <p className="px-4 py-2 text-sm text-gray-400">
                    No suggestions — your custom title will be used
                  </p>
                )}
              </div>
            )}
          </div>

          {/* CATEGORY SELECTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>

            {/* Render category groups with selectable options */}
            <div className="flex flex-col gap-3">
              {CATEGORY_GROUPS.map((g) => (
                <div key={g.group}>
                  {/* Category group heading */}
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    {g.group}
                  </p>

                  {/* Category option buttons */}
                  <div className="flex flex-wrap gap-2">
                    {g.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCategory(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          category === opt
                            ? "bg-blue-600 text-white border-blue-600" // Selected state
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300" // Default state
                        }`}
                      >
                        {g.labels[opt]} {/* Display user-friendly label */}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STAGE AND PRIORITY SELECTORS */}
          <div className="flex gap-4">
            {/* Task stage dropdown (todo, in-progress, completed) */}
            <SelectList
              label="Stage"
              lists={STAGES}
              selected={stage}
              setSelected={setStage}
            />

            {/* Task priority dropdown (high, medium, normal, low) */}
            <SelectList
              label="Priority"
              lists={PRIORITY}
              selected={priority}
              setSelected={setPriority}
            />
          </div>

          {/* DATE FIELDS AND FILE ATTACHMENTS */}
          <div className="flex gap-4">
            {/* DATE FIELDS COLUMN */}
            <div className="w-full">
              {/* Required main task date */}
              <Textbox
                placeholder="Date"
                type="date"
                name="date"
                label="Task Date"
                className="w-full rounded-xl"
                register={register("date", { required: "Date is required" })}
                error={errors.date?.message}
              />

              {/* Optional start date */}
              <Textbox
                placeholder="Start Date"
                type="date"
                name="startDate"
                label="Start Date (optional)"
                className="w-full rounded-xl mt-2"
                register={register("startDate")}
              />

              {/* Optional due date */}
              <Textbox
                placeholder="Due Date"
                type="date"
                name="dueDate"
                label="Due Date (optional)"
                className="w-full rounded-xl mt-2"
                register={register("dueDate")}
              />
            </div>

            {/* FILE ATTACHMENTS COLUMN */}
            <div className="w-full">
              {/* File upload section */}
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Attachments
              </label>

              {/* File upload trigger (styled as button) */}
              <label
                htmlFor="imgUpload"
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#0068B5] transition-colors"
              >
                {/* Hidden file input */}
                <input
                  type="file"
                  className="hidden"
                  id="imgUpload"
                  onChange={(e) =>
                    // Add selected files to assets array
                    setAssets((prev) => [
                      ...prev,
                      ...Array.from(e.target.files),
                    ])
                  }
                  // Accepted file types for task attachments
                  accept=".jpg,.png,.jpeg,.pdf,.doc,.docx,.xlsx,.csv,.txt"
                  multiple // Allow multiple file selection
                />

                {/* Upload icon */}
                <BiImages className="text-gray-400" />

                {/* Dynamic upload text based on selected files */}
                <span className="text-sm text-gray-500">
                  {assets.length + existingAssets.length > 0
                    ? `${assets.length + existingAssets.length} file(s) selected`
                    : "Click to attach files"}
                </span>
              </label>

              {/* SELECTED FILES PREVIEW */}
              {(existingAssets.length > 0 || assets.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Display existing files (from task being edited) */}
                  {existingAssets.map((url, i) => (
                    <span
                      key={"ex-" + i}
                      className="flex items-center justify-between gap-3 text-sm bg-blue-100 border-blue-200 px-3 py-1.5 rounded-lg w-full"
                    >
                      {/* Extract filename from URL */}
                      {url.split("/").pop()}

                      {/* Remove file button */}
                      <button
                        type="button"
                        onClick={() => {
                          // Remove file from existing assets
                          setExistingAssets(
                            existingAssets.filter((_, idx) => idx !== i),
                          );
                        }}
                        className="text-red-800 hover:text-red-500 transition-colors font-bold text-base ml-auto"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {/* Display newly selected files */}
                  {Array.from(assets).map((file, i) => (
                    <span
                      key={i}
                      className="flex items-center justify-between gap-3 text-sm bg-blue-100 border-blue-200 px-3 py-1.5 rounded-lg w-full"
                    >
                      {/* Display filename */}
                      {file.name}

                      {/* Remove file button */}
                      <button
                        type="button"
                        onClick={() => {
                          // Remove file from new assets
                          const updated = assets.filter((_, idx) => idx !== i);
                          setAssets(updated);
                        }}
                        className="text-red-800 hover:text-red-500 transition-colors font-bold text-base ml-auto"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TASK DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              {...register("description")} // Optional field, no validation
              rows={3}
              className="input-field resize-none"
              placeholder="Add details..."
            />
          </div>

          {/* TEAM MEMBER SELECTION */}
          {/* Only render when modal is open to prevent unnecessary API calls */}
          {open && <UserList setTeam={setTeam} team={team} />}

          {/* LINKS FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Links{" "}
              <span className="text-gray-400 font-normal">
                (comma separated)
              </span>
            </label>
            <textarea
              {...register("links")} // Optional field for related URLs
              rows={2}
              className="input-field resize-none"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* FORM ACTIONS */}
        {/* Show loading spinner during API operations */}
        {isLoading || isUpd ? (
          <div className="py-4">
            <Loading />
          </div>
        ) : (
          // Show action buttons when not loading
          <div className="flex flex-row-reverse gap-3 mt-6">
            {/* Submit button with dynamic text */}
            <button type="submit" className="btn-primary px-8">
              {task ? "Update" : "Create"}
            </button>

            {/* Cancel button - closes modal without saving */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-6 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

// Export component for use throughout the application
export default AddTask;

/**
 * COMPONENT SUMMARY
 *
 * The AddTask component is a comprehensive task management form that handles both
 * creating new tasks and editing existing ones. It provides a rich user experience with:
 *
 * KEY FEATURES:
 * - Smart title suggestions based on common task patterns
 * - Organized category selection with grouped options
 * - File upload with preview and removal capabilities
 * - Team member assignment through integrated user selection
 * - Comprehensive date validation (start, due, and main dates)
 * - Form validation with helpful error messages
 * - Loading states during API operations
 * - Toast notifications for user feedback
 *
 * TECHNICAL IMPLEMENTATION:
 * - Uses react-hook-form for robust form state management
 * - Integrates with Redux Toolkit Query for API operations
 * - Handles file uploads through multipart form data
 * - Implements real-time suggestion filtering
 * - Manages complex state interactions between form and UI
 *
 * USAGE PATTERNS:
 * - Create new task: <AddTask open={true} setOpen={setOpen} task={null} />
 * - Edit existing task: <AddTask open={true} setOpen={setOpen} task={taskData} />
 *
 * DEPENDENCIES:
 * - react-hook-form: Form management and validation
 * - Redux Toolkit Query: API state management
 * - sonner: Toast notifications
 * - Custom UI components: ModalWrapper, SelectList, Textbox, Loading
 * - UserList component: Team member selection
 */
