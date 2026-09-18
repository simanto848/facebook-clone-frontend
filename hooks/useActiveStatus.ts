"use client";

import { useEffect } from "react";
import { activeStatusService } from "@/services/activeStatusService";
import { callService } from "@/services/callService";

export function useActiveStatus(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const sendHeartbeat = async () => {
      try {
        await activeStatusService.sendHeartbeat();
      } catch {
        try {
          await callService.pingActiveStatus();
        } catch {
          // Silent fallback for status ping
        }
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000); // 30s heartbeat

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [enabled]);
}
