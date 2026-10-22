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
    const normalizedType: SearchBackendType =
      type === "users" || type === "posts" ? type : "all";
    const response = await axios.get(
      `/search?q=${encodeURIComponent(q)}&type=${normalizedType}&pageSize=${pageSize}&page=${page}`
    );
    return response.data;
  },
};
