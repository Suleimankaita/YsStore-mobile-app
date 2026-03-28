import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["POST", "USER"], // Added USER tag for cache management
  endpoints: (builder) => ({
    refresh: builder.mutation({
      query: () => ({ url: "/refresh", method: "GET" }),
    }),
     
    sendLogout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // After the server clears the cookie, clear the local state
          dispatch(logOut());
          // Optional: Reset the entire API state to clear cache
          setTimeout(() => {
            dispatch(apiSlice.util.resetApiState());
          }, 1000);
        } catch (err) {
          console.error("Logout failed", err);
        }
      },
    }),
  }),
});

export const { useRefreshMutation, useSendLogoutMutation ,} = apiSlice;