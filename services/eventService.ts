import useAxios from "@/lib/useAxios";

export interface CreateEventInput {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  category?: string;
  coverImage?: string;
}

export const eventService = {
  getEvents: async (page = 1, limit = 20) => {
    const axios = useAxios();
    const response = await axios.get(`/events?page=${page}&limit=${limit}`);
    return response.data;
  },

  getEventById: async (id: string) => {
    const axios = useAxios();
    const response = await axios.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: CreateEventInput) => {
    const axios = useAxios();
    const response = await axios.post("/events", data);
    return response.data;
  },

  rsvpEvent: async (id: string, status: "GOING" | "INTERESTED" | "DECLINED") => {
    const axios = useAxios();
    const response = await axios.post(`/events/${id}/rsvp`, { status });
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const axios = useAxios();
    const response = await axios.delete(`/events/${id}`);
    return response.data;
  },
};
