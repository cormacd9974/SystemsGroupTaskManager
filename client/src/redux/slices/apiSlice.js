import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authSlice";

// Base query used for all API requests
const baseQuery = fetchBaseQuery({
    baseUrl: "/api",

    // Attach the JWT token from localStorage to every request header
    prepareHeaders: (headers) => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            const user = JSON.parse(userInfo);
            if (user?.token) {
                headers.set("authorization", `Bearer ${user.token}`);
            }
        }
        return headers;
    }
});

// Wrapper around baseQuery that handles unauthorized responses
const baseQueryWithReauth = async(args, apiSlice, extraOptions) => {
    const result = await baseQuery(args, apiSlice, extraOptions);

    // If the server responds with 401, clear stored auth and log the user out
    if (result?.error?.status === 401) {
        localStorage.removeItem("userInfo");
        apiSlice.dispatch(logout());
    }
    return result;
};

// Main RTK Query API slice
export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Tasks", "Users"],
    endpoints: () => ({}),
});