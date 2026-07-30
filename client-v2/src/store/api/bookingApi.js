import { baseApi, listTags, TAGS } from './baseApi.js';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    bookings: builder.query({
      query: () => ({ url: '/bookings' }),
      providesTags: rows => listTags(TAGS.Booking, rows)
    }),
    booking: builder.query({
      query: reference => ({ url: `/bookings/${reference}` }),
      providesTags: (result, error, reference) => [{ type: TAGS.Booking, id: reference }]
    }),
    createBooking: builder.mutation({
      query: body => ({ url: '/bookings', method: 'POST', body }),
      invalidatesTags: [{ type: TAGS.Booking, id: 'LIST' }, { type: TAGS.AdminBooking, id: 'LIST' }, TAGS.AdminDashboard]
    }),
    cancelBooking: builder.mutation({
      query: reference => ({ url: `/bookings/${reference}/cancel`, method: 'PATCH' }),
      invalidatesTags: (result, error, reference) => [
        { type: TAGS.Booking, id: reference },
        { type: TAGS.Booking, id: 'LIST' },
        { type: TAGS.AdminBooking, id: 'LIST' },
        TAGS.AdminDashboard
      ]
    })
  })
});

export const {
  useBookingsQuery,
  useBookingQuery,
  useCreateBookingMutation,
  useCancelBookingMutation
} = bookingApi;
