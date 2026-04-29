import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
const initialState = {
  toggle: false,
  id:'',
  Search: "",
  Token: null,
  Cart:  [],
  UserCart: [],
  Role: null,
  UserDetails: {},
  router: null,
  GetData:null
};

const Funcslice = createSlice({
  name: "Function",
  initialState,
  reducers: {
    
    toggle: (state, action) => {
      state.toggle = action.payload;
    },
    SetUserDetails: (state, action) => {
      state.UserDetails = action.payload;
    },
    Setid: (state, action) => {
      state.id = action.payload;
    },

    Setsearch: (state, action) => {
      state.Search = action.payload;
    },

    setToken: (state, action) => {
      state.Token = action.payload;
    },

    SetRole: (state, action) => {
      state.Role = action.payload;
    },
    Logout: (state, action) => {
      // alert("LogOut")
      window.location.href='/'
          window.location.replace=true
          
    },
    SetRouter: (state, action) => {
      state.router = action.payload;
    },
    SaveData:async(state, action)=> {
      const { name, data } = action.payload;
      try{

        AsyncStorage.setItem(name, JSON.stringify(data));
      }catch(err){
        alert(err.message)
      }
    },
    GetData:async(state, action)=>{
        try{
          const name=action.payload
                console.log("name: ",name)
            const data=await AsyncStorage.getItem(name)
            
                    if(data){
                        return JSON.parse(data);
                    }else{
                        return [];
                    }
                }catch(err){
                    alert(err.message)
                }
        
        }
  },
});

export const {
  toggle,
  UserCart,
  Setsearch,
  setToken,
  SetRole,
   Logout,
   SetRouter,
   SetUserDetails,
  Setid,
GetData
} = Funcslice.actions;

export const Showtoggle = (state) => state.Function.toggle;
export const Searchs = (state) => state.Function.Search;
export const GetToken = (state) => state.Function.Token;
export const GetRole = (state) => state.Function.Role;
export const GetCart = (state) => state.Function.Cart;
export const GetId = (state) => state.Function.id;
export const GetUserCart = (state) => state.Function.UserCart;
export const GetUserDetails= (state) => state.Function.UserDetails;
export const GetRouter = (state) => state.Function.router;
// export const GetData = (state) => state.Function.GetData;

export default Funcslice.reducer;
