import { useEffect } from "react";

export function useWakeLock() {
  useEffect(() => {
    if (!navigator.wakeLock) return;

    let lock: Promise<WakeLockSentinel | void> | undefined;
    const request = () => {
      if (document.visibilityState === "visible")
        lock = navigator.wakeLock.request("screen").catch(() => {}); // denied, e.g. low battery
    };

    request();
    document.addEventListener("visibilitychange", request);
    return () => {
      document.removeEventListener("visibilitychange", request);
      lock?.then((sentinel) => sentinel?.release());
    };
  }, []);
}
