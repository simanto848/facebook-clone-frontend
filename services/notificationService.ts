import { useAxios } from "@/lib/useAxios";

export interface NotificationQueryParams {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const notificationService = {
  getNotifications: async (page = 1, pageSize = 20, unreadOnly = false) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const query = new URLSearchParams({
      page: validPage.toString(),
      pageSize: validPageSize.toString(),
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
    const payload: { notificationIds?: string[] } = {};
    if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      const validIds = notificationIds.filter((id) => typeof id === "string" && UUID_REGEX.test(id));
      if (validIds.length > 0) {
        payload.notificationIds = validIds;
      }
    }
    const response = await axios.post("/notifications/mark-read", payload);
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const axios = await useAxios();
    const cleanId = (id || "").trim();
    const response = await axios.delete(`/notifications/${cleanId}`);
    return response.data;
  },
};
