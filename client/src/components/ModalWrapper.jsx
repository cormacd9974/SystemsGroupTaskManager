import { Dialog, DialogPanel, Transition, TransitionChild} from "@headlessui/react";
import { Fragment, useRef } from "react";

const ModalWrapper = ({ open, setOpen, children }) => {
    const cancelButtonRef = useRef(null);

    return (
        <Transition show={open} as={Fragment}>
            <Dialog
            as="div"
            className="relative z-10"
            initialFocus={cancelButtonRef}
            onClose={() => setOpen(false)}
            >
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 modal-overlay"/>
                </TransitionChild>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                           <DialogPanel className="w-full relative transform overflow-visable rounded-2xl bg-white shadow-2xl sm:my-8 sm:max-w-lg border border-gray-100">
                            <div className="bg-white px-6 py-6 overflow-visible">
                                {children}
                            </div>
                           </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ModalWrapper;