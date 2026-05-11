import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateSubTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { Loading, ModalWrapper, Textbox } from "../";

const AddSubTask = ({ open, setOpen, id }) => {// id is the parent task id
    const {
        register, handleSubmit, formState: { errors },// reset
    } = useForm();// defaultValues: { title: "", date: "", tag: "" }

    const [addSubTask, { isLoading }] = useCreateSubTaskMutation();// isSuccess

    const handleOnSubmit = async(data) => {// reset() can be called here if needed to clear the form after submission
    try {
        const res = await addSubTask({ data, id }).unwrap();// Assuming the API returns a message on success
        toast.success(res.message);
        setTimeout(() => setOpen(false), 500);// Close the modal after a short delay to allow users to see the success message
    } catch (err) {
        toast.error(err?.data?.message || err.error);// Handle error response from the API
    }
};

return ( // The form is wrapped in a ModalWrapper component, which controls the visibility of the modal based on the 'open' prop. The 'setOpen' function is used to close the modal when needed.
    <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)}>
            <h2 className="text-base font-bold text-gray-900 mb-4">
                Add Sub-Task
            </h2>
            <div className="flex flex-col gap-5">
                <Textbox
                    placeholder="Sub-Task Title"
                    type="text"
                    name="title"
                    label="title"
                    className="w-full rounded-xl"
                    register={register("title", { required: "Title is required" })}
                    error={errors.title?.message}
                />
                <div>
                    <Textbox
                        placeholder="Date"
                        type="Date"
                        name="date"
                        label="date"
                        className="w-full rounded-xl"
                        register={register("date", { required: "The Date is required" })}
                        error={errors.date?.message}
                    />
                    <Textbox
                        placeholder="tag"
                        type="text"
                        name="tag"
                        label="tag"
                        className="w-full rounded-xl"
                        register={register("tag", { required: "Tag is required" })}
                        error={errors.tag?.message}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="p-4"><Loading /></div>
            ) : (
                <div className="flex flex-row-reverse gap-3 mt-6">
                    <button type="submit" className="btn-primary px-8">
                      Add
                    </button>
                    <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-6 py-2 rounded-xl border border-gray-200 text-sm font-mediumtext-gray-700 hover;bg-gray-50"
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
// This component allows users to add a sub-task to an existing task. 
// It uses the react-hook-form library for form handling and validation, 
// and the sonner library for displaying success and error messages. 
// The useCreateSubTaskMutation hook is used to send the new sub-task data to the server, 
// and the Loading component is displayed while the request is in progress.