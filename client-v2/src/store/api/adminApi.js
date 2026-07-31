import { baseApi, listTags, TAGS } from './baseApi.js';

/**
 * The admin console is section-driven, so a single generic `adminResource`
 * query serves every table instead of eight near-identical endpoints. The
 * `resource` argument maps to both the URL segment and the cache tag.
 */
export const ADMIN_RESOURCES = {
  drivers: { path: 'drivers', tag: TAGS.AdminDriver },
  vehicles: { path: 'vehicles', tag: TAGS.AdminVehicle },
  bookings: { path: 'bookings', tag: TAGS.AdminBooking },
  inquiries: { path: 'inquiries', tag: TAGS.AdminInquiry },
  feedback: { path: 'feedback', tag: TAGS.AdminFeedback },
  routes: { path: 'routes', tag: TAGS.AdminRoute },
  users: { path: 'users', tag: TAGS.AdminUser }
};

const tagFor = resource => ADMIN_RESOURCES[resource]?.tag || TAGS.AdminDashboard;

/** Public-facing caches that must refresh when an admin edits the same entity. */
const PUBLIC_MIRROR = { vehicles: TAGS.Vehicle, routes: TAGS.Route, feedback: TAGS.Feedback, bookings: TAGS.Booking };

const invalidateResource = (resource, id) => {
  const tags = [{ type: tagFor(resource), id: 'LIST' }, TAGS.AdminDashboard];
  if (id) tags.push({ type: tagFor(resource), id });
  // A vehicle's rate card or premium may have changed, so the pricing screen must refetch.
  if (resource === 'vehicles') tags.push({ type: TAGS.AdminVehicle, id: 'PRICING' });
  const mirror = PUBLIC_MIRROR[resource];
  if (mirror) tags.push({ type: mirror, id: 'LIST' }, ...(id ? [{ type: mirror, id }] : []));
  return tags;
};

export const adminApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    adminDashboard: builder.query({
      query: () => ({ url: '/admin/dashboard' }),
      providesTags: [TAGS.AdminDashboard]
    }),
    adminResource: builder.query({
      query: resource => ({ url: `/admin/${resource}` }),
      providesTags: (rows, error, resource) => listTags(tagFor(resource), rows)
    }),
    adminCreate: builder.mutation({
      query: ({ resource, body }) => ({ url: `/admin/${resource}`, method: 'POST', body }),
      invalidatesTags: (result, error, { resource }) => invalidateResource(resource)
    }),
    adminUpdate: builder.mutation({
      query: ({ resource, id, body }) => ({ url: `/admin/${resource}/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { resource, id }) => invalidateResource(resource, id)
    }),
    adminDelete: builder.mutation({
      query: ({ resource, id }) => ({ url: `/admin/${resource}/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { resource, id }) => invalidateResource(resource, id)
    }),
    adminPricing: builder.query({
      query: () => ({ url: '/admin/pricing' }),
      providesTags: [{ type: TAGS.AdminVehicle, id: 'PRICING' }]
    }),
    /** Prices sample trips without saving, so a rate change can be checked before it goes live. */
    adminPricingPreview: builder.mutation({
      query: body => ({ url: '/admin/pricing/preview', method: 'POST', body })
    }),
    adminUpdatePricingClass: builder.mutation({
      query: ({ key, body }) => ({ url: `/admin/pricing/${key}`, method: 'PATCH', body }),
      invalidatesTags: [
        { type: TAGS.AdminVehicle, id: 'PRICING' },
        { type: TAGS.AdminVehicle, id: 'LIST' },
        { type: TAGS.Vehicle, id: 'LIST' },
        TAGS.AdminDashboard
      ]
    }),
    adminUploadVehicleImage: builder.mutation({
      query: ({ id, file }) => {
        const body = new FormData();
        body.append('image', file);
        return { url: `/admin/vehicles/${id}/images`, method: 'POST', body };
      },
      invalidatesTags: (result, error, { id }) => invalidateResource('vehicles', id)
    }),
    adminDeleteVehicleImage: builder.mutation({
      query: ({ vehicleId, imageId }) => ({ url: `/admin/vehicles/${vehicleId}/images/${imageId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { vehicleId }) => invalidateResource('vehicles', vehicleId)
    })
  })
});

export const {
  useAdminDashboardQuery,
  useAdminResourceQuery,
  useAdminCreateMutation,
  useAdminUpdateMutation,
  useAdminDeleteMutation,
  useAdminPricingQuery,
  useAdminPricingPreviewMutation,
  useAdminUpdatePricingClassMutation,
  useAdminUploadVehicleImageMutation,
  useAdminDeleteVehicleImageMutation
} = adminApi;
