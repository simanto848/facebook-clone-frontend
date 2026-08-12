import { useAxios } from "@/lib/useAxios";

export const activityLogService = {
  getActivityLogs: async (page = 1, limit = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/activity-logs?page=${page}&limit=${limit}`);
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
