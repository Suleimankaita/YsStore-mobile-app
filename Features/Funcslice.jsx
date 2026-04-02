import { createSlice } from "@reduxjs/toolkit";

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
};

const Funcslice = createSlice({
  name: "Function",
  initialState,
  reducers: {
    AddCart: (state, action) => {
      let { id, delta, product } = action.payload;

      id = id || product?._id;

      const exist = state.Cart.find((item) => item._id === id);

      if (exist) {
          if(delta){
              
              const newQty = exist.qty + delta;
        

        if (newQty <= 0) {
          state.Cart = state.Cart.filter((item) => item._id !== id);
        
          

        } else {
          state.Cart = state.Cart.map((item) =>
            item._id === id ? { ...item, qty: newQty } : item
          );
        }
        
        }else if(!delta){

            state.Cart.map(res=>res?._id===id?{...res,qty:res.qty+=1}:res)
        
        }
      } else {
        state.Cart.push({ ...product, qty: 1 });
      }

      // update localStorage
      localStorage.setItem("Cart", JSON.stringify(state.Cart));
    },

    RemoveItem: (state, action) => {
      const id = action.payload;
      state.Cart = state.Cart.filter((item) => item._id !== id);

      localStorage.setItem("Cart", JSON.stringify(state.Cart));
    },

    ClearCart: (state) => {
      state.Cart = [];
      localStorage.removeItem("Cart");
    },
    UserCart: (state, action) => {
      let { id, delta, product } = action.payload;

      id = id || product?.id;

      const exist = state.UserCart.find((item) => item.id === id);

      if (exist) {
          if(delta){
              
              const newQty = exist.qty + delta;
        

        if (newQty <= 0) {
          state.Cart = state.Cart.filter((item) => item.id !== id);
        
          

        } else {
          state.Cart = state.UserCart.map((item) =>
            item._id === id ? { ...item, qty: newQty } : item
          );
        }
        
        }else if(!delta){

            state.Cart.map(res=>res?._id===id?{...res,qty:res.qty+=1}:res)
        
        }
      } else {
        state.Cart.push({ ...product, qty: 1 });
      }

      // update localStorage
      localStorage.setItem("UserCart", JSON.stringify(state.Cart));
    },

    UserCartRemoveItem: (state, action) => {
      const id = action.payload;

      state.Cart = state.Cart.filter((item) => item?._id !== id);

      localStorage.setItem("UserCart", JSON.stringify(state.Cart));
    },

    UserCartClearCart: (state) => {
      state.Cart = [];
      localStorage.removeItem("UserCart");
    },

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
      localStorage.setItem("Role", JSON.stringify(action.payload));
    },
    Logout: (state, action) => {
      // alert("LogOut")
      window.location.href='/'
          window.location.replace=true
          
    },
    SetRouter: (state, action) => {
      state.router = action.payload;
    }
  },
});

export const {
  toggle,
  UserCart,
  UserCartClearCart,
  UserCartRemoveItem,
  Setsearch,
  setToken,
  SetRole,
   Logout,
   SetRouter,
  Setid,
  SetUserDetails,
  AddCart,
  ClearCart,
  RemoveItem,
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

export default Funcslice.reducer;
