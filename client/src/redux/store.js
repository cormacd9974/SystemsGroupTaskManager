import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import authReducer from "./slices/authSlice";

// Redux store configuration for the app
const store = configureStore({
    reducer: {
        // Register RTK Query API reducer
        [apiSlice.reducerPath]: apiSlice.reducer,

        // Register auth slice reducer
        auth: authReducer,
    },

    // Add RTK Query middleware for caching, invalidation, and API calls
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),

    // Enable Redux DevTools
    devTools: true,
});

export default store;