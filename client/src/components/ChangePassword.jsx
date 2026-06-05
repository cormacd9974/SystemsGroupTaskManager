// Form handling and validation library
import { useForm } from "react-hook-form";
// Toast notifications for user feedback
import { toast } from "sonner";
// Redux mutation hook for password change API operation
import { useChangePasswordMutation } from "../redux/slices/api/userApiSlice";
// Reusable UI components
import { Loading, ModalWrapper, Textbox } from "./";

/**
 * ChangePassword Component
 *
 * A secure modal component that allows users to update their account password.
 * This component provides a simple, user-friendly interface for password changes
 * with client-side validation and server-side processing.
 *
 * Key Features:
 * - Password confirmation validation (client-side)
 * - Form validation with react-hook-form
 * - Secure password input fields (masked)
 * - Loading states during API operations
 * - Toast notifications for success/error feedback
 * - Modal overlay for focused user interaction
 * - Automatic modal closure on successful change
 *
 * Security Considerations:
 * - Passwords are masked during input
 * - Client-side confirmation matching before API call
 * - Server-side validation and authentication
 * - No password storage in component state
 *
 * @param {boolean} open - Controls modal visibility state
 * @param {function} setOpen - Function to toggle modal open/closed
 */
const ChangePassword = ({ open, setOpen }) => {
  // Initialize form handling and validation with react-hook-form
  const {
    register, // Register form inputs for validation
    handleSubmit, // Handle form submission with validation
    formState: { errors }, // Form validation errors
  } = useForm();

  // Mutation hook for changing password via API
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  /**
   * Form submission handler
   *
   * Processes the password change request with the following steps:
   * 1. Client-side validation to ensure passwords match
   * 2. API call to update password on server
   * 3. Success/error feedback to user
   * 4. Modal closure on successful change
   *
   * @param {Object} data - Form data from react-hook-form
   * @param {string} data.password - New password entered by user
   * @param {string} data.cpass - Confirmation password for validation
   */
  const handleOnSubmit = async (data) => {
    // CLIENT-SIDE VALIDATION: Ensure both password fields match
    // This prevents unnecessary API calls for mismatched passwords
    if (data.password !== data.cpass) {
      toast.error("Passwords do not match");
      return; // Exit early if passwords don't match
    }

    try {
      // Send password update request to the backend
      // The API will handle authentication and password hashing
      await changePassword(data).unwrap();

      // Show success message to user
      toast.success("Password changed successfully");

      // Close modal after a short delay to allow user to see success message
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      // Show API error message or fallback message for any server errors
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    // Modal wrapper handles backdrop, positioning, and close behavior
    <ModalWrapper open={open} setOpen={setOpen}>
      {/* Main form with submission handler */}
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        {/* Modal title */}
        <h2 className="text-base font-bold text-gray-900 mb-4">
          Change Password
        </h2>

        {/* Form fields container with consistent spacing */}
        <div className="flex flex-col gap-5">
          {/* NEW PASSWORD INPUT */}
          <Textbox
            placeholder="New Password"
            type="password" // Masks input for security
            name="password"
            label="New Password"
            className="w-full rounded-xl"
            register={register("password", {
              required: "New password is required",
            })}
            error={errors?.password?.message}
          />

          {/* CONFIRM PASSWORD INPUT */}
          <Textbox
            placeholder="Confirm New Password"
            type="password" // Masks input for security
            name="cpass"
            label="Confirm New Password"
            className="w-full rounded-xl"
            register={register("cpass", {
              required: "Please confirm your new password",
            })}
            error={errors?.cpass?.message}
          />
        </div>

        {/* FORM ACTIONS - Conditional rendering based on loading state */}
        {isLoading ? (
          // Show loading spinner while password change request is in progress
          <div className="py-4">
            <Loading />
          </div>
        ) : (
          // Show action buttons when not loading
          <div className="flex flex-row-reverse gap-3 mt-6">
            {/* Submit button to change password */}
            <button type="submit" className="btn-primary px-8">
              Change Password
            </button>

            {/* Cancel button - closes modal without saving changes */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-6 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

// Export the ChangePassword component for use throughout the application
export default ChangePassword;

/**
 * COMPONENT SUMMARY
 *
 * The ChangePassword component provides a secure and user-friendly interface
 * for password updates with comprehensive validation and feedback.
 *
 * KEY FEATURES:
 * - Secure Password Input: Masked password fields for privacy
 * - Client-Side Validation: Immediate feedback for password confirmation
 * - Form Validation: Required field validation with error messages
 * - Loading States: Visual feedback during API operations
 * - Success Feedback: Toast notifications and automatic modal closure
 * - Error Handling: Comprehensive error display for various failure scenarios
 *
 * SECURITY MEASURES:
 * - Password masking during input to prevent shoulder surfing
 * - Client-side confirmation matching to reduce server load
 * - No password storage in component state or memory
 * - Server-side authentication and validation
 * - Secure API communication for password updates
 *
 * USER EXPERIENCE:
 * - Simple two-field interface (new password + confirmation)
 * - Clear validation messages for user guidance
 * - Loading states prevent multiple submissions
 * - Success feedback with automatic closure
 * - Cancel option for easy exit without changes
 *
 * USAGE EXAMPLE:
 * ```jsx
 * const [showChangePassword, setShowChangePassword] = useState(false);
 *
 * <ChangePassword
 *   open={showChangePassword}
 *   setOpen={setShowChangePassword}
 * />
 * ```
 *
 * INTEGRATION POINTS:
 * - Redux API integration for password change operations
 * - Toast notification system for user feedback
 * - Modal system for overlay presentation
 * - Form validation system for input handling
 *
 * ACCESSIBILITY CONSIDERATIONS:
 * - Proper form labeling for screen readers
 * - Keyboard navigation support
 * - Clear error messaging
 * - Focus management within modal
 */
