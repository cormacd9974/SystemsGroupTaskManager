import { useForm } from "react-hook-form";
import { toast } from "sonner"
import { useChangePasswordMutation } from "../redux/slices/api/userApiSlice";
import { Loading, ModalWrapper, Textbox } from "./";

const ChangePassword = ({ open, setOpen }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [changePassword, { isLoading }] = useChangePasswordMutation();

    const handleOnSubmit = async (data) => {
        if (data.password !== data.cpass) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            await changePassword(data).unwrap();
            toast.success("Password changed successfully");
            setTimeout(() => setOpen(false), 1500);
        } catch (err) {
            toast.error(err?.data?.message || "Something went wrong");
        }
    };

    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <form onSubmit={handleSubmit(handleOnSubmit)}>
                <h2 className="text-base font-bold text-gray-900 mb-4">
                    Change Password
                </h2>
                <div className="flex flex-col gap-5">
                    <Textbox
                        placeholder="New Password"
                        type="password"
                        name="password"
                        label="New Password"
                        className="w-full rounded-xl"
                        register={register("password", { required: "New password is required" })}
                        error={errors?.password?.message}
                    />
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

export default ChangePassword;