import { createSlice } from "@reduxjs/toolkit";

// Initial auth state, loaded from localStorage if user data already exists
const initialState = {
    user: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
    isSidebarOpen: false,
};

// Redux slice for authentication and sidebar state
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Store logged-in user data in Redux and localStorage
        setCredentials: (state, action) => {
            state.user = action.payload;
            localStorage.setItem("userInfo", JSON.stringify(action.payload));
        },

        // Clear the current user from Redux and localStorage
        logout: (state) => {
            state.user = null;
            localStorage.removeItem("userInfo");
        }, 

        // Open or close the sidebar
        setOpenSidebar: (state, action) => {
            state.isSidebarOpen = action.payload;
        },
    },
});

export const { setCredentials, logout, setOpenSidebar } = authSlice.actions;
export default authSlice.reducer;