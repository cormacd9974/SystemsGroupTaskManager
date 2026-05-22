import { useForm } from "react-hook-form";
import { toast } from "sonner"
import { useChangePasswordMutation } from "../redux/slices/api/userApiSlice";
import { Loading, ModalWrapper, Textbox } from "./";

// Modal component for updating the current user's password
const ChangePassword = ({ open, setOpen }) => {
    // Initialize form handling and validation
    const { register, handleSubmit, formState: { errors } } = useForm();

    // Mutation hook for changing password
    const [changePassword, { isLoading }] = useChangePasswordMutation();

    // Handles form submission
    const handleOnSubmit = async (data) => {
        // Client-side check to ensure both password fields match
        if (data.password !== data.cpass) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            // Send password update request to the backend
            await changePassword(data).unwrap();
            toast.success("Password changed successfully");

            // Close modal after a short delay
            setTimeout(() => setOpen(false), 1500);
        } catch (err) {
            // Show API error message or fallback message
            toast.error(err?.data?.message || "Something went wrong");
        }
    };

    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <form onSubmit={handleSubmit(handleOnSubmit)}>
                {/* Modal title */}
                <h2 className="text-base font-bold text-gray-900 mb-4">
                    Change Password
                </h2>

                <div className="flex flex-col gap-5">
                    {/* New password input */}
                    <Textbox
                        placeholder="New Password"
                        type="password"
                        name="password"
                        label="New Password"
                        className="w-full rounded-xl"
                        register={register("password", { required: "New password is required" })}
                        error={errors?.password?.message}
                    />

                    {/* Confirm new password input */}
                    <Textbox
                        placeholder="Confirm New Password"
                        type="password"
                        name="cpass"
                        label="Confirm New Password"
                        className="w-full rounded-xl"
                        register={register("cpass", { required: "Please confirm your new password" })}
                        error={errors?.cpass?.message}
                    />
                </div>

                {/* Show loading spinner while request is in progress */}
                { isLoading ? (
                    <div className="py-4"><Loading /></div>
                ) : (
                    <div className="flex flex-row-reverse gap-3 mt-6">
                        <button type="submit" className="btn-primary px-8">
                            Change Password
                        </button>
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

// Export the ChangePassword component
export default ChangePassword;