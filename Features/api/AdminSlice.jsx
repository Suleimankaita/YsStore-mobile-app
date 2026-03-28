import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "./ApiSlices";
import { useSelector } from "react-redux";
import { GetToken } from "../Funcslice";
const PostAdapter = createEntityAdapter({
  // Use _id as the primary key if your MongoDB returns _id
  selectId: (entity) => entity._id || entity.id, 
});

const initialState = PostAdapter.getInitialState();


const AdminSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    GetCompanyUsers: builder.query({
      query: () => "/GetCompanyUsers", // Make sure this matches your backend route
      transformResponse: (responseData) => {
        // Return the normalized state using the adapter
        return PostAdapter.setAll(initialState, responseData);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.ids.map((id) => ({ type: "USER", id })),
              { type: "USER", id: "LIST" },
            ]
          : [{ type: "USER", id: "LIST" }],
    }),

    Adminregister: builder.mutation({
      query: ({        Username,
            Password,
            Firstname,
            Lastname,
            StreetName,
            PostalNumber,
            Lat,
            Long,
            Email,
            CompanyName,
            CAC_Number}) => ({
        url: "/api/admin/register",
        method: "POST",
        body: {Username,Password,Firstname,Lastname,StreetName,PostalNumber,Lat,Long,Email,CompanyName,CAC_Number}, // This is the FormData from your component
        // IMPORTANT: RTK Query detects FormData and sets the correct headers. 
        // Do NOT add headers here.
      }),
      invalidatesTags: [{ type: "USER", id: "LIST" }],
    }),

    CompanyRegs: builder.mutation({
      query: (img ) => ({
        url: "/Auth/CompanyRegs",
        method: "POST",
        body: img,
      }),
      invalidatesTags: [{ type: "USER", id: "LIST" }],
    }),
    AdminLogin: builder.mutation({
      query: ({Username,Password}) => ({
        url: "/api/AdminAuth",
        method: "POST",
        body: {Username,Password},
      }),
      invalidatesTags: [{ type: "USER", id: "LIST" }],
    }),
  sendLogout: builder.mutation({
  query: ({token}) => ({
    url: "/logout",
    method: "POST",
    body:{},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),
  invalidatesTags: [{ type: "USER", id: "LIST" }],
}),

    // sendLogout: builder.mutation({
    //   query: ({token}) => ({
    //     url:"/Auth/logout",
    //     method: "POST",
    //     body:{},
    //     headers:{
    //       Authorization:`Bearer ${token}`
    //     }
         
    //   }),

    //   async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    //     try {
    //       await queryFulfilled;
    //       // dispatch(Logout());
    //       setTimeout(() => {
    //         dispatch(apiSlice.util.resetApiState());
    //       }, 1000);
    //     } catch (err) {
    //       console.error("Logout failed", err);
    //     }
    //   },
    // }),
    

    AddProducts: builder.mutation({
      query: ({ formData,token }) => ({
        url: "/AddProducts",
        method: "POST",
        body: formData,
        headers:{
          Authorization:`Bearer ${token}`

        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
   UpdateProduct: builder.mutation({
      query: ({ formData,token }) => ({
        url: "/UpdateProduct",
        method: "PATCH",
        body: formData,
        headers:{
          Authorization:`Bearer ${token}`

        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
   UpdateOrderStatus: builder.mutation({
      query: ({ status,paymentStatus,token,id }) => ({
        url: `/User/Order/${id}`,
        method: "PATCH",
        body: {status,paymentStatus},
        headers:{
          Authorization:`Bearer ${token}`

        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
   UpdateSeen: builder.mutation({
      query: ({ id,token }) => ({
        url: "/Seen",
        method: "PATCH",
        body: {id},
        headers:{
          Authorization:`Bearer ${token}`

        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    AddCategories: builder.mutation({
      query: ({ name, id, targetCompanyId, CompanyName,token }) => ({
        url: "/AddCategories",
        method: "POST",
        body: {name, id, targetCompanyId, CompanyName},
        headers:{
          Authorization:`Bearer ${token}`

        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    UpdateCategories: builder.mutation({
      query: ({ name, 
    id, 
    targetCompanyId: companyId, 
    CompanyName: companyName,token,categoryId }) => ({
        url: "/UpdateCategories",
        method: "PATCH",
        body: {name, 
          categoryId,
    id, 
    targetCompanyId: companyId, 
    CompanyName: companyName,token},
        headers:{
          Authorization:`Bearer ${token}`

        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    DeleteCategory: builder.mutation({
      query: ({ name, id, targetCompanyId, CompanyName,token,categoryId }) => ({
        url: "/DeleteCategory",
        method: "DELETE",
        body: { id, targetCompanyId, CompanyName,token,categoryId},
        headers:{
          Authorization:`Bearer ${token}`

        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    SellProduct: builder.mutation({
      query: ({ paymentReference,sellerId,actorId,productId,quantity,soldAtPrice,actualPrice,name,paymentMethod,token,img,TransactionType }) => ({
        url: "/sell",
        method: "POST",
        body: {paymentReference,sellerId,actorId,productId,quantity,soldAtPrice,actualPrice,name,paymentMethod,img,TransactionType},
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    SubscribeCom: builder.mutation({
      query: ({ ip,companyId,subscriptionPlan, durationMonths, paymentDetails,token ,duration,refrence,amount,status}) => ({
        url: `/api/Subscription/subscribe/${companyId}`,
        method: "POST",
        body: {ip,subscriptionPlan, durationMonths, paymentDetails,duration,refrence,amount,status},
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    Payout: builder.mutation({
      query: ({ token,account_no,companyId }) => ({
        url: "/SearchBank",
        method: "POST",
        body: {account_no,companyId},
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    CreateDeals: builder.mutation({
      query: ({data,token}) => ({
        url: "/Deals/create",
        method: "POST",
        body: data,
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    PayOutCheckout: builder.mutation({
      query: ({ token,name, code, account_number, amount,companyId,otp}) => ({
        url: "/PayOutCheckout",
        method: "POST",
        body: {name, code, account_number, amount,companyId,otp},
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    PayOutAminCheckout: builder.mutation({
      query: ({ token,name, code, account_number, amount,companyId,otp}) => ({
        url: "/PayoutAdmin",
        method: "POST",
        body: {name, code, account_number, amount,companyId,otp},
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    CreateBranch: builder.mutation({
      query: ({CompanyName, lat, long, street, postalNumber, 
        CompanyPassword, id, CompanyEmail, targetCompanyId ,token }) => ({
        url: "/CreateBranch",
        method: "POST",
        body: {CompanyName, lat, long, street, postalNumber, 
        CompanyPassword, id, CompanyEmail, targetCompanyId },
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    UpdateCompanyUser: builder.mutation({
      query: ({ Firstname,
        Lastname,
        Username,
        Email,
        Role,
        Active,
        StreetName,
        PostalNumber,
        Lat,
        id,
        Long,
        phone, // For Profile
        CompanyName,token , data}) => ({
        url: "/UpdateCompanyUser/"+id,
        method: "PUT",
        body:  data,
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),
    CompanyUsersRegs: builder.mutation({
      query: ({ Username, Password, Firstname, Lastname, Email,
            StreetName, PostalNumber, Lat, Long,
            Role,
                          // The Admin ID (Owner)
            targetId,        // The ID of the Company OR Branch
            type   ,token }) => ({
        url: "/CompanyUsersRegs",
        method: "POST",
        body: { Username, Password, Firstname, Lastname, Email,
            StreetName, PostalNumber, Lat, Long,
                 Role,         // The Admin ID (Owner)
            targetId,        // The ID of the Company OR Branch
            type   },
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: [{ type: "POST", id: "LIST" }],
    }),

    Getsell: builder.query({
      query: ({token,companyId}) => ({
        method:"GET",
        url:`/GetSale?companyId=${companyId}`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })
    }),

    GetViewProducts: builder.query({
      query: ({token,companyId}) => ({
        method:"GET",
        url:`/GetViewProducts?companyId=${companyId}`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })
    }),
    GetBillingTransaction: builder.query({
      query: ({token,companyId}) => ({
        method:"GET",
        url:`/api/Subscription/GetAllbilling`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })
    }),
    SubscriptionStatus: builder.query({
      query: ({token,companyId}) => ({
        method:"GET",
        url:`/api/Subscription/status/${companyId}`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })
    }),

    FoodgetPrices: builder.query({
      query: ({companyId,token}) => ({
        url:`food?companyId=${companyId}&active=true`,
        method:"GET",
        headers:{
          Authorization:`Bearer ${token}`
        }
        }
      ),
      providesTags: ['FoodPrice'],
    }),
    FoodcreatePrice: builder.mutation({
      query: ({formData,token}) => ({
        url: '/food',
        method: 'POST',
        body: formData, // FormData for file upload
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: ['FoodPrice'],
    }),
    
    Otp: builder.mutation({
      query: ({formData,token}) => ({
        url: '/Otp',
        method: 'POST',
        body: formData, // FormData for file upload
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: ['FoodPrice'],
    }),

    FoodupdatePrice: builder.mutation({
      query: ({ id, data,token }) => ({
        url: `/food/${id}`,
        method: 'PUT',
        body: data,
          headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: ['FoodPrice'],
    }),
    FooddeletePrice: builder.mutation({
      query: ({id,token}) => ({
        url: `/food/${id}`,
        method: 'DELETE',
          headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: ['FoodPrice'],
    }),

    GetBranch: builder.query({
      query: ({token,companyId}) => ({
        method:"GET",
        url:`/Get/Branch`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })
    }),
    GetWalletBalance: builder.query({
      query: ({token,companyId}) => ({
        method:"GET",
        url:`/WalletBalance?companyId=${companyId}`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })
    }),
    GetAdminWallet: builder.query({
      query: ({token,companyId}) => ({
        method:"GET",
        url:`/AdminWalletBalance`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })
    }),
    GetAccountVerifiedOtp: builder.query({
      query: ({token,companyId}) => ({
        method:"GET",
        url:`/GetAccountVerifiedOtp`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })
    }),
   GetUserNotification: builder.query({
      query: ({token,companyId}) => ({
        method:"GET",
        url:`/GetUserNotification`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })
    }),
    GetBranchUsers: builder.query({
      query: ({token,companyId,branchId}) => ({
        method:"GET",
        url:`/Get/GetBranchUsers?companyId=${companyId}&branchId=${branchId}`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })
    }),

      GetAllCompanyUsers: builder.query({
        query: ({token,companyId}) => ({
           method:"GET",
            url:`/GetCompanyUsers?targetId=${companyId}`,
              headers: {
                Authorization: `Bearer ${token}`,
    },
      })
    }),
      GetAllSales: builder.query({
        query: ({token,companyId,page,limit}) => ({
           method:"GET",
            url:`/GetAllSales?companyId=${companyId}&page=${page}&limit=${limit}`,
              headers: {
                Authorization: `Bearer ${token}`,
    },
      })
    }),
      UserOrder: builder.query({
        query: ({token,companyId,page,limit,id}) => ({
           method:"GET",
            url:`/User/Order/listOrders/${companyId}`,
              headers: {
                Authorization: `Bearer ${token}`,
    },
      })
    }),
      GetUserOrders: builder.query({
        query: ({token,companyId,page,limit,id}) => ({
           method:"GET",
            url:`/User/Order/get/${id}`,
              headers: {
                Authorization: `Bearer ${token}`,
    },
      })
    }),
      Exipre: builder.query({
        query: ({token,companyId,page,limit,id}) => ({
           method:"GET",
            url:`/Exipre/company/expire-date/${companyId}`,
              headers: {
                Authorization: `Bearer ${token}`,
    },
      })
    }),
      CompanySetings: builder.query({
        query: ({token,companyId,page,limit,id}) => ({
           method:"GET",
            url:`/Settings?targetId=${companyId}`,
              headers: {
                Authorization: `Bearer ${token}`,
    },
      })
    }),

      
    GetSingleProduct: builder.query({
      query: ({token,companyId,id}) => ({
        method:"GET",
        url:`GetSingleProduct/${companyId}/${id}`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })
    }),
    updateSettings: builder.mutation({
      query: ({ targetId, data,token ,settings ,formData}) => ({
        url: `/settings`,
        method: "PUT",
        body:formData,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      invalidatesTags: ["Settings"],
    }),
  
    globalForceLogout: builder.mutation({
      query: (data) => ({
        url: '/ForceLogOut/global',
        method: 'POST',
        body: data,
        headers:{
          Authorization:`Bearer ${data.token}`
        }
      }),
      invalidatesTags: ["Buy"],
    }),

    // 2. Selective logout by user type
    selectiveForceLogout: builder.mutation({
      query: ({ userType, reason,token }) => ({
        url: '/ForceLogOut/selective',
        method: 'POST',
        body: { userType, reason },
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: ['Sessions'],
    }),

    // 3. Individual user logout
    individualForceLogout: builder.mutation({
      query: ({ targetUserId, userType,token }) => ({
        url: '/ForceLogOut/individual',
        method: 'POST',
        body: { targetUserId, userType },
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),

      invalidatesTags: ['Sessions'],
    }),

    // 4. Get active sessions
    getActiveSessions: builder.query({
      query: () => '/ForceLogOut/active',
      providesTags: ['Sessions'],
    }),

    // 5. Get security statistics
    getSecurityStats: builder.query({
      query: () => '/ForceLogOut/stats',
      providesTags: ['Stats'],
    }),

    // 6. Terminate specific session
    terminateSession: builder.mutation({
      query: (sessionId,{token}) => ({
        url: `/ForceLogOut/terminate/${sessionId}`,
        method: 'POST',
        headers:{
          Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: ['Sessions'],
    }),

    // 7. Get force logout logs/history
    getForceLogoutLogs: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => 
        `/ForceLogOut/?page=${page}&limit=${limit}`,
      providesTags: ['Logs'],
    }),
    

    Getcategories: builder.query({
      query: ({token,companyId,id,branchId}) => ({
        method:"GET",
        url:`Getcategories?companyId=${companyId}`,
       headers: {
      Authorization: `Bearer ${token}`,
    },
      })

    }),


  }),
  })



export const {
  useGetCompanyUsersQuery,
  useAdminregisterMutation,
  useCompanyRegsMutation,
  useAddProductsMutation,
  useAdminLoginMutation,
  useGetsellQuery,
  useGetSingleProductQuery,
  useSellProductMutation,
  useCreateBranchMutation,
  useGetBranchQuery,
  useGetAllCompanyUsersQuery,
  useGetBranchUsersQuery,
  useGetAllSalesQuery,
  useAddCategoriesMutation,
  useUpdateCategoriesMutation,
  useDeleteCategoryMutation,
  useGetcategoriesQuery,
  useCompanyUsersRegsMutation,
  useUpdateCompanyUserMutation,
  useUserOrderQuery,
  useCompanySetingsQuery,
  useUpdateSettingsMutation,
  usePayoutMutation,
  useSubscriptionStatusQuery,
  usePayOutCheckoutMutation,
  useSendLogoutMutation,
  useUpdateProductMutation,
  useGetUserOrdersQuery,
  useExipreQuery,
  useGlobalForceLogoutMutation,
  useSelectiveForceLogoutMutation,
  useIndividualForceLogoutMutation,
  useGetActiveSessionsQuery,
  useGetSecurityStatsQuery,
  useTerminateSessionMutation,
  useGetForceLogoutLogsQuery,
  useGetUserNotificationQuery,
  useUpdateSeenMutation,
  useSubscribeComMutation,
  useGetWalletBalanceQuery,
  useFoodcreatePriceMutation, 
  useFoodupdatePriceMutation, 
  useFooddeletePriceMutation,
  useFoodgetPricesQuery,
  useOtpMutation,
  useGetAdminWalletQuery,
  usePayOutAminCheckoutMutation,
  useUpdateOrderStatusMutation,
  useCreateDealsMutation,
  useGetAccountVerifiedOtpQuery,
  useGetBillingTransactionQuery,
  useGetViewProductsQuery
} = AdminSlice;

// Selectors
const selectCompanyUsersResult = AdminSlice.endpoints.GetCompanyUsers.select();

const selectCompanyUsersData = createSelector(
  selectCompanyUsersResult,
  (result) => result.data || initialState
);

export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
} = PostAdapter.getSelectors((state) => selectCompanyUsersData(state));