import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeSessions: [],
  statistics: {
    totalActiveSessions: 0,
    userProfiles: 0,
    admins: 0,
    companyUsers: 0,
    protectedSuperAdmins: 0,
  },
  filter: {
    userType: 'all',
    dateRange: 'today',
    searchTerm: '',
  },
  forceLogoutLogs: [],
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    totalItems: 0,
  },
  loading: false,
  error: null,
  lastAction: null,
};

const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setSearchTerm: (state, action) => {
      state.filter.searchTerm = action.payload;
    },
    setUserTypeFilter: (state, action) => {
      state.filter.userType = action.payload;
    },
    setDateRange: (state, action) => {
      state.filter.dateRange = action.payload;
    },
    setSelectedUserId: (state, action) => {
      state.selectedUserId = action.payload;
    },
    setSelectedUserType: (state, action) => {
      state.selectedUserType = action.payload;
    },
    setForceLogoutReason: (state, action) => {
      state.forceLogoutReason = action.payload;
    },
    clearForceLogoutData: (state) => {
      state.selectedUserId = '';
      state.selectedUserType = 'UserProfile';
      state.forceLogoutReason = '';
    },
    setLastAction: (state, action) => {
      state.lastAction = {
        type: action.payload.type,
        timestamp: new Date().toISOString(),
        details: action.payload.details,
      };
    },
    resetSecurityState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Handle active sessions query
      .addMatcher(
        (action) => action.type.endsWith('/getActiveSessions/fulfilled'),
        (state, action) => {
          state.activeSessions = action.payload.sessions || [];
          state.statistics.totalActiveSessions = action.payload.count || 0;
        }
      )
      // Handle security stats query
      .addMatcher(
        (action) => action.type.endsWith('/getSecurityStats/fulfilled'),
        (state, action) => {
          state.statistics = { ...state.statistics, ...action.payload };
        }
      )
      // Handle force logout logs query
      .addMatcher(
        (action) => action.type.endsWith('/getForceLogoutLogs/fulfilled'),
        (state, action) => {
          state.forceLogoutLogs = action.payload.logs || [];
          state.pagination = action.payload.pagination || state.pagination;
        }
      )
      // Handle loading states
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // Handle error states
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || 'An error occurred';
        }
      )
      // Handle fulfilled states
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      );
  },
});

export const {
  setFilter,
  setSearchTerm,
  setUserTypeFilter,
  setDateRange,
  setSelectedUserId,
  setSelectedUserType,
  setForceLogoutReason,
  clearForceLogoutData,
  setLastAction,
  resetSecurityState,
} = securitySlice.actions;

export default securitySlice.reducer;