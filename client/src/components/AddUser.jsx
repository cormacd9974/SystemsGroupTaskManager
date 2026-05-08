import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { useUpdateUserMutation } from "../redux/slices/api/userApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { Loading, ModalWrapper, Textbox } from "./";


const AddUser = ({ open, setOpen, userData }) => {
    const { user } = useSelector((state) => state.auth);
    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: userData ?? {} });
    const dispatch = useDispatch();
    const [addNewUser, { isLoading }] = useRegisterMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

    const handleOnSubmit = async (data) => {
        try {
            if (userData) {
                const res = await updateUser(data).unwrap();
                toast.success(res?.message);
                if (userData?._id === user?._id) {
                    dispatch(setCredentials({ ...res?.user }));
                }
            } else {
                await addNewUser({ ...data, isAdmin: data.isAdmin === "true", password: data?.email }).unwrap();
                toast.success("User added successfully");
            }
            setTimeout(() =>
                setOpen(false), 1500);
        } catch (err) {
            toast.error(err?.data?.message || "Something went wrong");
        }
    };

    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <form onSubmit={handleSubmit(handleOnSubmit)}>
                <h2 className="text-base font-bold text-gray-900 mb-4">
                    {userData ? "Edit User" : "Add User"}
                </h2>
                <div className="flex flex-col gap-5">
                    <Textbox
                        placeholder="Name"
                        type="text"
                        name="name"
                        label="Name"
                        className="w-full rounded-xl"
                        register={register("name", { required: "Name is required" })}
                        error={errors?.name?.message}
                    />
                    <Textbox
                        placeholder="Email"
                        type="email"
                        name="email"
                        label="Email"
                        className="w-full rounded-xl"
                        register={register("email", { required: "Email is required" })}
                        error={errors?.email?.message}
                    />
                    <div className="flex flex-col gap-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            {...register("isAdmin", { required: "Role is required" })}
                            className="w-full rounded-xl border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select Role</option>
                            <option value="true">Admin</option>
                            <option value="false">Team Member</option>
                        </select>
                        {errors?.isAdmin && <p className="text-red-500 text-sm mt-1">{errors.isAdmin.message}</p>}
                    </div>
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
                {isLoading || isUpdating ? (
                    <div className="py-4"><Loading /></div>
                ) : (
                    <div className="flex flex-row-reverse gap-3 mt-6">
                        <button type="submit" className="btn-primary px-8">
                            Submit
                        </button>
                        <button type="button"
                            onClick={() => setOpen(false)}
                            className="px-6 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100">
                            Cancel
                        </button>
                    </div>
                )}

            </form>
        </ModalWrapper>
    );
};

export default AddUser;