import { USERS_URL } from "../../../utils/contants";
import { apiSlice } from "../apiSlice";

// RTK Query endpoints for user-related API operations
export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Update the current user's profile
        updateUser: builder.mutation({
           query: (data) => ({
                url: `${USERS_URL}/profile`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
        }),

        // Fetch the list of team members, optionally filtered by search
         getTeamLists: builder.query({
           query: ({search} = {}) => ({
                url: `${USERS_URL}/get-team?search=${search ?? ""}`,
                method: "GET",
                credentials: "include",
            }),
        }),

        // Delete a user by ID
         deleteUser: builder.mutation({
           query: (id) => ({
                url: `${USERS_URL}/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),

        // Enable or disable a user account
         userAction: builder.mutation({
           query: (data) => ({
                url: `${USERS_URL}/${data.id}`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
        }),

        // Fetch unread/read notifications for the current user
         getNotifications: builder.query({
           query: () => ({
                url: `${USERS_URL}/notifications`,
                method: "GET",
            
            }),
            providesTags: ["Users"],
        }),

        // Mark a notification as read
         markNotiAsRead: builder.mutation({
           query: (data) => ({
                url: `${USERS_URL}/read-noti?isReadType=${data.type}&id=${data.id}`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
        }),

        // Change the current user's password
         changePassword: builder.mutation({
           query: (data) => ({
                url: `${USERS_URL}/change-password`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
         }),
    }),
});

export const { 
    useUpdateUserMutation,
    useGetTeamListsQuery,
    useDeleteUserMutation,
    useUserActionMutation,
    useGetNotificationsQuery,
    useMarkNotiAsReadMutation,
    useChangePasswordMutation,
} = userApiSlice;