import useAxios from "@/lib/useAxios";

export const notificationService = {
  getNotifications: async (page = 1, limit = 20) => {
    const axios = useAxios();
    const response = await axios.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  markAsRead: async (notificationIds?: string[]) => {
    const axios = useAxios();
    const response = await axios.post("/notifications/mark-read", { notificationIds });
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const axios = useAxios();
    const response = await axios.delete(`/notifications/${id}`);
    return response.data;
  },
};
