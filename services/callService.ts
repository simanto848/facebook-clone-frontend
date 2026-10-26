import { useAxios } from "@/lib/useAxios";

export type CallStatus = "MISSED" | "REJECTED" | "COMPLETED" | "ONGOING";

export interface InitiateCallInput {
  conversationId: string;
  receiverId: string;
}

export interface CallHistoryQuery {
  page?: number;
  pageSize?: number;
}

export const callService = {
  // Audio calls
  initiateAudioCall: async (payload: InitiateCallInput | { conversationId?: string; receiverId: string } | string) => {
    const axios = await useAxios();
    const receiverId = typeof payload === "string" ? payload : payload.receiverId;
    const conversationId = typeof payload === "object" && payload.conversationId ? payload.conversationId : receiverId;
    const response = await axios.post("/audio-calls/initiate", { conversationId, receiverId });
    return response.data;
  },

  getAudioCallHistory: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/audio-calls/history?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getAudioCallDetails: async (callId: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/audio-calls/${callId}`);
    return response.data;
  },

  updateAudioCallStatus: async (callId: string, status: CallStatus, duration?: number) => {
    const axios = await useAxios();
    const response = await axios.patch(`/audio-calls/${callId}/status`, { status, duration });
    return response.data;
  },

  // Video calls
  initiateVideoCall: async (payload: InitiateCallInput | { conversationId?: string; receiverId: string } | string) => {
    const axios = await useAxios();
    const receiverId = typeof payload === "string" ? payload : payload.receiverId;
    const conversationId = typeof payload === "object" && payload.conversationId ? payload.conversationId : receiverId;
    const response = await axios.post("/video-calls/initiate", { conversationId, receiverId });
    return response.data;
  },

  getVideoCallHistory: async (page = 1, pageSize = 20) => {
    const axios = await useAxios();
    const response = await axios.get(`/video-calls/history?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getVideoCallDetails: async (callId: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/video-calls/${callId}`);
    return response.data;
  },

  updateVideoCallStatus: async (callId: string, status: CallStatus, duration?: number) => {
    const axios = await useAxios();
    const response = await axios.patch(`/video-calls/${callId}/status`, { status, duration });
    return response.data;
  },

  // Backward compatibility convenience methods
  endCall: async (callId: string, duration = 0) => {
    return callService.updateAudioCallStatus(callId, "COMPLETED", duration);
  },

  answerCall: async (callId: string) => {
    return callService.updateAudioCallStatus(callId, "ONGOING");
  },

  endVideoCall: async (callId: string, duration = 0) => {
    return callService.updateVideoCallStatus(callId, "COMPLETED", duration);
  },

  answerVideoCall: async (callId: string) => {
    return callService.updateVideoCallStatus(callId, "ONGOING");
  },

  rejectCall: async (callId: string, isVideo = false) => {
    return isVideo
      ? callService.updateVideoCallStatus(callId, "REJECTED")
      : callService.updateAudioCallStatus(callId, "REJECTED");
  },

  // WebRTC signaling and active presence (Delegated to WebSocket transport: call:offer, call:answer, call:ice-candidate)
  sendSignal: async (targetUserId: string, signalData: any) => {
    // Signaling is handled over WebSockets; return safe resolution to prevent 404 errors
    return { success: true, targetUserId, signalData, transport: "websocket" };
  },

  getIceServers: async () => {
    const axios = await useAxios();
    const response = await axios.get("/call-signaling/ice-servers");
    return response.data;
  },

  pingActiveStatus: async () => {
    const axios = await useAxios();
    const response = await axios.post("/active-status/heartbeat");
    return response.data;
  },

  getUserActiveStatus: async (userId: string) => {
    const axios = await useAxios();
    const response = await axios.get(`/active-status/${userId}`);
    return response.data;
  },
};
