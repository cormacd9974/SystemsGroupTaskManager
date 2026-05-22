import { apiSlice } from "../apiSlice";

// API slice for authentication-related requests
export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Login endpoint for signing in a user
        login: builder.mutation({
            query: (data) => ({
                url: "/user/login",
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),

        // Logout endpoint for signing out the current user
        logout: builder.mutation({
            query: () => ({
                url: "/user/logout",
                method: "POST",
                credentials: "include",
            }),
        }),

        // Register endpoint for creating a new user account
        register: builder.mutation({
            query: (data) => ({
                url: "/user/register",
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),
    }),
});

// Export auto-generated hooks for use in React components
export const {
    useLoginMutation,
    useLogoutMutation,
    useRegisterMutation,
} = authApiSlice;