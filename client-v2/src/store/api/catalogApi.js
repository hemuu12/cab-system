import { baseApi, listTags, TAGS } from './baseApi.js';

/** Photon can return the same OSM feature more than once for a query. */
const uniqueLocations = response => {
  const locations = Array.isArray(response) ? response : [];
  const seen = new Set();

  return locations.filter(location => {
    const identity = location?.id || `${location?.lat}:${location?.lon}:${location?.label || ''}`;
    if (!location || seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
};

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
    searchLocations: builder.query({
      query: query => ({ url: '/locations/search', params: { q: query }, skipErrorToast: true }),
      transformResponse: uniqueLocations,
      keepUnusedDataFor: 600
    }),
    feedback: builder.query({
      query: () => ({ url: '/feedback?limit=100', skipErrorToast: true }),
      // Accept the previous array response while frontend/backend deployments roll over.
      transformResponse: response => Array.isArray(response)
        ? { reviews: response, verifiedCount: response.length }
        : { reviews: response?.reviews || [], verifiedCount: Number(response?.verifiedCount) || 0 },
      providesTags: result => listTags(TAGS.Feedback, result?.reviews)
    }),
    createFeedback: builder.mutation({
      query: body => ({ url: '/feedback', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Feedback, id: 'LIST' }, { type: TAGS.AdminFeedback, id: 'LIST' }]
    }),
    createInquiry: builder.mutation({
      query: body => ({ url: '/inquiries', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.AdminInquiry, id: 'LIST' }]
    }),
    // Resolves the real road distance for a pickup/drop pair. Used before navigating to
    // /results so the booking widget never falls back to a guessed or stale km figure.
    quote: builder.mutation({
      query: body => ({ url: '/quotes', method: 'POST', body, skipErrorToast: true })
    })
  })
});

export const {
  useVehiclesQuery,
  useVehicleQuery,
  useRoutesQuery,
  useLazySearchLocationsQuery,
  useFeedbackQuery,
  useCreateFeedbackMutation,
  useCreateInquiryMutation,
  useQuoteMutation
} = catalogApi;
