import { useAxios } from "@/lib/useAxios";

export const activityLogService = {
  getActivityLogs: async (page = 1, pageSize = 20, action?: string) => {
    const axios = await useAxios();
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const query = new URLSearchParams({
      page: String(validPage),
      pageSize: String(validPageSize),
    });
    if (action) {
      const cleanAction = action.trim();
      if (cleanAction) {
        query.set("action", cleanAction);
      }
    }
    const response = await axios.get(`/activity-logs?${query.toString()}`);
    return response.data;
  },

  deleteLog: async (id: string) => {
    const axios = await useAxios();
    const cleanId = (id || "").trim();
    const response = await axios.delete(`/activity-logs/${cleanId}`);
    return response.data;
  },

  clearLogs: async () => {
    const axios = await useAxios();
    const response = await axios.delete("/activity-logs/clear");
    return response.data;
  },
};
