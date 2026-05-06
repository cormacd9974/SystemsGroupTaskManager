import ModalWrapper from "./ModalWrapper";
import { Button } from "@headlessui/react";

const ViewNotification = ({ open, setOpen, el }) => {
    <ModalWrapper open={open} setOpen={setOpen}>
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-gray-900">{el?.task?.title}</h3>
            <p className="text-sm text-gray-500">{el?.text}</p>
            <div className="flex justify-end">
                <Button
                    type = "button"
                    onClick={() => setOpen(false)}
                    label="Ok"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Close
                </Button>
            </div>
        </div>
    </ModalWrapper>
};

export default ViewNotification;