
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateSubTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { Loading, ModalWrapper, Textbox } from "../";
import { useState } from "react";

const SUGGESTIONS = ["Review", "Implement", "Test", "Document", "Validate", "Update", "Deploy", "Approve", "Draft", "Verify", "Sign-off"];

const AddSubTask = ({ open, setOpen, id }) => {
    const {
        register, handleSubmit, formState: { errors }, setValue
    } = useForm();
    const [titleInput, setTitleInput] = useState("");

    const [addSubTask, { isLoading }] = useCreateSubTaskMutation();

    const handleOnSubmit = async (data) => {
        try {
            if (data.date && new Date(data.date) < new Date()) {
                toast.error("Sub task date cannot come before task start date");
                return;
            }
            const res = await addSubTask({ data, id }).unwrap();
            toast.success(res.message);
            setTimeout(() => setOpen(false), 500);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const filtered = SUGGESTIONS.filter(s =>
        titleInput.length > 0 && s.toLowerCase().includes(titleInput.toLowerCase())
    );

    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <form onSubmit={handleSubmit(handleOnSubmit)}>
                <h2 className="text-base font-bold text-gray-900 mb-4">
                    Add Sub-Task
                </h2>

                <div className="flex flex-col gap-5">
                    {/* Title with suggestions */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
                        <input
                            type="text"
                            placeholder="Sub-Task Title"
                            autoComplete="off"
                            className="input-field"

                            {...register("title", {
                                required: "Title is required",
                                onChange: e => setTitleInput(e.target.value)
                            })}
                        />
                        {errors.title && <span className="text-xs text-red-500 mt-0.5">{errors.title.message}</span>}
                        {filtered.length > 0 && (
                            <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                                {filtered.map((s, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => { setValue("title", s); setTitleInput(""); }}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

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

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Description
                            <span className="text-gray-400"> (optional)</span>
                        </label>
                        <textarea
                            {...register("description")}
                            rows={3}
                            placeholder="Add details..."
                            className="input-field resize-none w-full mt-1"
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
                            className="px-6 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
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