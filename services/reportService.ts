import { useAxios } from "@/lib/useAxios";

export interface CreateReportInput {
  targetId: string;
  targetType: "POST" | "USER" | "COMMENT" | "GROUP" | "PAGE" | string;
  reason: string;
  details?: string;
}

export const reportService = {
  createReport: async (data: CreateReportInput) => {
    const axios = await useAxios();
    const response = await axios.post("/reports", data);
    return response.data;
  },

  getReports: async () => {
    const axios = await useAxios();
    const response = await axios.get("/reports");
    return response.data;
  },
};
