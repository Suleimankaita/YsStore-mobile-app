import {createEntityAdapter,createSelector} from "@reduxjs/toolkit"
import { apiSlice } from "./ApiSlices"

const PostAdapter=createEntityAdapter()
const InitialState=PostAdapter.getInitialState()

const UsersSlice=apiSlice.injectEndpoints({
    
        endpoints:(builder)=>({
            GetCompanyUsers:builder.query({
                transformResponse:(res)=>{
                    
                    const man=res.map(ress=>{
                        return ress._id=res.id
                    })
                    PostAdapter.setAll(InitialState,man)
                },

                providesTags: (result, err, arg) => {
                     if (result?.ids) {
            return [
                { type: 'Buy', id: 'LIST' },
                ...result.ids.map(id => ({ type: 'Buy', id }))
            ];
            } else {
            return [{ type: 'Buy', id: 'LIST' }];
            }
        },  
        }),

          UsersLogin: builder.mutation({
        query: ({ Username, Password }) => ({
            url: '/Auth/Login',
            method: 'POST',
            body: { Username, Password }
        }),
        invalidatesTags: [{ type: 'Buy', id: 'LIST' }]
    }),

      LoginCompanyUsers: builder.mutation({
      query: ({Username,Password}) => ({
        url: "/api/CompanyUserAuth",
        method: "POST",
        body: {Username,Password},
      }),
      invalidatesTags: [{ type: "USER", id: "LIST" }],
    }),
      AuthRegs: builder.mutation({
      query: ({ Username,
            Password,
            Firstname,
            Lastname,
            StreetName,
            PostalNumber,
            Lat,
            Long,
            Email,}) => ({
        url: "/Auth/Regs",
        method: "POST",
        body: { Username,
            Password,
            Firstname,
            Lastname,
            StreetName,
            PostalNumber,
            Lat,
            Long,
            Email,},
      }),
      invalidatesTags: [{ type: "USER", id: "LIST" }],
    }),

        })

}) 

export const {useGetCompanyUsersQuery,useUsersLoginMutation,useLoginCompanyUsersMutation,useAuthRegsMutation}=UsersSlice

const select=UsersSlice.endpoints.GetCompanyUsers.select();

const selectors=createSelector(
    select,
    res=>res.data
)

export const {
      selectAll,
      selectById,
      selectEntities,
      selectIds,
      selectTotal
}=PostAdapter.getSelectors(state=>selectors(state)??InitialState)
