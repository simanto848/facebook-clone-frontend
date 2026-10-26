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

const toIsoString = (val?: string): string | undefined => {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

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
    const rawStart = data.startDate && data.startTime && !data.startTime.includes("T")
      ? `${data.startDate}T${data.startTime}`
      : data.startTime || data.startDate || new Date().toISOString();
    const startTime = toIsoString(rawStart) || new Date().toISOString();

    const payload: Record<string, any> = {
      title: data.title.trim().slice(0, 150),
      startTime,
    };
    if (data.description) payload.description = data.description.trim().slice(0, 1000);
    if (data.location) payload.location = data.location.trim().slice(0, 255);

    const rawEnd = data.endDate && data.endTime && !data.endTime.includes("T")
      ? `${data.endDate}T${data.endTime}`
      : data.endTime || data.endDate;
    const endTime = toIsoString(rawEnd);
    if (endTime) {
      payload.endTime = endTime;
    }

    const cover = data.coverUrl || data.coverImage;
    if (cover) {
      payload.coverUrl = cover;
    }

    const response = await axios.post("/events", payload);
    return response.data;
  },

  rsvpEvent: async (id: string, status: "going" | "interested" | "declined" | string) => {
    const axios = await useAxios();
    const lower = (status || "").toLowerCase().trim();
    const validStatus = lower === "going" || lower === "attending"
      ? "going"
      : lower === "declined" || lower === "not_going"
      ? "declined"
      : "interested";
    const response = await axios.post(`/events/${id}/rsvp`, { status: validStatus });
    return response.data;
  },

  updateEvent: async (id: string, data: Partial<CreateEventInput>) => {
    const axios = await useAxios();
    const payload: Record<string, any> = {};
    if (data.title !== undefined) payload.title = data.title.trim().slice(0, 150);
    if (data.description !== undefined) payload.description = data.description.trim().slice(0, 1000);
    if (data.location !== undefined) payload.location = data.location.trim().slice(0, 255);
    if (data.startTime || data.startDate) {
      const rawStart = data.startDate && data.startTime && !data.startTime.includes("T")
        ? `${data.startDate}T${data.startTime}`
        : data.startTime || data.startDate;
      const startTime = toIsoString(rawStart);
      if (startTime) payload.startTime = startTime;
    }
    if (data.endTime || data.endDate) {
      const rawEnd = data.endDate && data.endTime && !data.endTime.includes("T")
        ? `${data.endDate}T${data.endTime}`
        : data.endTime || data.endDate;
      const endTime = toIsoString(rawEnd);
      if (endTime) payload.endTime = endTime;
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
