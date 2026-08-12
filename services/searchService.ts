import { useAxios } from "@/lib/useAxios";

export const searchService = {
  search: async (q: string, type: "all" | "users" | "posts" | "groups" | "pages" | "hashtags" = "all", limit = 10, page = 1) => {
    const axios = await useAxios();
    const response = await axios.get(`/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}&page=${page}`);
    return response.data;
  },
};
