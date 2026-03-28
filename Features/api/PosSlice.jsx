import {createEntityAdapter,createSelector} from "@reduxjs/toolkit"
import { apiSlice } from "./ApiSlices"

const PostAdapter=createEntityAdapter()
const InitialState=PostAdapter.getInitialState()

const PosSlice=apiSlice.injectEndpoints({
        Login: builder.mutation({
        query: ({ Username, Password }) => ({
            url: '/Auth/Login',
            method: 'POST',
            body: { Username, Password }
        }),
        invalidatesTags: [{ type: 'Buy', id: 'LIST' }]
    }),
          AddProducts: builder.mutation({
        query: ({ img}) => ({
            url: '/Auth/Login',
            method: 'POST',
            body:img
        }),
        invalidatesTags: [{ type: 'Buy', id: 'LIST' }]
    }),



        })



export const {useGetCompanyUsersQuery,useLoginMutation}=PosSlice

const select=PosSlice.endpoints.GetCompanyUsers.select();

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
