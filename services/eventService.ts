import { useAxios } from "@/lib/useAxios";

export interface CreateEventInput {
  title: string;
  description?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  category?: string;
  coverImage?: string;
  coverUrl?: string;
}

export const eventService = {
  getEvents: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/events?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getEventById: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: CreateEventInput) => {
    const axios = await useAxios();
    const payload: Record<string, any> = {
      title: data.title,
      description: data.description,
      location: data.location,
      startTime: data.startTime || (data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString()),
    };
    if (data.endTime || data.endDate) {
      payload.endTime = data.endTime || new Date(data.endDate!).toISOString();
    }
    if (data.coverUrl || data.coverImage) {
      payload.coverUrl = data.coverUrl || data.coverImage;
    }
    const response = await axios.post("/events", payload);
    return response.data;
  },

  rsvpEvent: async (id: string, status: "going" | "interested" | "declined" | string) => {
    const axios = await useAxios();
    const response = await axios.post(`/events/${id}/rsvp`, { status: status.toLowerCase() });
    return response.data;
  },

  updateEvent: async (id: string, data: Partial<CreateEventInput>) => {
    const axios = await useAxios();
    const payload: Record<string, any> = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.location !== undefined) payload.location = data.location;
    if (data.startTime || data.startDate) {
      payload.startTime = data.startTime || new Date(data.startDate!).toISOString();
    }
    if (data.endTime || data.endDate) {
      payload.endTime = data.endTime || new Date(data.endDate!).toISOString();
    }
    if (data.coverUrl || data.coverImage) {
      payload.coverUrl = data.coverUrl || data.coverImage;
    }
    const response = await axios.patch(`/events/${id}`, payload);
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/events/${id}`);
    return response.data;
  },
};
