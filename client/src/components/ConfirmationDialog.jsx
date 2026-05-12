import clsx from 'clsx';
import { HiExclamation, HiRefresh } from 'react-icons/hi';
import ModalWrapper from './ModalWrapper';

export default function ConfirmationDialog({ 
    open,
    setOpen, 
    msg, 
    onClick = () => {}, 
    type = "delete",
    setMsg = () => {},
    setType = () => {},
}) {
    const closeDialog = () => {
        setOpen(false);
        setMsg("");
        setType("delete");
    }

    const isRestore = type === "restore" || type === "restoreAll";

    return (
        <ModalWrapper open={open} setOpen={closeDialog}>
            <div className='flex flex-col items-center gap-4 py-2'>
                <div className={clsx(
                    "w-16 h-16 rounded-2xl flex items-center justify-center",
                    isRestore ? "bg-amber-50 text-amber-600" : "bg-red-100 text-red-600"
                )}>
                    {isRestore 
                    ? <HiRefresh className='text-amber-500 text-3xl'/> 
                    : <HiExclamation className='text-red-500 text-3xl'/>}
                </div>

                <div className='text-center'>
                    <h3 className='text-base font-bold text-gray-900 mb-1'>
                        {isRestore ? "Restore Task(s)" : "Delete Task(s)?"}
                    </h3>
                    <p className='text-sm text-gray-500'>
                        {msg ?? "Are you sure you want to proceed with this action?"}
                    </p>
                </div>

                <div className='flex gap-3 w-full pt-2'>
                    <button
                        onClick={closeDialog}
                        className='flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClick}
                        className={clsx(
                            "flex-1 py-2 rounded-lg text-white transition-colors",
                            isRestore ? "bg-amber-500 hover:bg-amber-600" : "bg-red-500 hover:bg-red-600"
                        )}
                    >
                        {isRestore ? "Restore" : "Delete"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
}

export function UserAction({
    open,
    setOpen,
    onClick
}) {
    return (
        <ModalWrapper open={open} setOpen={() => setOpen(false)}>
            <div className='flex flex-col items-center gap-4 py-2'>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600">
                    <HiExclamation className='text-blue-500 text-3xl'/>
                </div>

                <div className='text-center'>
                    <h3 className='text-base font-bold text-gray-900 mb-1'>
                        Change Account Status
                    </h3>
                    <p className='text-sm text-gray-500'>
                        Please confirm this action before proceeding.
                    </p>
                </div>

                <div className='flex gap-3 w-full pt-2'>
                    <button
                        onClick={() => setOpen(false)}
                        className='flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClick}
                        className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-[#005a9e] text-white transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
}
