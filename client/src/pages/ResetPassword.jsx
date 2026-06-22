import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useResetPasswordMutation } from "../redux/slices/api/authApiSlice";
import { Loading } from "../components";

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const onSubmit = async (data) => {
    try {
      const res = await resetPassword({
        token,
        password: data.password,
      }).unwrap();
      toast.success(res.message);
      navigate("/log-in");
    } catch (err) {
      toast.error(err?.data?.message || "Invalid or expired link.");
    }
  };

  if (!token)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Invalid reset link.</p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#0068B5] mb-2">
          Reset Password
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your new password below.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0068B5]"
              placeholder="Min. 6 characters"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Min 6 characters" },
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0068B5]"
              placeholder="Repeat password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) =>
                  val === watch("password") || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
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
              Reset Password
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
