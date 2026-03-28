import Funcslice from "./Funcslice"
import securitySlice from "./securitySlice"
import { configureStore } from "@reduxjs/toolkit"
import { apiSlice } from "./api/ApiSlices"

export const store =configureStore({
        reducer:{
            [apiSlice.reducerPath]:apiSlice.reducer,   
            Function:Funcslice,
            securitySlice:securitySlice
        },
        middleware:(Defaultmiddleware)=>Defaultmiddleware().concat(apiSlice.middleware),
        devTools:true

}) 