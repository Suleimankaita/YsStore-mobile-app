import { View, Text } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useEffect } from 'react'
import GetItem from '@/utils/GetItem'
import {jwtDecode} from "jwt-decode"
import { GetData ,} from '@/Features/Funcslice'
import { useSelector ,useDispatch} from 'react-redux'
const Auth = () => {
    const [Userdtails, setUserDetails] = React.useState({
     
    });
    const dispatch=useDispatch()
    const [tk,settk]=useState('')
    const token =useMemo(async()=>{
        try{
            const data=await GetItem("credentials") 
            // console.log("Token from Auth:", data);
            settk(data)
            return data;
        }catch(err){
            alert(err.message)
        }
        }, []);

    useEffect(()=>{
        if(tk && typeof tk === "string" && tk !== 'null'){
            console.log("tk in useEffect:", tk);
        const decoded=jwtDecode(tk)
            if(decoded){

                const currentTime = Date.now() / 1000; // Convert to seconds
                // if (decoded.exp < currentTime) {
                //     console.log("Token has expired.");
                // }

                console.log("Decoded token:", decoded?.exp);
                const {Role,id,Username,companyId,companyName} =decoded?.UserInfo??{}
                setUserDetails({Role,id,Username,companyId,companyName })
            }
        }
    },[token,tk])
  return {id:Userdtails?.id,Role:Userdtails?.Role,Username:Userdtails?.Username,companyId:Userdtails?.companyId,companyName:Userdtails?.companyName}
}

export default Auth