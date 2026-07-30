import { baseApi, listTags, TAGS } from './baseApi.js';

/**
 * Public catalogue: vehicles, routes and published feedback.
 *
 * The list queries load in the background to populate a page that already has
 * usable fallback content, so they pass `skipErrorToast` — a failure there is
 * not something the user asked for and must not raise a notification. Reads
 * driven by an explicit user action still toast normally.
 */
export const catalogApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    vehicles: builder.query({
      query: () => ({ url: '/vehicles', skipErrorToast: true }),
      providesTags: rows => listTags(TAGS.Vehicle, rows)
    }),
    vehicle: builder.query({
      query: id => ({ url: `/vehicles/${id}` }),
      providesTags: (result, error, id) => [{ type: TAGS.Vehicle, id }]
    }),
    routes: builder.query({
      query: () => ({ url: '/routes', skipErrorToast: true }),
      providesTags: rows => listTags(TAGS.Route, rows)
    }),
    feedback: builder.query({
      query: () => ({ url: '/feedback?limit=100', skipErrorToast: true }),
      providesTags: rows => listTags(TAGS.Feedback, rows)
    }),
    createFeedback: builder.mutation({
      query: body => ({ url: '/feedback', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Feedback, id: 'LIST' }, { type: TAGS.AdminFeedback, id: 'LIST' }]
    }),
    createInquiry: builder.mutation({
      query: body => ({ url: '/inquiries', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.AdminInquiry, id: 'LIST' }]
    })
  })
});

export const {
  useVehiclesQuery,
  useVehicleQuery,
  useRoutesQuery,
  useFeedbackQuery,
  useCreateFeedbackMutation,
  useCreateInquiryMutation
} = catalogApi;
