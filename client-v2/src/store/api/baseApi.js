import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api/axiosBaseQuery.js';

/** Every cache tag used across the injected endpoint slices. */
export const TAGS = {
  Vehicle: 'Vehicle',
  Booking: 'Booking',
  Route: 'Route',
  Feedback: 'Feedback',
  Inquiry: 'Inquiry',
  Session: 'Session',
  AdminDashboard: 'AdminDashboard',
  AdminDriver: 'AdminDriver',
  AdminVehicle: 'AdminVehicle',
  AdminBooking: 'AdminBooking',
  AdminInquiry: 'AdminInquiry',
  AdminFeedback: 'AdminFeedback',
  AdminRoute: 'AdminRoute',
  AdminUser: 'AdminUser'
};

/** Builds `[{type,id}, …, {type,id:'LIST'}]` so item and list caches invalidate together. */
export const listTags = (type, rows, idKey = '_id') => [
  { type, id: 'LIST' },
  ...(Array.isArray(rows) ? rows.map(row => ({ type, id: row?.[idKey] })) : [])
];

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: Object.values(TAGS),
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
  endpoints: () => ({})
});
