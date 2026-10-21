import { useAxios } from "@/lib/useAxios";

export interface NotificationQueryParams {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

export const notificationService = {
  getNotifications: async (page = 1, pageSize = 20, unreadOnly = false) => {
    const axios = await useAxios();
    const query = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (unreadOnly) {
      query.append("unreadOnly", "true");
    }
    const response = await axios.get(`/notifications?${query.toString()}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const axios = await useAxios();
    try {
      const response = await axios.get("/notifications?unreadOnly=true&pageSize=1");
      const total = response.data?.meta?.totalItems ?? response.data?.total ?? 0;
      return { data: { count: total }, count: total };
    } catch {
      return { data: { count: 0 }, count: 0 };
    }
  },

  markAsRead: async (notificationIds?: string[]) => {
    const axios = await useAxios();
    const response = await axios.post("/notifications/mark-read", { notificationIds });
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/notifications/${id}`);
    return response.data;
  },
};
