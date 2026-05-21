import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authSlice";

const baseQuery = fetchBaseQuery({
    baseUrl: "/api",
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

const baseQueryWithReauth = async(args, apiSlice, extraOptions) => {
    const result = await baseQuery(args, apiSlice, extraOptions);
    if (result?.error?.status === 401) {
        localStorage.removeItem("userInfo");
        apiSlice.dispatch(logout());
    }
    return result;
};
export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Tasks", "Users"],
    endpoints: () => ({}),
});
