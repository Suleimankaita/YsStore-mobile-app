import { createEntityAdapter, createSelector } from "@reduxjs/toolkit"
import { apiSlice } from "./ApiSlices"

const Ecomerce = createEntityAdapter()
const InitialState = Ecomerce.getInitialState()

const EcomerceSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    GetEcomerceProduct: builder.query({
      query: () => ({
        url: '/',
        method: 'GET',
      }),
      providesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    GetSingleEcom: builder.query({
      query: ({ id }) => ({
        url: `/GetSingleEcom/${id}`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    GetUserprofile: builder.query({
      query: ({ id, token }) => ({
        url: `/GetUserprofile`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      providesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    GetShops: builder.query({
      query: ({ id }) => ({
        url: `/GetShops/`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    GetDeals: builder.query({
      query: ({ id }) => ({
        url: `/Deals/`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    GetSingleShops: builder.query({
      query: ({ id }) => ({
        url: `/GetShops/${id}`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    Getcart: builder.query({
      query: ({ id, token }) => ({
        url: `/cart?targetUserId=${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      providesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    UserOrders: builder.query({
      query: ({ id, token }) => ({
        url: `/UserOrders/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      providesTags: [{ type: 'Buy', id: 'LIST' }],
    }),
    GetSimilarcate: builder.query({
      query: ({ name, token }) => ({
        url: `search?name=${name}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      providesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    updateProductQuantity: builder.mutation({
      query: ({ id, token, productId, dealId, quantity }) => ({
        url: `/cart/update?targetUserId=${id}`,
        method: 'PUT',
        body: { productId, dealId, quantity },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    EditUserProfile: builder.mutation({
      query: ({ token, data }) => ({
        url: `/EditUserProfile`,
        method: 'PATCH',
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    removeCardItem: builder.mutation({
      query: ({ id, token, productId, dealId, quantity }) => ({
        url: `/cart/remove?targetUserId=${id}`,
        method: 'DELETE',
        body: { productId, dealId, quantity },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    clearCardItem: builder.mutation({
      query: ({ id, token, productId, dealId, quantity }) => ({
        url: `/cart/clear?targetUserId=${id}`,
        method: 'DELETE',
        body: { productId, dealId, quantity },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    addCart: builder.mutation({
      query: ({
        id, token, productId, dealId, quantity,
        dealPrice, originalPrice, name, img, price
      }) => ({
        url: `/cart/add?targetUserId=${id}`,
        method: 'POST',
        body: {
          productId,
          dealId,
          quantity,
          dealPrice,
          originalPrice,
          name,
          img,
          price,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    Paystack: builder.mutation({
      query: ({ token, body }) => ({
        url: `/paystack`,
        method: 'POST',
        body,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    // ===== USERS ADMIN =====

    getAllUsers: builder.query({
      query: ({ token }) => ({
        url: '/AllUsers',
        headers: { Authorization: `Bearer ${token}` }
      }),
      providesTags: ['Buy'],
    }),

    getUserById: builder.query({
      query: ({ id, token }) => ({
        url: `/AllUsers/${id}`,
        headers: { Authorization: `Bearer ${token}` }
      }),
      providesTags: (r, e, { id }) => [{ type: 'Buy', id }],
    }),

    createUser: builder.mutation({
      query: ({ token, body }) => ({
        url: '/AllUsers',
        method: 'POST',
        body,
        headers: { Authorization: `Bearer ${token}` }
      }),
      invalidatesTags: ['Buy'],
    }),

    updateUserRole: builder.mutation({
      query: ({ id, token, body,Role }) => ({
        url: `/AllUsers/${id}/role`,
        method: 'PUT',
        body:{Role},
        headers: { Authorization: `Bearer ${token}` }
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Buy', id }],
    }),

    updateUserStatus: builder.mutation({
      query: ({ id, token, body }) => ({
        url: `/AllUsers/${id}/status`,
        method: 'PUT',
        body,
        headers: { Authorization: `Bearer ${token}` }
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Buy', id }],
    }),

    forceLogoutUser: builder.mutation({
      query: ({ id, token }) => ({
        url: `/AllUsers/${id}/force-logout`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Buy', id }],
    }),

    deleteUser: builder.mutation({
      query: ({ id, token, confirmation }) => ({
        url: `/AllUsers/${id}`,
        method: 'DELETE',
        body: { confirmation },
        headers: { Authorization: `Bearer ${token}` }
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    getUserActivityLogs: builder.query({
      query: ({ id, token, ...params }) => ({
        url: `/AllUsers/${id}/logs`,
        params,
        headers: { Authorization: `Bearer ${token}` }
      }),
      providesTags: (r, e, { id }) => [{ type: 'Buy', id }],
    }),

    getPlatformStatistics: builder.query({
      query: ({ token }) => ({
        url: '/AllUsers/stats/overview',
        headers: { Authorization: `Bearer ${token}` }
      }),
      providesTags: ['Buy'],
    }),

    searchUsers: builder.query({
      query: ({ token, query }) => ({
        url: '/AllUsers/search/users',
        params: { query },
        headers: { Authorization: `Bearer ${token}` }
      }),
      providesTags: ['Buy'],
    }),

    CreateOrder: builder.mutation({
      query: ({
        token,
        Username,
        branchId,
        ids,
        Customer,
        subtotal,
        paymentReference,
        companyId,
        items,
        shippingCost,
        tax,
        delivery,
      }) => ({
        url: `/User/Order/create`,
        method: 'POST',
        body: {
          Username,
          paymentReference,
          companyId,
          branchId,
          Customer,
          items,
          shippingCost,
          subtotal,
          tax,
          ids,
          delivery,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),
    Support: builder.mutation({
      query: ({
     formData
      }) => ({
        url: `/Support/ticket`,
        method: 'POST',
          body: formData,
        
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

      getAuditLogs: builder.query({
      query: ({ 
        page = 1, 
        limit = 10, 
        search = '', 
        role = 'All',
        startDate, 
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = {}) => {
        const params = new URLSearchParams({
          page,
          limit,
          search,
          sortBy,
          sortOrder,
          ...(role !== 'All' && { role }),
          ...(startDate && { startDate: startDate.toISOString() }),
          ...(endDate && { endDate: endDate.toISOString() })
        });
        
        return {
          url: `/AuditLogs?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'AuditLog', id })),
              { type: 'Buy', id: 'LIST' },
            ]
          : [{ type: 'Buy', id: 'LIST' }],
    }),

    // Get single audit log by ID
    getAuditLogById: builder.query({
      query: (id) => `/activities/${id}`,
      providesTags: (result, error, id) => [{ type: 'Buy', id }],
    }),

    // Create new audit log
    createAuditLog: builder.mutation({
      query: (activityData) => ({
        url: '/AuditLogs',
        method: 'POST',
        body: activityData,
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    // Update user role (your existing endpoint)
    // updateUserRole: builder.mutation({
    //   query: ({ id, token, Role }) => ({
    //     url: `/AllUsers/${id}/role`,
    //     method: 'PUT',
    //     body: { Role },
    //     headers: { Authorization: `Bearer ${token}` }
    //   }),
    //   invalidatesTags: (result, error, { id }) => [
    //     { type: 'Buy', id },
    //     { type: 'Buy', id: 'LIST' }
    //   ],
    // }),

    // Get audit statistics
    getAuditStats: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams({
          ...(startDate && { startDate: startDate.toISOString() }),
          ...(endDate && { endDate: endDate.toISOString() })
        });
        return `/AuditLogs/stats?${params.toString()}`;
      },
      providesTags: ['Buy'],
    }),

    // Get filter options
    getAuditFilters: builder.query({
      query: () => '/AuditLogs/filters',
      providesTags: ['Buy'],
    }),

    // Export audit logs
    exportAuditLogs: builder.mutation({
      query: ({ format = 'csv', startDate, endDate } = {}) => {
        const params = new URLSearchParams({
          format,
          ...(startDate && { startDate: startDate.toISOString() }),
          ...(endDate && { endDate: endDate.toISOString() })
        });
        return {
          url: `/AuditLogs/export?${params.toString()}`,
          method: 'GET',
          responseHandler: (response) => response.blob(),
        };
      },
    }),

    // Delete audit log (admin only)
    deleteAuditLog: builder.mutation({
      query: (id) => ({
        url: `/AuditLogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

    // Simulate audit activity (for testing)
    simulateAuditActivity: builder.mutation({
      query: (activityType) => ({
        url: '/AuditLogs/simulate',
        method: 'POST',
        body: { activityType },
      }),
      invalidatesTags: [{ type: 'Buy', id: 'LIST' }],
    }),

  }),
})

export const {
  useEditUserProfileMutation,
  useGetUserprofileQuery,
  usePaystackMutation,
  useUpdateProductQuantityMutation,
  useGetcartQuery,
  useGetEcomerceProductQuery,
  useGetSingleEcomQuery,
  useGetShopsQuery,
  useGetSingleShopsQuery,
  useUpdateUserStatusMutation,
  useGetDealsQuery,
  useAddCartMutation,
  useRemoveCardItemMutation,
  useGetUserActivityLogsQuery,
  useCreateOrderMutation,
  useClearCardItemMutation,
  useSearchUsersQuery,
  useGetPlatformStatisticsQuery,
  useUserOrdersQuery,
  useDeleteUserMutation,
  useForceLogoutUserMutation,
  useUpdateUserRoleMutation,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useGetAllUsersQuery,
  useGetAuditLogsQuery,
  useGetAuditLogByIdQuery,
  useCreateAuditLogMutation,
  useGetAuditStatsQuery,
  useGetAuditFiltersQuery,
  useExportAuditLogsMutation,
  useDeleteAuditLogMutation,
  useSupportMutation,
  useGetSimilarcateQuery,
  useSimulateAuditActivityMutation,
} = EcomerceSlice

const select = EcomerceSlice.endpoints.GetEcomerceProduct.select()

const selectors = createSelector(
  select,
  res => res?.data
)

export const {
  selectAll,
  selectById,
  selectEntities,
  selectIds,
  selectTotal,
} = Ecomerce.getSelectors(
  state => selectors(state) ?? InitialState
)
