import api from "./axiosInstance";

const BASE = "/api/v1/events";

export type EventBooking = {
  _id: string;
  hall: string;
  dueDateOfExpectingMother?: string;
  eventType: string;
  otherEventType?: string;
  proposedDate?: string;
  days?: number;
  name: string;
  mobileNumber: string;
  email: string;
  mrn?: string;
  isViewed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EventListParams = {
  page?: number;
  limit?: number;
  isViewed?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const getAllEvents = async (params: EventListParams = {}) => {
  return api.get(BASE, { params });
};

export const getEventById = async (id: string) => {
  return api.get(`${BASE}/${id}`);
};

export const deleteEvent = async (id: string) => {
  return api.delete(`${BASE}/${id}`);
};
