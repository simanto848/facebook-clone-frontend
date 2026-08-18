import { io, Socket } from "socket.io-client";
import { getAnyAuthToken } from "@/lib/auth";

let socket: Socket | null = null;

export const getSocket = async (): Promise<Socket | null> => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = await getAnyAuthToken();
  if (!token) {
    return null;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  socket = io(socketUrl, {
    auth: {
      token: `Bearer ${token}`,
    },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
