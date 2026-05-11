//import { USERS_URL } from "../../../utils/contants";
import { TASKS_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

export const taskApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createTask: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/create`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Tasks", "Users"],
        }),
         updateTask: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/update/${data._id}`,
                method: "PUT",
                body: data,
              
            }),
            invalidatesTags: ["Tasks"],
        }),
         duplicateTask: builder.mutation({
           query: (id) => ({
                url: `${TASKS_URL}/duplicate/${id}`,
                method: "POST",
                body: {},
             
            }),
            
        }),
         getAllTask: builder.query({
           query: ({ strQuery, isTrashed, search }) => ({
                url: `${TASKS_URL}?${strQuery ? `stage=${strQuery}&` : ""}isTrashed=${isTrashed}&search=${search ?? ""}`,
                method: "GET",
               
            }),
            providesTags: ["Tasks"],
        }),
         getSingleTask: builder.query({
           query: (id) => ({
                url: `${TASKS_URL}/${id}`,
                method: "GET",
                
            }),
        }),
         getTaskHistory: builder.query({
           query: () => ({
                url: `${TASKS_URL}/history`,
                method: "GET",
              
            }),
            providesTags: ["Tasks"],
        }),
         getDashboardStats: builder.query({
           query: () => ({
                url: `${TASKS_URL}/dashboard`,
                method: "GET",
            }),
            providesTags: ["Tasks"],
        }),
         createSubTask: builder.mutation({
           query: ({ data, id }) => ({
                url: `${TASKS_URL}/create-subtask/${id}`,
                method: "PUT",
                body: data,
                
            }),
        }),
         postTaskActivity: builder.mutation({
           query: ({ data, id }) => ({
                url: `${TASKS_URL}/activity/${id}`,
                method: "POST",
                body: data,
            
            }),
        }),
         trashTask: builder.mutation({
           query: ({ id }) => ({
                url: `${TASKS_URL}/${id}`,
                method: "PUT",
           
            }),
            invalidatesTags: ["Tasks"],
        }),
         deleteRestoreTask: builder.mutation({
           query: ({ id, actionType }) => ({
                url: `${TASKS_URL}/delete-restore/${id}?actionType=${actionType}`,
                method: "DELETE",
             
            }),
            invalidatesTags: ["Tasks"],
        }),
         
        changeTaskStage: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/change-stage/${data?.id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Tasks"],
        }),
         changeSubTaskStatus: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/change-stage/${data?.id}/${data?.subId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Tasks"],
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