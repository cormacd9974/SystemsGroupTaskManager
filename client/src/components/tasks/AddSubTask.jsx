// React Hook Form for form state management and validation
import { useForm } from "react-hook-form";
// Toast notifications for user feedback
import { toast } from "sonner";
// Redux mutation hook for creating sub-tasks via API
import { useCreateSubTaskMutation } from "../../redux/slices/api/taskApiSlice";
// Reusable UI components
import { Loading, ModalWrapper, Textbox } from "../";
// React hook for local state management
import { useState } from "react";

// Predefined suggestions for sub-task titles to improve user experience
// These are common task-related actions that users might want to create sub-tasks for
const SUGGESTIONS = [
  "Review", // Code review, document review, etc.
  "Implement", // Feature implementation
  "Test", // Unit testing, integration testing
  "Document", // Documentation creation/updates
  "Validate", // Data validation, requirement validation
  "Update", // Updates to existing features/docs
  "Deploy", // Deployment tasks
  "Approve", // Approval processes
  "Draft", // Initial drafts of documents/features
  "Verify", // Verification tasks
  "Sign-off", // Final approval/sign-off tasks
];

/**
 * AddSubTask Component
 *
 * A modal form component that allows users to create sub-tasks for an existing task.
 * Features include:
 * - Form validation using react-hook-form
 * - Auto-suggestions for task titles
 * - Date validation to prevent past dates
 * - Loading states during API calls
 * - Toast notifications for success/error feedback
 *
 * @param {boolean} open - Controls modal visibility
 * @param {function} setOpen - Function to toggle modal visibility
 * @param {string} id - Parent task ID that this sub-task belongs to
 */
const AddSubTask = ({ open, setOpen, id }) => {
  // Initialize react-hook-form with form state management
  const {
    register, // Register form inputs for validation
    handleSubmit, // Handle form submission
    formState: { errors }, // Form validation errors
    setValue, // Programmatically set form field values
  } = useForm();

  // Local state to track title input for filtering suggestions
  // This is separate from the form state to enable real-time filtering
  const [titleInput, setTitleInput] = useState("");

  // Redux mutation hook for creating sub-tasks
  // Returns the mutation function and loading state
  const [addSubTask, { isLoading }] = useCreateSubTaskMutation();

  /**
   * Form submission handler
   * Validates data, calls API, and handles success/error states
   *
   * @param {Object} data - Form data from react-hook-form
   * @param {string} data.title - Sub-task title
   * @param {string} data.date - Due date for sub-task
   * @param {string} data.tag - Category/tag for sub-task
   * @param {string} data.description - Optional description
   */
  const handleOnSubmit = async (data) => {
    try {
      // Validate that the sub-task date is not in the past
      // This prevents users from creating sub-tasks with invalid due dates
      if (data.date && new Date(data.date) < new Date()) {
        toast.error("Sub task date cannot come before task start date");
        return; // Exit early if validation fails
      }

      // Call the API to create the sub-task
      // unwrap() extracts the resolved value or throws the rejected value
      const res = await addSubTask({ data, id }).unwrap();

      // Show success message to user
      toast.success(res.message);

      // Close modal after a brief delay to allow user to see success message
      setTimeout(() => setOpen(false), 500);
    } catch (err) {
      // Handle API errors and show appropriate error message
      // Fallback to generic error if specific message not available
      toast.error(err?.data?.message || err.error);
    }
  };

  // Filter suggestions based on current title input
  // Only show suggestions that match the user's input (case-insensitive)
  // Only display suggestions when user has typed something
  const filtered = SUGGESTIONS.filter(
    (s) =>
      titleInput.length > 0 && // Only filter when user has input
      s.toLowerCase().includes(titleInput.toLowerCase()), // Case-insensitive matching
  );

  return (
    // Modal wrapper component that handles backdrop and positioning
    <ModalWrapper open={open} setOpen={setOpen}>
      {/* Main form element with submission handler */}
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        {/* Modal header */}
        <h2 className="text-base font-bold text-gray-900 mb-4">Add Sub-Task</h2>

        {/* Form fields container with consistent spacing */}
        <div className="flex flex-col gap-5">
          {/* Title input field with auto-suggestions */}
          <div className="relative">
            {/* Field label */}
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Title
            </label>

            {/* Title input field */}
            <input
              type="text"
              placeholder="Sub-Task Title"
              autoComplete="off" // Disable browser autocomplete to show custom suggestions
              className="input-field"
              {...register("title", {
                required: "Title is required", // Validation rule
                // Update local state on every change for real-time suggestion filtering
                onChange: (e) => setTitleInput(e.target.value),
              })}
            />

            {/* Display validation error if title is invalid */}
            {errors.title && (
              <span className="text-xs text-red-500 mt-0.5">
                {errors.title.message}
              </span>
            )}

            {/* Suggestions dropdown - only shown when there are filtered suggestions */}
            {filtered.length > 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                {filtered.map((s, i) => (
                  <button
                    key={i}
                    type="button" // Prevent form submission when clicking suggestion
                    onClick={() => {
                      // Set the selected suggestion as the title value
                      setValue("title", s);
                      // Clear the input state to hide suggestions
                      setTitleInput("");
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date input field using reusable Textbox component */}
          <Textbox
            placeholder="Date"
            type="Date"
            name="date"
            label="date"
            className="w-full rounded-xl"
            register={register("date", { required: "The Date is required" })}
            error={errors.date?.message}
          />

          {/* Tag input field for categorizing the sub-task */}
          <Textbox
            placeholder="tag"
            type="text"
            name="tag"
            label="tag"
            className="w-full rounded-xl"
            register={register("tag", { required: "Tag is required" })}
            error={errors.tag?.message}
          />

          {/* Optional description field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Description
              {/* Indicate that this field is optional */}
              <span className="text-gray-400"> (optional)</span>
            </label>
            <textarea
              {...register("description")} // No validation rules - truly optional
              rows={3}
              placeholder="Add details..."
              className="input-field resize-none w-full mt-1"
            />
          </div>
        </div>

        {/* Form action buttons - conditional rendering based on loading state */}
        {isLoading ? (
          // Show loading spinner while API request is in progress
          <div className="p-4">
            <Loading />
          </div>
        ) : (
          // Show action buttons when not loading
          <div className="flex flex-row-reverse gap-3 mt-6">
            {/* Submit button - positioned first due to flex-row-reverse */}
            <button type="submit" className="btn-primary px-8">
              Add
            </button>

            {/* Cancel button - closes modal without saving */}
            <button
              type="button" // Prevent form submission
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

export default AddSubTask;

/**
 * Component Summary:
 *
 * This component provides a user-friendly interface for creating sub-tasks within a larger task management system.
 *
 * Key Features:
 * - Form validation using react-hook-form for robust input handling
 * - Auto-suggestion system for common task titles to improve user experience
 * - Date validation to prevent scheduling sub-tasks in the past
 * - Real-time feedback through toast notifications
 * - Loading states to provide visual feedback during API operations
 * - Responsive modal design that can be easily opened/closed
 *
 * Dependencies:
 * - react-hook-form: Form state management and validation
 * - sonner: Toast notification system
 * - Redux Toolkit Query: API state management and caching
 * - Custom UI components: ModalWrapper, Textbox, Loading
 *
 * Usage:
 * <AddSubTask
 *   open={isModalOpen}
 *   setOpen={setIsModalOpen}
 *   id={parentTaskId}
 * />
 */
