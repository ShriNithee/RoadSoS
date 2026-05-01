import { useEffect, useState } from "react";

function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 backdrop-blur-lg md:top-14">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-sm font-medium text-amber-200">
        <span className="inline-block h-2 w-2 animate-[offline-dot_1.4s_ease-in-out_infinite] rounded-full bg-amber-300" />
        <span>📡 Offline Mode — Showing cached emergency data</span>
      </div>
    </div>
  );
}

export default OfflineBanner;
