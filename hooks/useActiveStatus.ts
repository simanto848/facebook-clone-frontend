"use client";

import { useEffect } from "react";
import { callService } from "@/services/callService";

export function useActiveStatus() {
  useEffect(() => {
    // Send initial heartbeat
    callService.pingActiveStatus().catch((err) => console.error("Active status heartbeat error:", err));

    // Periodic heartbeat every 60 seconds
    const interval = setInterval(() => {
      callService.pingActiveStatus().catch((err) => console.error("Active status heartbeat error:", err));
    }, 60000);

    return () => clearInterval(interval);
  }, []);
}
