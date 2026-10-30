import { useAxios } from "@/lib/useAxios";

export type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";

export interface AddReactionInput {
  targetId: string;
  targetType: "POST" | "COMMENT" | string;
  type: ReactionType | string;
}

export const reactionService = {
  addReaction: async (payload: AddReactionInput) => {
    const cleanTargetId = (payload.targetId || "").trim();
    const upperType = (payload.type || "LIKE").toUpperCase() as ReactionType;
    const upperTarget = (payload.targetType || "POST").toUpperCase() === "COMMENT" ? "COMMENT" : "POST";
    const axios = await useAxios();
    const response = await axios.post("/reactions", {
      targetId: cleanTargetId,
      targetType: upperTarget,
      type: upperType,
    });
    return response.data;
  },

  removeReaction: async (targetId: string, targetType: "POST" | "COMMENT" | string) => {
    const cleanTargetId = (targetId || "").trim();
    const upperTarget = (targetType || "POST").toUpperCase() === "COMMENT" ? "COMMENT" : "POST";
    const axios = await useAxios();
    const response = await axios.delete("/reactions", { data: { targetId: cleanTargetId, targetType: upperTarget } });
    return response.data;
  },

  getReactions: async (targetId: string, targetType: "POST" | "COMMENT" | string, page = 1, pageSize = 20) => {
    const cleanTargetId = (targetId || "").trim();
    const upperTarget = (targetType || "POST").toUpperCase() === "COMMENT" ? "COMMENT" : "POST";
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, Math.min(pageSize, 50));
    const axios = await useAxios();
    const response = await axios.get(`/reactions?targetId=${cleanTargetId}&targetType=${upperTarget}&page=${validPage}&pageSize=${validPageSize}`);
    return response.data;
  },

  getStats: async (targetId: string, targetType: "POST" | "COMMENT" | string) => {
    const cleanTargetId = (targetId || "").trim();
    const upperTarget = (targetType || "POST").toUpperCase() === "COMMENT" ? "COMMENT" : "POST";
    const axios = await useAxios();
    const response = await axios.get(`/reactions/stats?targetId=${cleanTargetId}&targetType=${upperTarget}`);
    return response.data;
  },
};
