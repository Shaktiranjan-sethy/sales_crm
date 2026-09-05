import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_URL || "/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("crm_token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Auth", "Leads", "Customers", "Deals", "Activities", "Users", "Roles", "Permissions", "Enquiries", "Reminders", "Followups", "Notifications", "Dashboard", "Timeline"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    me: builder.query({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    dashboard: builder.query({
      query: () => "/dashboard",
      providesTags: ["Dashboard"],
    }),
    listLeads: builder.query({
      query: (params) => ({ url: "/leads", params }),
      providesTags: ["Leads"],
    }),
    getLead: builder.query({
      query: (id) => `/leads/${id}`,
      providesTags: (r, e, id) => [{ type: "Leads", id }],
    }),
    createLead: builder.mutation({
      query: (body) => ({ url: "/leads", method: "POST", body }),
      invalidatesTags: ["Leads", "Dashboard", "Notifications"],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/leads/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Leads", "Dashboard", "Timeline", "Notifications"],
    }),
    deleteLead: builder.mutation({
      query: (id) => ({ url: `/leads/${id}`, method: "DELETE" }),
      invalidatesTags: ["Leads", "Dashboard", "Timeline"],
    }),
    convertLead: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/leads/${id}/convert`, method: "POST", body }),
      invalidatesTags: ["Leads", "Customers", "Deals", "Dashboard", "Timeline", "Notifications"],
    }),
    listCustomers: builder.query({
      query: (params) => ({ url: "/customers", params }),
      providesTags: ["Customers"],
    }),
    getCustomer: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: (r, e, id) => [{ type: "Customers", id }],
    }),
    createCustomer: builder.mutation({
      query: (body) => ({ url: "/customers", method: "POST", body }),
      invalidatesTags: ["Customers", "Dashboard", "Notifications"],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/customers/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Customers", "Timeline"],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({ url: `/customers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Customers", "Dashboard", "Timeline"],
    }),
    listDeals: builder.query({
      query: (params) => ({ url: "/deals", params }),
      providesTags: ["Deals"],
    }),
    getDeal: builder.query({
      query: (id) => `/deals/${id}`,
      providesTags: (r, e, id) => [{ type: "Deals", id }],
    }),
    createDeal: builder.mutation({
      query: (body) => ({ url: "/deals", method: "POST", body }),
      invalidatesTags: ["Deals", "Dashboard", "Notifications"],
    }),
    updateDeal: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/deals/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Deals", "Dashboard", "Timeline", "Notifications"],
    }),
    deleteDeal: builder.mutation({
      query: (id) => ({ url: `/deals/${id}`, method: "DELETE" }),
      invalidatesTags: ["Deals", "Dashboard", "Timeline"],
    }),
    listActivities: builder.query({
      query: (params) => ({ url: "/activities", params }),
      providesTags: ["Activities"],
    }),
    getActivity: builder.query({
      query: (id) => `/activities/${id}`,
      providesTags: (r, e, id) => [{ type: "Activities", id }],
    }),
    createActivity: builder.mutation({
      query: (body) => ({ url: "/activities", method: "POST", body }),
      invalidatesTags: ["Activities", "Dashboard", "Timeline", "Notifications"],
    }),
    updateActivity: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/activities/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Activities", "Dashboard", "Timeline"],
    }),
    deleteActivity: builder.mutation({
      query: (id) => ({ url: `/activities/${id}`, method: "DELETE" }),
      invalidatesTags: ["Activities", "Dashboard", "Timeline"],
    }),
    getTimeline: builder.query({
      query: ({ entityType, entityId }) => `/timeline/${entityType}/${entityId}`,
      providesTags: ["Timeline"],
    }),
    notifications: builder.query({
      query: () => "/notifications",
      providesTags: ["Notifications"],
    }),
    markAllRead: builder.mutation({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Notifications"],
    }),
    assignees: builder.query({
      query: () => "/users/assignees",
    }),
    listUsers: builder.query({
      query: (params) => ({ url: "/users", params }),
      providesTags: ["Users"],
    }),
    createUser: builder.mutation({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["Users"],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: "/auth/profile", method: "PATCH", body }),
      invalidatesTags: ["Auth"],
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
    }),
    // Role management
    listRoles: builder.query({
      query: (params) => ({ url: "/roles", params }),
      providesTags: ["Roles"],
    }),
    getRole: builder.query({
      query: (id) => `/roles/${id}`,
      providesTags: (r, e, id) => [{ type: "Roles", id }],
    }),
    createRole: builder.mutation({
      query: (body) => ({ url: "/roles", method: "POST", body }),
      invalidatesTags: ["Roles"],
    }),
    updateRole: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/roles/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Roles"],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: ["Roles"],
    }),
    getAvailablePermissions: builder.query({
      query: () => "/roles/permissions",
    }),
    // Permission management
    listPermissions: builder.query({
      query: (params) => ({ url: "/permissions", params }),
      providesTags: ["Permissions"],
    }),
    getPermission: builder.query({
      query: (id) => `/permissions/${id}`,
      providesTags: (r, e, id) => [{ type: "Permissions", id }],
    }),
    createPermission: builder.mutation({
      query: (body) => ({ url: "/permissions", method: "POST", body }),
      invalidatesTags: ["Permissions"],
    }),
    updatePermission: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/permissions/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Permissions"],
    }),
    deletePermission: builder.mutation({
      query: (id) => ({ url: `/permissions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Permissions"],
    }),
    getPermissionCategories: builder.query({
      query: () => "/permissions/categories",
    }),
    getPermissionActions: builder.query({
      query: () => "/permissions/actions",
    }),
    // Enquiries, Reminders, Followups
    listEnquiries: builder.query({
      query: (params) => ({ url: "/enquiries", params }),
      providesTags: ["Enquiries"],
    }),
    listReminders: builder.query({
      query: (params) => ({ url: "/reminders", params }),
      providesTags: ["Reminders"],
    }),
    listFollowups: builder.query({
      query: (params) => ({ url: "/followups", params }),
      providesTags: ["Followups"],
    }),
  }),
});

export const {
  useLoginMutation,
  useMeQuery,
  useDashboardQuery,
  useListLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useConvertLeadMutation,
  useListCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useListDealsQuery,
  useGetDealQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useDeleteDealMutation,
  useListActivitiesQuery,
  useGetActivityQuery,
  useCreateActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
  useGetTimelineQuery,
  useNotificationsQuery,
  useMarkAllReadMutation,
  useAssigneesQuery,
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useListRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetAvailablePermissionsQuery,
  useListEnquiriesQuery,
  useListRemindersQuery,
  useListFollowupsQuery,
  useListPermissionsQuery,
  useGetPermissionQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useGetPermissionCategoriesQuery,
  useGetPermissionActionsQuery,
} = api;
