import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateSubTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { Loading, ModalWrapper, Textbox } from "../";

const AddSubTask = ({ open, setOpen, id }) => {
    const {
        register, handleSubmit, formState: { errors },
    } = useForm();

    const [addSubTask, { isLoading }] = useCreateSubTaskMutation();

    const handleOnSubmit = async(data) => {
    try {
        const res = await addSubTask({ data, id }).unwrap();
        toast.success(res.message);
        setTimeout(() => setOpen(false), 500);
    } catch (err) {
        toast.error(err?.data?.message || err.error);
    }
};

return (
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