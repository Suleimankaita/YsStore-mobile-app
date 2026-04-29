

import React from 'react'
import { useState,useEffect } from 'react'
import GetData from "@/utils/GetItem"
import { GetToken,setToken,SetRole,Setid, SetUserDetails,GetUserDetails } from '@/Features/Funcslice'
import { useSelector ,useDispatch} from 'react-redux'
import { jwtDecode } from 'jwt-decode'
const UseAuth = () => {
  
    const [username,SetUsername]=useState('')
    // const [role,SetRoles]=useState('')
    const [Id,SetId]=useState('')
    const token=useSelector(GetToken)
    const Userdtails=useSelector(GetUserDetails)
    const dispatch=useDispatch()
    useEffect(()=>{
            if(!token?.length || token === 'null')return ;       
        if(token && typeof token === 'string' && token !== 'null'){
            try {
                const result=jwtDecode(token)
                if(result){
                    const {Role,id,Username,companyId,companyName} =result?.UserInfo
                   
                    dispatch(SetRole(Role))
                    dispatch(SetUserDetails({Role,id,Username,companyId,companyName }))
                    SetId(id)
                }
            } catch (err) {
                console.error('Invalid token:', err);
                dispatch(setToken(null));
            }
        }
    },[token,dispatch])

    // return Children;           
  return {id:Userdtails?.id,Role:Userdtails?.Role,Username:Userdtails?.Username,companyId:Userdtails?.companyId,companyName:Userdtails?.companyName}

}

export default UseAuth