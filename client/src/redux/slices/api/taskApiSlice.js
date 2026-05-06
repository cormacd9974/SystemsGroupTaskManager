import { USERS_URL } from "../../../utils/contants";
import { TASKS_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

export const taskApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createTask: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/create`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),
         updateTask: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/update/${data._id}`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
        }),
         duplicateTask: builder.mutation({
           query: (id) => ({
                url: `${TASKS_URL}/duplicate/${id}`,
                method: "POST",
                body: {},
                credentials: "include",
            }),
        }),
         getAllTask: builder.query({
           query: ({ strQuery, isTrashed, search }) => ({
                url: `${TASKS_URL}?stage=${strQuery}&isTrashed=${isTrashed}&search=${search}`,
                method: "GET",
                credentials: "include",
            }),
        }),
         getSingleTask: builder.query({
           query: (id) => ({
                url: `${TASKS_URL}/${id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
         getTaskHistory: builder.query({
           query: () => ({
                url: `${TASKS_URL}/history`,
                method: "GET",
                credentials: "include",
            }),
        }),
         getDashboardStats: builder.query({
           query: () => ({
                url: `${TASKS_URL}/dashboard`,
                method: "GET",
                credentials: "include",
            }),
        }),
         createSubTask: builder.mutation({
           query: ({ data, id }) => ({
                url: `${TASKS_URL}/create-subtask/${id}`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
        }),
         postTaskActivity: builder.mutation({
           query: ({ data, id }) => ({
                url: `${TASKS_URL}/activity/${id}`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),
         trashTask: builder.mutation({
           query: ({ id }) => ({
                url: `${TASKS_URL}/${id}`,
                method: "PUT",
                credentials: "include",
            }),
        }),
         deleteRestoreTask: builder.mutation({
           query: ({ id, actionType }) => ({
                url: `${TASKS_URL}/delete-restore/${id}?actionType=${actionType}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
         
        changeTaskStage: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/change-stage/${data?.id}`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
        }),
         changeSubTaskStatus: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/change-stage/${data?.id}/${data?.subId}`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
        }),
    }),
});

export const { 
    useCreateTaskMutation,
    useUpdateTaskMutation,
    useDuplicateTaskMutation,
    useGetAllTaskQuery,
    useGetSingleTaskQuery,
    useGetTaskHistoryQuery,
    useGetDashboardStatsQuery,
    useCreateSubTaskMutation,
    usePostTaskActivityMutation,
    useTrashTaskMutation,
    useDeleteRestoreTaskMutation,
    useChangeTaskStageMutation,
    useChangeSubTaskStatusMutation,
} = taskApiSlice;