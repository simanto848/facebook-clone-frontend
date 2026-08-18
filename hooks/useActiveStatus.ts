"use client";

import { useEffect } from "react";
import { callService } from "@/services/callService";

export function useActiveStatus(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const sendHeartbeat = async () => {
      try {
        await callService.pingActiveStatus();
      } catch (err) {
        // Silent fallback for status ping
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000); // 30s heartbeat

    return () => clearInterval(interval);
  }, [enabled]);
}
