import ModalWrapper from "./ModalWrapper";
import { Button } from "@headlessui/react";

// ViewNotification component shows the details of a notification inside a modal
const ViewNotification = ({ open, setOpen, el }) => {
    return (
        // ModalWrapper handles the modal container and open/close behavior
        <ModalWrapper open={open} setOpen={setOpen}>
            {/* Layout container for notification content */}
            <div className="flex flex-col gap-4">
                {/* Notification/task title */}
                <h3 className="text-lg font-bold text-gray-900">{el?.task?.title}</h3>

                {/* Notification message text */}
                <p className="text-sm text-gray-500">{el?.text}</p>

                {/* Button aligned to the right */}
                <div className="flex justify-end">
                    <Button
                        type="button"
                        // Close the modal when the button is clicked
                        onClick={() => setOpen(false)}
                        label="Ok"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default ViewNotification;