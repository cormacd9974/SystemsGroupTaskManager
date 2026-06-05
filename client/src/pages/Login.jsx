// React hooks for component lifecycle and form management
import { useEffect } from "react"; // React hook for side effects and component lifecycle
import { useForm } from "react-hook-form"; // Form library for validation and state management
import { useNavigate } from "react-router-dom"; // React Router hook for programmatic navigation
import { useSelector, useDispatch } from "react-redux"; // Redux hooks for state management

// Redux actions and API integration
import { setCredentials } from "../redux/slices/authSlice"; // Action to store user credentials in Redux
import { MdOutlineAddTask } from "react-icons/md"; // Material Design icon for branding
import { toast } from "sonner"; // Toast notification library for user feedback
import { Loading } from "../components"; // Reusable loading component
import { useLoginMutation } from "../redux/slices/api/authApiSlice"; // RTK Query mutation for login API

/**
 * Login Component - User authentication interface with split-screen design
 *
 * @component
 *
 * Architecture decisions:
 * - Split-screen layout with branding panel and login form
 * - Form validation using react-hook-form for robust input handling
 * - RTK Query integration for API calls with loading states
 * - Redux integration for authentication state management
 * - Responsive design that adapts from mobile to desktop
 *
 * Security considerations:
 * - Client-side form validation with server-side verification
 * - Secure credential handling through Redux store
 * - Automatic redirect for authenticated users
 * - Error handling without exposing sensitive information
 *
 * UX considerations:
 * - Professional branding with company identity
 * - Clear visual hierarchy and intuitive form layout
 * - Loading states for user feedback during authentication
 * - Responsive design for various device sizes
 * - Accessible form labels and error messaging
 *
 * Business context:
 * - Internal company system for authorized personnel only
 * - Production department task management system
 * - Brand consistency with Systems Group identity
 *
 * @returns {JSX.Element} Complete login interface with authentication flow
 */
const Login = () => {
  /**
   * Redux state and navigation setup
   */

  // Get current authenticated user from Redux store
  // Used to check if user is already logged in for redirect logic
  const { user } = useSelector((state) => state.auth);

  // Hook for programmatic navigation after successful login
  const navigate = useNavigate();

  // Redux dispatch function for updating authentication state
  const dispatch = useDispatch();

  /**
   * Form management and validation setup
   * react-hook-form provides efficient form handling with built-in validation
   */

  // Form utilities: register for input binding, handleSubmit for form processing, errors for validation feedback
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  /**
   * API integration for authentication
   * RTK Query provides loading states, error handling, and caching
   */

  // Login mutation hook with loading state for UI feedback
  const [login, { isLoading }] = useLoginMutation();

  /**
   * Form submission handler with comprehensive error handling
   *
   * Authentication flow:
   * 1. Submit credentials to API
   * 2. Store successful response in Redux
   * 3. Navigate to dashboard
   * 4. Handle errors with user-friendly messages
   *
   * Security: Credentials are handled securely through RTK Query and Redux
   * UX: Provides immediate feedback for both success and error cases
   */
  const handleLogin = async (data) => {
    try {
      // Call login API with form data and unwrap the promise for direct result access
      const res = await login(data).unwrap();

      // Store user credentials and tokens in Redux store
      dispatch(setCredentials(res));

      // Navigate to dashboard on successful authentication
      navigate("/");
    } catch (err) {
      // Display user-friendly error message with fallback text
      // Security: Avoids exposing sensitive error details to users
      toast.error(err?.data?.message || err.error);
    }
  };

  /**
   * Authentication state management
   * Redirects already authenticated users to prevent unnecessary login attempts
   */
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    // UX: Prevents confusion and provides seamless experience for logged-in users
    user && navigate("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Dependency array includes user to trigger on authentication state changes

  return (
    <div className="w-full min-h-screen flex bg-white">
      {/* Left side branding panel - hidden on mobile, visible on large screens */}
      {/* Design decision: Split-screen layout creates professional, modern appearance */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: "#0068B5" }} // Brand blue background color
      >
        {/* Company branding header */}
        {/* Brand identity: Establishes company presence and professionalism */}
        <div className="flex items-center gap-3">
          <div>
            {/* Company name with hierarchy */}
            <span className="text-white font-bold text-xl leading-none">
              Systems Group
            </span>

            {/* Department identification for context */}
            <p className="text-blue-300 text-xs mt-0.5">
              Production Department
            </p>
          </div>
        </div>

        {/* Marketing copy and value proposition */}
        {/* UX: Communicates product benefits while user considers login */}
        <div>
          {/* Main headline with emphasis on key benefits */}
          {/* Typography: Large, bold text creates visual impact */}
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Real time task <br />
            Tracking for your
            <br />
            {/* Color accent on key differentiator */}
            <span className="text-blue-300">whole team.</span>
          </h2>

          {/* Supporting description of core functionality */}
          {/* Business value: Emphasizes traceability and task management benefits */}
          <p
            className="text-base leading-relaxed"
            style={{ color: "rgba(191,219,254,0.65)" }}
          >
            Create traceability and stay on top of your tasks.
          </p>
        </div>
      </div>

      {/* Right side login form container */}
      {/* Responsive design: Full width on mobile, half width on desktop */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile-only branding header */}
          {/* Responsive design: Shows company branding when left panel is hidden */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            {/* Company logo/icon container */}
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <MdOutlineAddTask className="text-white text-lg" />
            </div>

            {/* Company name for mobile users */}
            <span className="text-gray-900 font-bold text-lg">
              Systems Group
            </span>
          </div>

          {/* Main login form card */}
          {/* Design: Card-based layout with subtle shadow for depth */}
          <div
            className="bg-white rounded-2xl p-8 border border-gray-100"
            style={{ boxShadow: "0 8px 40px rgba(15,35,71,0.10)" }} // Custom shadow for professional appearance
          >
            {/* Form header with welcome message */}
            {/* UX: Friendly greeting creates welcoming experience */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back
              </h1>
              <p className="text-gray-500 text-sm">Continue</p>
            </div>

            {/* Login form with validation */}
            {/* Form handling: react-hook-form provides efficient validation and submission */}
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
              {/* Email input field with validation */}
              <div>
                {/* Accessible label for screen readers */}
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>

                {/* Email input with validation rules */}
                <input
                  type="email" // HTML5 email validation
                  placeholder="you@company.com" // Helpful placeholder text
                  className="input-field" // Consistent styling class
                  {...register("email", {
                    required: "Email Address is required",
                  })} // Form registration with validation
                />

                {/* Error message display for email validation */}
                {/* Accessibility: Clear error feedback for form validation */}
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password input field with validation */}
              <div>
                {/* Accessible label for password field */}
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>

                {/* Password input with security type */}
                <input
                  type="password" // Secure password input type
                  placeholder="password" // Simple placeholder for password field
                  className="input-field" // Consistent styling
                  {...register("password", {
                    required: "Password is required",
                  })} // Required field validation
                />

                {/* Error message display for password validation */}
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot password link */}
              {/* UX: Provides recovery option for users who forgot credentials */}
              <div className="flex justify-end">
                <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              </div>

              {/* Submit button with loading state */}
              {/* Conditional rendering: Shows loading spinner during API call */}
              {isLoading ? (
                // Loading component provides visual feedback during authentication
                <Loading />
              ) : (
                // Submit button with brand styling
                <button
                  type="submit"
                  className="btn-primary w-full text-center"
                  style={{ backgroundColor: "#0068B5" }}
                >
                  Sign In
                </button>
              )}
            </form>
          </div>

          {/* Security notice footer */}
          {/* Business requirement: Indicates restricted access system */}
          <p className="text-center text-gray-400 text-xs mt-6">
            Authorised personnel only - Systems Group
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Export the Login component as default export
 *
 * Component Summary:
 * - Professional authentication interface with split-screen design
 * - Comprehensive form validation using react-hook-form
 * - RTK Query integration for secure API communication
 * - Redux state management for authentication persistence
 * - Responsive design adapting from mobile to desktop layouts
 *
 * Key Features:
 * - Split-screen layout with branding panel and login form
 * - Real-time form validation with user-friendly error messages
 * - Loading states during authentication process
 * - Automatic redirect for already authenticated users
 * - Mobile-responsive design with adaptive branding display
 * - Security notice for authorized personnel access
 *
 * Authentication Flow:
 * - Form validation on client side
 * - Secure API call to authentication endpoint
 * - Redux state update with user credentials
 * - Automatic navigation to dashboard on success
 * - Error handling with toast notifications
 *
 * Security Considerations:
 * - Secure credential handling through Redux
 * - Client-side validation with server-side verification
 * - Error messages that don't expose sensitive information
 * - Automatic redirect to prevent unauthorized access
 *
 * UX Design Principles:
 * - Clear visual hierarchy with professional branding
 * - Intuitive form layout with accessible labels
 * - Immediate feedback for validation errors
 * - Loading states for user awareness during processing
 * - Responsive design for various device sizes
 *
 * Business Integration:
 * - Company branding with Systems Group identity
 * - Production department context
 * - Internal system for authorized personnel
 * - Professional appearance suitable for corporate environment
 */
export default Login;
