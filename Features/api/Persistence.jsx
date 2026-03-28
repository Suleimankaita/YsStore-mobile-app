import { router,  } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRefreshMutation } from "./ApiSlices";
import { setToken, GetToken } from "../Funcslice";
import Loader from "../../layout/Loader"
const PersistLogin = () => {
  const [refresh] = useRefreshMutation();
  const dispatch = useDispatch();
  const token = useSelector(GetToken);
  const navigate=router()
  const [loading, setLoading] = useState(true);
  
  // Ref to prevent double-running in React 18 Strict Mode
  const effectRan = useRef(false);

  useEffect(() => {
    // if(!token)return;
    // This variable acts as our "unsubscribe" flag
    let isMounted = true;
    
    // AbortController allows us to cancel the actual network request
    const controller = new AbortController();

    const verifyRefreshToken = async () => {
      try {
        // We pass the signal to the mutation to allow cancellation
        const res = await refresh({ signal: controller.signal }).unwrap();
        
        // Only update state if the component is still mounted
        if (isMounted) {
          dispatch(setToken(res.accessToken));
        }
      } catch (err) {
        console.log(err);
        // if(err?.data?.message==='Invalid refresh token"'){
        //   // navigate('/Login',{replace:true})
        // }
        // Ignore errors caused by manual cancellation
        if (err.name !== 'AbortError') {
          console.log("No valid refresh token or request failed");
        }
      } finally {
        // Only update state if the component is still mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Logic to handle React 18 Strict Mode (runs twice in dev)
    if (effectRan.current === true || process.env.NODE_ENV !== 'development') {
      if (!token) {
        verifyRefreshToken();
      } else {
        setLoading(false);
      }
    }

    // Cleanup function (The "Unsubscribe" part)
    return () => {
      isMounted = false; // Prevents state updates after unmount
      controller.abort(); // Cancels the pending network request
      effectRan.current = true; // Marks the effect as having run
    };
  }, [token, refresh, dispatch]);

  // Loading state (You can replace this with a Spinner component)
  if (loading) {
    return <Loader/>
  }

  // return <Outlet />;
};

export default PersistLogin;