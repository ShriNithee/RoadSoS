import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import ServiceCard from "../components/ServiceCard";
import offlineContacts from "../data/offlineContacts.json";

const filterTypes = [
  "all",
  "hospital",
  "police",
  "ambulance",
  "towing",
  "fuel",
  "puncture",
  "mechanic",
];
const typeLabels = {
  all: "All",
  hospital: "Hospital",
  police: "Police",
  ambulance: "Ambulance",
  towing: "Towing",
  fuel: "Fuel",
  puncture: "Puncture",
  mechanic: "Mechanic",
};

function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function Emergency() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("all");
  const [secondsLeft, setSecondsLeft] = useState(60 * 60);
  const [copied, setCopied] = useState(false);

  const services = location.state?.services || [];
  const hasOnlineResults = services.length > 0;
  const effectiveServices = hasOnlineResults
    ? services
    : offlineContacts.map((item) => ({ ...item, source: "offline" }));
  const userLat = location.state?.userLat ?? null;
  const userLng = location.state?.userLng ?? null;

  useEffect(() => {
    if (!location.state) {
      navigate("/", { replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filteredServices = useMemo(() => {
    if (selectedType === "all") {
      return effectiveServices;
    }
    return effectiveServices.filter((service) => service.type === selectedType);
  }, [effectiveServices, selectedType]);
  const countsByType = useMemo(() => {
    const counts = { all: effectiveServices.length };
    for (const type of filterTypes) {
      if (type !== "all") {
        counts[type] = effectiveServices.filter((item) => item.type === type).length;
      }
    }
    return counts;
  }, [effectiveServices]);

  const handleShare = () => {
    if (userLat == null || userLng == null) {
      return;
    }

    const smsBody = encodeURIComponent(
      `Emergency! My location: https://maps.google.com/?q=${userLat},${userLng}`
    );
    window.location.href = `sms:?&body=${smsBody}`;
  };

  const handleWhatsAppShare = () => {
    if (userLat == null || userLng == null) {
      return;
    }
    const text = encodeURIComponent(
      `I need help! My location: https://maps.google.com/?q=${userLat},${userLng}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noreferrer");
  };

  const handleCopyLocation = async () => {
    if (userLat == null || userLng == null || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(`Lat: ${userLat}, Lng: ${userLng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const progress = secondsLeft / (60 * 60);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - progress);
  const ringColor =
    secondsLeft > 40 * 60 ? "var(--green)" : secondsLeft > 20 * 60 ? "var(--amber)" : "var(--red-primary)";

  return (
    <div className="mx-auto max-w-7xl bg-[var(--bg-base)] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="glass inline-flex items-center gap-2 self-start rounded-full border border-red-500/40 px-3 py-1 text-sm font-semibold text-red-300">
          🚨 Emergency Mode
        </div>

        <div className="glass w-full p-4 lg:w-[220px]">
          <div className="relative mx-auto h-32 w-32">
            <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
              <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="7" fill="none" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={ringColor}
                strokeWidth="7"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-['Syne'] text-2xl font-bold text-white">{formatCountdown(secondsLeft)}</p>
              <p className="text-[10px] tracking-[0.2em] text-[var(--text-secondary)]">GOLDEN HOUR</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="btn-ghost px-4 py-2 text-sm font-semibold"
        >
          📩 Share Location
        </button>
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={handleCopyLocation}
          className="btn-ghost px-4 py-2 text-sm font-semibold"
        >
          {copied ? "Copied!" : "Copy Location"}
        </button>
      </div>

      {!hasOnlineResults ? (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-300">
          ⚠️ No online services found — showing offline emergency contacts
        </div>
      ) : null}

      <section className="relative">
        <div className="glow-red overflow-hidden rounded-xl border border-red-500/40">
          <MapView userLat={userLat} userLng={userLng} services={filteredServices} />
        </div>
        <div className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-xs text-[var(--text-secondary)]">
          📍 Your Location {userLat?.toFixed(4)}, {userLng?.toFixed(4)}
        </div>
      </section>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {filterTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedType === type
                ? "bg-red-600 text-white"
                : "glass text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            {typeLabels[type]} ({countsByType[type] ?? 0})
          </button>
        ))}
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {filteredServices.length ? (
          filteredServices.map((service, index) => (
            <ServiceCard
              key={`${service.name}-${service.phone}-${service.source}-${index}`}
              service={service}
              index={index}
            />
          ))
        ) : (
          <div className="glass p-6 text-center text-[var(--text-secondary)]">
            No services available for the selected filter.
          </div>
        )}
      </section>

      <div className="glass fixed inset-x-0 bottom-14 z-40 mx-3 flex gap-2 p-2 md:hidden">
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={handleCopyLocation}
          className="btn-ghost flex-1 px-3 py-2 text-sm font-semibold"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default Emergency;
