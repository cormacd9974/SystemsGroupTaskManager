import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { useUpdateUserMutation } from "../redux/slices/api/userApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { Loading, ModalWrapper, Textbox } from "./";


// Component for adding a new user or editing an existing user
const AddUser = ({ open, setOpen, userData }) => {
    // Get currently logged-in user from Redux store
    const { user } = useSelector((state) => state.auth);

    // Initialize form with existing user data when editing
    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: userData ?? {} });

    // Redux dispatch function
    const dispatch = useDispatch();

    // Mutation hook for registering a new user
    const [addNewUser, { isLoading }] = useRegisterMutation();

    // Mutation hook for updating an existing user
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

    // Handles both add-user and edit-user form submission
    const handleOnSubmit = async (data) => {
        try {
            if (userData) {
                // Update existing user
                const res = await updateUser(data).unwrap();
                toast.success(res?.message);

                // If the logged-in user edited their own profile, refresh Redux auth state
                if (userData?._id === user?._id) {
                    dispatch(setCredentials({ ...res?.user }));
                }
            } else {
                // Create a new user
                // isAdmin is converted from string to boolean
                // role is derived from isAdmin
                // default password is set to the user's email
                await addNewUser({ ...data, isAdmin: data.isAdmin === "true", role: data.isAdmin === "true" ? "admin" : "user", password: data?.email }).unwrap();
                toast.success("User added successfully");
            }

            // Close modal after a short delay
            setTimeout(() =>
                setOpen(false), 1500);
        } catch (err) {
            // Show fallback error if API response does not provide one
            toast.error(err?.data?.message || "Something went wrong");
        }
    };

    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <form onSubmit={handleSubmit(handleOnSubmit)}>
                {/* Modal title changes depending on whether this is add or edit mode */}
                <h2 className="text-base font-bold text-gray-900 mb-4">
                    {userData ? "Edit User" : "Add User"}
                </h2>

                <div className="flex flex-col gap-5">
                    {/* User name input */}
                    <Textbox
                        placeholder="Name"
                        type="text"
                        name="name"
                        label="Name"
                        className="w-full rounded-xl"
                        register={register("name", { required: "Name is required" })}
                        error={errors?.name?.message}
                    />

                    {/* User email input */}
                    <Textbox
                        placeholder="Email"
                        type="email"
                        name="email"
                        label="Email"
                        className="w-full rounded-xl"
                        register={register("email", { required: "Email is required" })}
                        error={errors?.email?.message}
                    />

                    {/* Role selection */}
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

                    {/* User title/job title input */}
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

                {/* Show loading spinner while submitting */}
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

// Export the AddUser component
export default AddUser;