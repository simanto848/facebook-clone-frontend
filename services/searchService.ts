import { useAxios } from "@/lib/useAxios";

export type SearchBackendType = "users" | "posts" | "all";

export const searchService = {
  search: async (
    q: string,
    type: "all" | "users" | "posts" | "groups" | "pages" | "hashtags" = "all",
    pageSize = 20,
    page = 1
  ) => {
    const axios = await useAxios();
    const cleanQ = (q || "").trim().slice(0, 100);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const validPage = Math.max(1, page);
    const normalizedType: SearchBackendType =
      type === "users" || type === "posts" ? type : "all";
    const response = await axios.get(
      `/search?q=${encodeURIComponent(cleanQ)}&type=${normalizedType}&pageSize=${validPageSize}&page=${validPage}`
    );
    return response.data;
  },
};
