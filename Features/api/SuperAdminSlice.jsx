import {createEntityAdapter,createSelector} from "@reduxjs/toolkit"
import { apiSlice } from "./ApiSlices"

const SuperAdminAdapter=createEntityAdapter()
const InitialState=SuperAdminAdapter.getInitialState()

const SuperAdminSlice=apiSlice.injectEndpoints({
        endpoints:(builder)=>({
            GetHealth:builder.query({
                query:({token})=>({
                    url:"/health",
                    method:"GET",
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                })
            }),            
            GetFullSnapshot:builder.query({
                query:({token})=>({
                    url:"/full-snapshot",
                    method:"GET",
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                })
            }),
            GetIventoryData:builder.query({
                query:({token})=>({
                    url:"/GetIventoryData/all-data",
                    method:"GET",
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                })
            }),
            metrics:builder.query({
                query:({token})=>({
                    url:"/metrics/history",
                    method:"GET",
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                })
            }),            
            GetAllOrders:builder.query({
                query:({token})=>({
                    url:"/GetAllOrders",
                    method:"GET",
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                })
            })    ,
              getPendingNotifications: builder.query({
      query: ({token}) => ({
        method:"GET",
        url:'/Notifications/pending',
        headers:{
            Authorization:`Bearer ${token}`
        }
    }),
      providesTags: ['Pending'],
    }),
    
    // GET Notification History with Pagination
    getNotificationHistory: builder.query({
      query: ({ page = 1, limit = 20 ,token}) => ({
        method:"GET",
        url:`/Notifications/history?page=${page}&limit=${limit}`,
        headers:{
            Authorization:`Bearer ${token}`
        }
    }),
      providesTags: ['History'],
    }),
    
    // GET Single Notification
    getNotificationById: builder.query({
      query: (id,{token}) => ({
        method:"GET",
        url:`/Notifications/${id}`,
        headers:{
            Authorization:`Bearer ${token}`
        }
    }),
      providesTags: (result, error, id) => [{ type: 'Notification', id }],
    }),
    
    // CREATE Notification
    createNotification: builder.mutation({
      query: (notificationData) => ({
        url: '/Notifications',
        method: 'POST',
        body: notificationData,
        headers:{
        Authorization:`Bearer ${notificationData.token}`
        }
      }),
      invalidatesTags: ['Pending', 'History'],
    }),
    
    // UPDATE Notification
    updateNotification: builder.mutation({
      query: ({ token,id, ...notificationData}) => ({
        url: `/Notifications/${id}`,
        method: 'PUT',
        body: notificationData,
        headers:{
            Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: (result, error, { id }) => [
        'Pending',
        'History',
        { type: 'Notification', id },
      ],
    }),
    
    // CANCEL Notification
    cancelNotification: builder.mutation({
      query: (id,{token}) => ({
        url: `/Notifications/${id}/cancel`,
        method: 'POST',
        headers:{
            Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: ['Pending', 'History'],
    }),
    
    // SEND Notification Now
    sendNotificationNow: builder.mutation({
      query: (id,{token}) => ({
        url: `/Notifications/${id}/send`,
        method: 'POST',
        headers:{
            Authorization:`Bearer ${token}`
        }
      }),
      invalidatesTags: ['Pending', 'History'],
    }),        


       getSystemConfig: builder.query({
      query: () => '/SuperAdminSettings/system/config',
      providesTags: ['SystemConfig'],
    }),
    updateSystemConfig: builder.mutation({
      query: (updates) => ({
        url: '/SuperAdminSettings/system/config',
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['SystemConfig', 'Dashboard'],
    }),
    deployConfig: builder.mutation({
      query: () => ({
        url: '/SuperAdminSettings/system/config/deploy',
        method: 'POST',
      }),
      invalidatesTags: ['SystemConfig', 'Dashboard'],
    }),
    resetConfig: builder.mutation({
      query: () => ({
        url: '/SuperAdminSettings/system/config/reset',
        method: 'POST',
      }),
      invalidatesTags: ['SystemConfig', 'Dashboard'],
    }),

    // Shareholders
    getShareholders: builder.query({
      query: () => '/SuperAdminSettings/shareholders',
      providesTags: ['Shareholders'],
    }),
    getCapTable: builder.query({
      query: () => '/SuperAdminSettings/shareholders/captable',
      providesTags: ['Shareholders'],
    }),
    getShareholder: builder.query({
      query: (id) => `/SuperAdminSettings/shareholders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Shareholders', id }],
    }),
    createShareholder: builder.mutation({
      query: (data) => ({
        url: '/shareholders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Shareholders', 'Dashboard'],
    }),
    updateShareholder: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/SuperAdminSettings/shareholders/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Shareholders', 'Dashboard'],
    }),
    deleteShareholder: builder.mutation({
      query: (id) => ({
        url: `/SuperAdminSettings/shareholders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shareholders', 'Dashboard'],
    }),

    // Integrations
    getIntegrations: builder.query({
      query: () => '/SuperAdminSettings/integrations',
      providesTags: ['Integrations'],
    }),
    getIntegration: builder.query({
      query: (id) => `/SuperAdminSettings/integrations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Integrations', id }],
    }),
    createIntegration: builder.mutation({
      query: (data) => ({
        url: '/SuperAdminSettings/integrations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Integrations', 'Dashboard'],
    }),
    updateIntegration: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/SuperAdminSettings/integrations/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Integrations', 'Dashboard'],
    }),
    testIntegration: builder.mutation({
      query: (id) => ({
        url: `/SuperAdminSettings/integrations/${id}/test`,
        method: 'POST',
      }),
      invalidatesTags: ['Integrations'],
    }),
    syncAllIntegrations: builder.mutation({
      query: () => ({
        url: '/SuperAdminSettings/integrations/sync/all',
        method: 'POST',
      }),
      invalidatesTags: ['Integrations', 'Dashboard'],
    }),
    toggleIntegration: builder.mutation({
      query: (id) => ({
        url: `/SuperAdminSettings/integrations/${id}/toggle`,
        method: 'POST',
      }),
      invalidatesTags: ['Integrations', 'Dashboard'],
    }),

    // Nodes
    getNodes: builder.query({
      query: () => '/SuperAdminSettings/nodes',
      providesTags: ['Nodes'],
    }),
    getNode: builder.query({
      query: (id) => `/nodes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Nodes', id }],
    }),
    createNode: builder.mutation({
      query: (data) => ({
        url: '/SuperAdminSettings/nodes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Nodes', 'Dashboard'],
    }),
    updateNode: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/SuperAdminSettings/nodes/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Nodes', 'Dashboard'],
    }),
    deleteNode: builder.mutation({
      query: (id) => ({
        url: `/SuperAdminSettings/nodes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Nodes', 'Dashboard'],
    }),
    pingNode: builder.mutation({
      query: (id) => ({
        url: `/SuperAdminSettings/nodes/${id}/ping`,
        method: 'POST',
      }),
      invalidatesTags: ['Nodes', 'Dashboard'],
    }),
    pingAllNodes: builder.mutation({
      query: () => ({
        url: '/SuperAdminSettings/nodes/ping/all',
        method: 'POST',
      }),
      invalidatesTags: ['Nodes', 'Dashboard'],
    }),
    restartNode: builder.mutation({
      query: (id) => ({
        url: `/SuperAdminSettings/nodes/${id}/restart`,
        method: 'POST',
      }),
      invalidatesTags: ['Nodes'],
    }),

    // Dashboard & Utilities
    getDashboard: builder.query({
      query: () => '/SuperAdminSettings/dashboard',
      providesTags: ['Dashboard'],
    }),
    getSystemHealth: builder.query({
      query: () => '/system/health',
    }),
    flushCache: builder.mutation({
      query: () => ({
        url: '/SuperAdminSettings/system/cache/flush',
        method: 'POST',
      }),
    }),
    searchGlobal: builder.query({
      query: (query) => `/search?query=${query}`,
    }),
    initializeDefaults: builder.mutation({
      query: () => ({
        url: '/SuperAdminSettings/initialize',
        method: 'POST',
      }),
      invalidatesTags: ['SystemConfig', 'Shareholders', 'Integrations', 'Nodes', 'Dashboard'],
    }),


        })
        })



export const {useGetHealthQuery,useGetFullSnapshotQuery,useMetricsQuery,useGetAllOrdersQuery,useGetIventoryDataQuery,
 useGetPendingNotificationsQuery,
  useGetNotificationHistoryQuery,
  useGetNotificationByIdQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useCancelNotificationMutation,
  useSendNotificationNowMutation,
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
  useDeployConfigMutation,
  useResetConfigMutation,
  
  // Shareholders
  useGetShareholdersQuery,
  useGetCapTableQuery,
  useGetShareholderQuery,
  useCreateShareholderMutation,
  useUpdateShareholderMutation,
  useDeleteShareholderMutation,
  
  // Integrations
  useGetIntegrationsQuery,
  useGetIntegrationQuery,
  useCreateIntegrationMutation,
  useUpdateIntegrationMutation,
  useTestIntegrationMutation,
  useSyncAllIntegrationsMutation,
  useToggleIntegrationMutation,
  
  // Nodes
  useGetNodesQuery,
  useGetNodeQuery,
  useCreateNodeMutation,
  useUpdateNodeMutation,
  useDeleteNodeMutation,
  usePingNodeMutation,
  usePingAllNodesMutation,
  useRestartNodeMutation,
  
  // Dashboard & Utilities
  useGetDashboardQuery,
  useGetSystemHealthQuery,
  useFlushCacheMutation,
  useSearchGlobalQuery,
  useInitializeDefaultsMutation,

}=SuperAdminSlice

const select=SuperAdminSlice.endpoints.GetCompanyUsers.select();

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
}=SuperAdminAdapter.getSelectors(state=>selectors(state)??InitialState)
