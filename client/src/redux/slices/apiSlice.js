import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_URL = "http://localhost:8800/api";

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: API_URL, prepareHeaders: (headers) => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            const user = JSON.parse(userInfo);
            if(user?.token) {
                headers.set("authorization", `Bearer ${user.token}`);
            }
        }
        return headers;
    } }),
    tagTypes: [],
    endpoints: () => ({}),
});