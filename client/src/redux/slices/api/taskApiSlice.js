//import { USERS_URL } from "../../../utils/contants";
import { TASKS_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

// RTK Query endpoints for task-related API operations
export const taskApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Create a new task
        createTask: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/create`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Tasks", "Users"],
        }),

        // Update an existing task
         updateTask: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/update/${data._id}`,
                method: "PUT",
                body: data,
              
            }),
            invalidatesTags: ["Tasks"],
        }),

        // Duplicate a task
         duplicateTask: builder.mutation({
           query: (id) => ({
                url: `${TASKS_URL}/duplicate/${id}`,
                method: "POST",
                body: {},
             
            }),
            
        }),

        // Fetch all tasks with optional stage, trash, and search filters
         getAllTask: builder.query({
           query: ({ strQuery, isTrashed, search }) => ({
                url: `${TASKS_URL}?${strQuery ? `stage=${strQuery}&` : ""}isTrashed=${isTrashed}&search=${search ?? ""}`,
                method: "GET",
               
            }),
            providesTags: ["Tasks"],
        }),

        // Fetch a single task by ID
         getSingleTask: builder.query({
           query: (id) => ({
                url: `${TASKS_URL}/${id}`,
                method: "GET",
                
            }),
        }),

        // Fetch task history/completed tasks
         getTaskHistory: builder.query({
           query: () => ({
                url: `${TASKS_URL}/history`,
                method: "GET",
              
            }),
            providesTags: ["Tasks"],
        }),

        // Fetch dashboard summary statistics
         getDashboardStats: builder.query({
           query: () => ({
                url: `${TASKS_URL}/dashboard`,
                method: "GET",
            }),
            providesTags: ["Tasks"],
        }),

        // Add a sub-task to an existing task
         createSubTask: builder.mutation({
           query: ({ data, id }) => ({
                url: `${TASKS_URL}/create-subtask/${id}`,
                method: "PUT",
                body: data,
                
            }),
        }),

        // Add an activity entry to a task
         postTaskActivity: builder.mutation({
           query: ({ data, id }) => ({
                url: `${TASKS_URL}/activity/${id}`,
                method: "POST",
                body: data,
            
            }),
        }),

        // Move a task to trash
         trashTask: builder.mutation({
           query: ({ id }) => ({
                url: `${TASKS_URL}/${id}`,
                method: "PUT",
           
            }),
            invalidatesTags: ["Tasks"],
        }),

        // Permanently delete or restore a trashed task
         deleteRestoreTask: builder.mutation({
           query: ({ id, actionType }) => ({
                url: `${TASKS_URL}/delete-restore/${id}?actionType=${actionType}`,
                method: "DELETE",
             
            }),
            invalidatesTags: ["Tasks"],
        }),
         
        // Change the stage/status of a task
        changeTaskStage: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/change-stage/${data?.id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Tasks"],
        }),

        // Update the completion status of a sub-task
         changeSubTaskStatus: builder.mutation({
           query: (data) => ({
                url: `${TASKS_URL}/change-status/${data?.id}/${data?.subId}`,
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