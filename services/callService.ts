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
  initiateAudioCall: async (payload: InitiateCallInput | string) => {
    const axios = await useAxios();
    const data = typeof payload === "string" ? { receiverId: payload } : payload;
    const response = await axios.post("/audio-calls/initiate", data);
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
  initiateVideoCall: async (payload: InitiateCallInput | string) => {
    const axios = await useAxios();
    const data = typeof payload === "string" ? { receiverId: payload } : payload;
    const response = await axios.post("/video-calls/initiate", data);
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

  // WebRTC signaling and active presence
  sendSignal: async (targetUserId: string, signalData: any) => {
    const axios = await useAxios();
    const response = await axios.post("/call-signaling", { targetUserId, signalData });
    return response.data;
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
