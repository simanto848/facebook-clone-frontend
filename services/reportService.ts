import { useAxios } from "@/lib/useAxios";

export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";

export type ReportTargetType = "POST" | "COMMENT" | "USER";

export interface CreateReportInput {
  targetId: string;
  targetType: ReportTargetType | string;
  reason: string;
  details?: string;
}

export interface GetReportsQuery {
  targetType?: ReportTargetType | string;
  status?: ReportStatus;
  page?: number;
  pageSize?: number;
}

export const reportService = {
  createReport: async (data: CreateReportInput) => {
    const axios = await useAxios();
    const rawType = (data.targetType || "").toUpperCase();
    const normalizedType: ReportTargetType =
      rawType === "COMMENT" ? "COMMENT" : rawType === "USER" ? "USER" : "POST";
    const payload = {
      ...data,
      targetType: normalizedType,
      reason: data.reason ? data.reason.slice(0, 50) : "SPAM",
    };
    const response = await axios.post("/reports", payload);
    return response.data;
  },

  getReports: async (params?: GetReportsQuery) => {
    const axios = await useAxios();
    const query = new URLSearchParams();
    if (params?.targetType) {
      const rawType = params.targetType.toUpperCase();
      const normalizedType =
        rawType === "COMMENT" ? "COMMENT" : rawType === "USER" ? "USER" : "POST";
      query.append("targetType", normalizedType);
    }
    if (params?.status) query.append("status", params.status);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.pageSize) query.append("pageSize", params.pageSize.toString());
    const queryString = query.toString();
    const response = await axios.get(`/reports${queryString ? `?${queryString}` : ""}`);
    return response.data;
  },

  getReportById: async (id: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/reports/${id}`);
    return response.data;
  },

  updateReportStatus: async (id: string, status: ReportStatus) => {
    const axios = await useAxios();
    const response = await axios.patch(`/reports/${id}/status`, { status });
    return response.data;
  },
};
