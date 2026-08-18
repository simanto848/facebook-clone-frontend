import { useAxios } from "@/lib/useAxios";

export type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";

export interface AddReactionInput {
  targetId: string;
  targetType: "POST" | "COMMENT";
  type: ReactionType;
}

export const reactionService = {
  addReaction: async (payload: AddReactionInput) => {
    const axios = await useAxios();
    const response = await axios.post("/reactions", payload);
    return response.data;
  },

  removeReaction: async (targetId: string, targetType: "POST" | "COMMENT") => {
    const axios = await useAxios();
    const response = await axios.delete("/reactions", { data: { targetId, targetType } });
    return response.data;
  },

  getReactions: async (targetId: string, targetType: "POST" | "COMMENT", page = 1, limit = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/reactions?targetId=${targetId}&targetType=${targetType}&page=${page}&limit=${limit}`);
    return response.data;
  },

  getStats: async (targetId: string, targetType: "POST" | "COMMENT") => {
    const axios = await useAxios();
    const response = await axios.get(`/reactions/stats?targetId=${targetId}&targetType=${targetType}`);
    return response.data;
  },
};
