import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { setToken, SetUserDetails } from "../Funcslice";
import { uri } from "./Uri";

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: uri,
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.Token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    headers.set("accept", "application/json");
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshToken = api.getState()?.auth?.refreshToken;

        const refreshResult = await rawBaseQuery(
          {
            url: "/Auth/refresh",
            method: "POST",
            body: { refreshToken }, // use explicit token for mobile
          },
          api,
          extraOptions
        );

        if (refreshResult?.data) {
          api.dispatch(setToken(refreshResult.data));
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          api.dispatch(setToken(null));
          api.dispatch(SetUserDetails(null));
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  if (result?.error?.status === 403) {
    api.dispatch(setToken(null));
    api.dispatch(SetUserDetails(null));
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "POST",
    "USER",
    "SystemConfig",
    "Shareholders",
    "Integrations",
    "Nodes",
    "Dashboard",
    "Buy",
  ],
  endpoints: (builder) => ({
    refresh: builder.mutation({
      query: (refreshToken) => ({
        url: "/Auth/refresh",
        method: "POST",
        body: { refreshToken },
      }),
    }),
  }),
});

export const { useRefreshMutation } = apiSlice;