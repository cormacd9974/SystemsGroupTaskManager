import { apiSlice } from "../apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: "/user/login",
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/user/logout",
                method: "POST",
                credentials: "include",
            }),
        }),
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

export const {
    useLoginMutation,
    useLogoutMutation,
    useRegisterMutation,
} = authApiSlice;