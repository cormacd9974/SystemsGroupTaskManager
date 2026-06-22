import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useForgotPasswordMutation } from "../redux/slices/api/authApiSlice";
import { Loading } from "../components";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (data) => {
    try {
      const res = await forgotPassword(data).unwrap();
      toast.success(res.message);
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#0068B5] mb-2">
          Forgot Password
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email and we'll send you a reset link.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0068B5]"
              placeholder="you@intel.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          {isLoading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full bg-[#0068B5] text-white py-2 rounded-lg font-semibold hover:bg-[#0057a0] transition"
            >
              Send Reset Link
            </button>
          )}
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/log-in" className="text-[#0068B5] hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
