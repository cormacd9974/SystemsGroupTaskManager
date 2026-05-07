import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({ 
        baseUrl: "/api", 
        prepareHeaders: (headers) => {
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