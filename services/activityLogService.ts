import { useAxios } from "@/lib/useAxios";

export const activityLogService = {
  getActivityLogs: async (page = 1, pageSize = 20, action?: string) => {
    const axios = await useAxios();
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (action) {
      query.set("action", action);
    }
    const response = await axios.get(`/activity-logs?${query.toString()}`);
    return response.data;
  },

  deleteLog: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.delete(`/activity-logs/${id}`);
    return response.data;
  },

  clearLogs: async () => {
    const axios = await useAxios();
    const response = await axios.delete("/activity-logs/clear");
    return response.data;
  },
};
