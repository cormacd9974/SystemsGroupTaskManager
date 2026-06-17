// Form handling and validation library
import { useForm } from "react-hook-form";
// Redux hooks for state management and dispatching actions
import { useDispatch, useSelector } from "react-redux";
// Toast notifications for user feedback
import { toast } from "sonner";
// Redux mutation hooks for user operations
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { useUpdateUserMutation } from "../redux/slices/api/userApiSlice";
// Redux action for updating authentication state
import { setCredentials } from "../redux/slices/authSlice";
// Reusable UI components
import { Loading, ModalWrapper, Textbox } from "./";

/**
 * AddUser Component
 *
 * A dual-purpose modal component for both adding new users and editing existing ones.
 * The component automatically detects the mode based on whether userData is provided.
 *
 * Key Features:
 * - Form validation with react-hook-form
 * - Dual mode operation (add/edit) with single component
 * - Role-based user creation (admin vs team member)
 * - Auto-generated passwords for new users (uses email as default)
 * - Self-profile update detection and Redux state refresh
 * - Loading states during API operations
 * - Toast notifications for success/error feedback
 *
 * @param {boolean} open - Controls modal visibility
 * @param {function} setOpen - Function to toggle modal open/closed
 * @param {Object|null} userData - Existing user data for editing (null for new user)
 * @param {string} userData._id - User ID for updates
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {boolean} userData.isAdmin - Whether user has admin privileges
 * @param {string} userData.title - User's job title/position
 */
const AddUser = ({ open, setOpen, userData }) => {
  // Get currently logged-in user from Redux store for self-update detection
  const { user } = useSelector((state) => state.auth);

  // Initialize form with existing user data when editing, empty object for new users
  const {
    register, // Register form inputs for validation
    handleSubmit, // Handle form submission with validation
    reset, // Reset form to default values
    formState: { errors }, // Form validation errors
  } = useForm({
    defaultValues: userData ?? {}, // Pre-populate form when editing existing user
  });

  // Redux dispatch function for updating global state
  const dispatch = useDispatch();

  // Mutation hook for registering a new user
  const [addNewUser, { isLoading }] = useRegisterMutation();

  // Mutation hook for updating an existing user
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  /**
   * Form submission handler for both add and edit operations
   *
   * Handles two distinct workflows:
   * 1. Edit Mode: Updates existing user and refreshes auth state if self-editing
   * 2. Add Mode: Creates new user with auto-generated password and role assignment
   *
   * @param {Object} data - Form data from react-hook-form
   * @param {string} data.name - User's full name
   * @param {string} data.email - User's email address
   * @param {string} data.isAdmin - String representation of admin status ("true"/"false")
   * @param {string} data.title - User's job title
   */
  const handleOnSubmit = async (data) => {
    try {
      if (userData) {
        // EDIT MODE: Update existing user
        const res = await updateUser(data).unwrap();
        toast.success(res?.message);

        // SELF-UPDATE DETECTION: If the logged-in user edited their own profile,
        // refresh the Redux auth state to reflect the changes immediately
        if (userData?._id === user?._id) {
          dispatch(setCredentials({ ...user, ...res?.user }));
        }
      } else {
        // ADD MODE: Create a new user
        await addNewUser({
          ...data,
          // Convert string "true"/"false" to boolean for isAdmin
          isAdmin: data.isAdmin === "true",
          // Derive role from admin status (admin or user)
          role: data.isAdmin === "true" ? "admin" : "user",
          // Set default password to user's email (should be changed on first login)
          password: data?.email,
        }).unwrap();
        toast.success("User added successfully");
      }

      // Close modal after a short delay to allow user to see success message
      setTimeout(() => setOpen(false), 1500);

      // Reset form to clean state for next use
      reset({ name: "", email: "", isAdmin: "", title: "" });
    } catch (err) {
      // Show error message from API response or fallback message
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    // Modal wrapper handles backdrop, positioning, and close behavior
    <ModalWrapper open={open} setOpen={setOpen}>
      {/* Main form with submission handler */}
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        {/* Dynamic modal title based on add vs edit mode */}
        <h2 className="text-base font-bold text-gray-900 mb-4">
          {userData ? "Edit User" : "Add User"}
        </h2>

        {/* Form fields container with consistent spacing */}
        <div className="flex flex-col gap-5">
          {/* USER NAME INPUT */}
          <Textbox
            placeholder="Name"
            type="text"
            name="name"
            label="Name"
            className="w-full rounded-xl"
            register={register("name", { required: "Name is required" })}
            error={errors?.name?.message}
          />

          {/* USER EMAIL INPUT */}
          <Textbox
            placeholder="Email"
            type="email"
            name="email"
            label="Email"
            className="w-full rounded-xl"
            register={register("email", { required: "Email is required" })}
            error={errors?.email?.message}
          />

          {/* ROLE SELECTION DROPDOWN */}
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              {...register("isAdmin", { required: "Role is required" })}
              className="w-full rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Role</option>
              <option value="true">Admin</option> {/* Full system access */}
              <option value="false">Team Member</option> {/* Limited access */}
            </select>
            {/* Display validation error for role selection */}
            {errors?.isAdmin && (
              <p className="text-red-500 text-sm mt-1">
                {errors.isAdmin.message}
              </p>
            )}
          </div>

          {/* USER TITLE/JOB POSITION INPUT */}
          <Textbox
            placeholder="Title"
            type="text"
            name="title"
            label="Title"
            className="w-full rounded-xl"
            register={register("title", { required: "Title is required" })}
            error={errors?.title?.message}
          />
        </div>

        {/* FORM ACTIONS - Conditional rendering based on loading state */}
        {isLoading || isUpdating ? (
          // Show loading spinner during API operations
          <div className="py-4">
            <Loading />
          </div>
        ) : (
          // Show action buttons when not loading
          <div className="flex flex-row-reverse gap-3 mt-6">
            {/* Submit button */}
            <button type="submit" className="btn-primary px-8">
              Submit
            </button>

            {/* Cancel button - closes modal without saving */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-6 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

// Export the AddUser component for use throughout the application
export default AddUser;

/**
 * COMPONENT SUMMARY
 *
 * The AddUser component provides a comprehensive user management interface that
 * handles both user creation and editing within a single, reusable component.
 *
 * KEY FEATURES:
 * - Dual Mode Operation: Automatically detects add vs edit based on userData prop
 * - Form Validation: Uses react-hook-form for robust input validation
 * - Role Management: Dropdown selection for admin vs team member roles
 * - Self-Update Detection: Refreshes auth state when users edit their own profiles
 * - Auto-Password Generation: Uses email as default password for new users
 * - Loading States: Visual feedback during API operations
 * - Error Handling: Comprehensive error display and user feedback
 *
 * SECURITY CONSIDERATIONS:
 * - Default passwords should be changed on first login
 * - Role changes are immediately reflected in the system
 * - Self-profile updates maintain session consistency
 *
 * UX DESIGN:
 * - Clear visual distinction between add and edit modes
 * - Consistent form validation and error messaging
 * - Loading states prevent multiple submissions
 * - Success feedback with automatic modal closure
 *
 * USAGE PATTERNS:
 * - New User: <AddUser open={true} setOpen={setOpen} userData={null} />
 * - Edit User: <AddUser open={true} setOpen={setOpen} userData={userObject} />
 *
 * INTEGRATION POINTS:
 * - Redux state management for authentication
 * - API integration for user CRUD operations
 * - Toast notifications for user feedback
 * - Modal system for overlay presentation
 */
