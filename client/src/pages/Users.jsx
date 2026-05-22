import clsx from "clsx";
import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { HiPencil, HiTrash } from "react-icons/hi";
import { toast } from "sonner";
import { AddUser, ConfirmationDialog, Loading, Title, UserAction } from "../components";
import { useDeleteUserMutation, useGetTeamListsQuery, useUserActionMutation } from "../redux/slices/api/userApiSlice";
import { getInitials } from "../utils";
import { useSearchParams } from "react-router-dom";

// Team members management page
const Users = () => {
    // Read search query from URL
    const [searchParams] = useSearchParams();

    // Store current search term
    const [searchTerm] = useState(searchParams.get("search") || "");

    // Fetch team member list from API
    const { data, isLoading, refetch } = useGetTeamListsQuery({ search: searchTerm });

    // Mutation for deleting a user
    const [deleteUser] = useDeleteUserMutation();

    // Mutation for updating user active/inactive status
    const [userAction] = useUserActionMutation();

    // Controls delete confirmation dialog
    const [openDialog, setOpenDialog] = useState(false);

    // Controls add/edit user modal
    const [open, setOpen] = useState(false);

    // Controls active/inactive confirmation dialog
    const [openAction, setOpenAction] = useState(false);

    // Stores the selected user or user id depending on action
    const [selected, setSelected] = useState(null);

    // Open delete confirmation for a specific user
    const deleteClick = (id) => { setSelected(id); setOpenDialog(true); };

    // Open edit modal and load selected user data
    const editClick = (el) => { setSelected(el); setOpen(true); };

    // Open active/inactive confirmation modal
    const userStatusClick = (el) => { setSelected(el); setOpenAction(true); };

    // Handle user deletion
    const deleteHandler = async () => {
        try {
            const res = await deleteUser(selected);
            refetch();
            toast.success(res?.data?.message);
            setSelected(null);
            setTimeout(() => setOpenDialog(false), 500);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    // Handle toggling user active status
    const userActionHandler = async () => {
        try {
            const res = await userAction({ isActive: !selected?.isActive, id: selected?._id });
            refetch();
            toast.success(res?.data?.message);
            setSelected(null);
            setTimeout(() => setOpenAction(false), 500);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    // Refetch user list when add/edit modal changes
    useEffect(() => { refetch(); }, [open, refetch]);

    // Show loading state while team data is being fetched
    return isLoading ? (
        <div className="py-16 flex justify-center"><Loading /></div>
    ) : (
        <>
            <div className="space-y-4">
                {/* Page header and add member button */}
                <div className="flex items-center justify-between">
                    <div>
                        <Title title="Team Members" />
                        <p className="text-sm text-gray-400 mt-0.5">{data?.length || 0} members</p>
                    </div>
                    <button
                        onClick={() => setOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <IoMdAdd className="text-lg" />
                        <span>Add Member</span>
                    </button>
                </div>

                {/* Team members table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full data-table">
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Title</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.map((user, i) => (
                                    <tr key={i}>
                                        {/* Avatar + name */}
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {getInitials(user.name)}
                                                </div>
                                                <span className="font-medium text-gray-900 text-sm">{user.name}</span>
                                            </div>
                                        </td>

                                        {/* Job title */}
                                        <td className="text-gray-600 text-sm">{user.title}</td>

                                        {/* Email address */}
                                        <td className="text-gray-500 text-sm">{user.email}</td>

                                        {/* User role */}
                                        <td className="text-gray-600 text-sm">{user.role}</td>

                                        {/* Active/inactive toggle button */}
                                        <td>
                                            <button
                                                onClick={() => userStatusClick(user)}
                                                className={clsx(
                                                    "badge text-xs cursor-pointer",
                                                    user?.isActive
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                                        : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                                                )}
                                            >
                                                {user?.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>

                                        {/* Edit and delete actions */}
                                        <td>
                                            <div className="flex items-center gap-2 justify-end">
                                                <button
                                                    onClick={() => editClick(user)}
                                                    className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium"
                                                >
                                                    <HiPencil /> Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteClick(user?._id)}
                                                    className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-medium"
                                                >
                                                    <HiTrash /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit user modal */}
            <AddUser
                open={open}
                setOpen={setOpen}
                userData={selected}
                key={new Date().getTime().toString()}
            />

            {/* Delete confirmation dialog */}
            <ConfirmationDialog
                open={openDialog}
                setOpen={setOpenDialog}
                onClick={deleteHandler}
            />

            {/* Activate/deactivate user confirmation */}
            <UserAction
                open={openAction}
                setOpen={setOpenAction}
                onClick={userActionHandler}
            />
        </>
    );
};

export default Users;