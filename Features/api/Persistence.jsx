import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRefreshMutation } from "./ApiSlices";
import { setToken, GetToken } from "../Funcslice";
import Loader from "@/utils/Loader";

const PersistLogin = ({ children }) => {
  const [refresh, { isLoading }] = useRefreshMutation();
  const dispatch = useDispatch();
  const token = useSelector(GetToken);

  const effectRan = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const verifyRefreshToken = async () => {
      try {
        const res = await refresh(undefined).unwrap();
        console.log("Refresh response:", res);
        if (isMounted && res?.accessToken) {
          dispatch(setToken(res.accessToken));
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.log("Refresh failed:", err);
        }
      }
    };

    // if (effectRan.current === true || process.env.NODE_ENV !== "development") {
      if (!token) {
        verifyRefreshToken();
      // }
    }

    return () => {
      isMounted = false;
      controller.abort();
      effectRan.current = true;
    };
  }, [token, refresh, dispatch]);

  if (!token && isLoading) {
    return <Loader />;
  }

  return children;
};

export default PersistLogin;