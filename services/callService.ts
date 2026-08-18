import { useAxios } from "@/lib/useAxios";

export const callService = {
  initiateAudioCall: async (recipientId: string) => {
    const axios = await useAxios();
    const response = await axios.post("/audio-calls", { recipientId });
    return response.data;
  },

  initiateVideoCall: async (recipientId: string) => {
    const axios = await useAxios();
    const response = await axios.post("/video-calls", { recipientId });
    return response.data;
  },

  sendSignal: async (targetUserId: string, signalData: any) => {
    const axios = await useAxios();
    const response = await axios.post("/call-signaling", { targetUserId, signalData });
    return response.data;
  },

  endCall: async (callId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/audio-calls/${callId}/end`);
    return response.data;
  },

  answerCall: async (callId: string) => {
    const axios = await useAxios();
    const response = await axios.post(`/audio-calls/${callId}/answer`);
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
