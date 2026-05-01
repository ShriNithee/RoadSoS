import { formatPhone } from "../utils/formatPhone";

const badgeStyles = {
  hospital: { badge: "bg-red-500/20 text-red-300", bar: "#dc2626" },
  police: { badge: "bg-blue-500/20 text-blue-300", bar: "#3b82f6" },
  ambulance: { badge: "bg-orange-500/20 text-orange-300", bar: "#f97316" },
  towing: { badge: "bg-amber-500/20 text-amber-300", bar: "#f59e0b" },
  puncture: { badge: "bg-slate-500/20 text-slate-300", bar: "#64748b" },
  fuel: { badge: "bg-emerald-500/20 text-emerald-300", bar: "#10b981" },
  mechanic: { badge: "bg-purple-500/20 text-purple-300", bar: "#a855f7" },
};

function ServiceCard({ service, index = 0 }) {
  const style = badgeStyles[service.type] || {
    badge: "bg-slate-500/20 text-slate-300",
    bar: "#94a3b8",
  };
  const phone = formatPhone(service.phone);
  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`;
  const emergencyAlert =
    service.type === "hospital" || service.type === "ambulance"
      ? "border-l-[3px] border-l-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.25)]"
      : "";
  const score = Number(service.score || 0);
  const scoreWidth = `${Math.min(100, Math.max(0, score))}%`;

  return (
    <article
      className={`glass glass-hover animate-fade-in-up p-4 transition ${emergencyAlert}`}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`badge ${style.badge}`}>
            {service.type}
          </span>
          {Number(service.verified) === 1 ? (
            <span className="text-xs font-medium text-emerald-400">✓ Verified</span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {service.source === "offline" ? (
            <span className="badge bg-slate-600/40 text-slate-300">
              OFFLINE
            </span>
          ) : null}
          <span className="glass rounded-full px-2 py-1 text-xs text-[var(--text-secondary)]">
            {Number(service.distance || 0).toFixed(2)} km
          </span>
        </div>
      </div>

      <h3 className="mt-3 font-['Syne'] text-base font-bold text-[var(--text-primary)]">{service.name}</h3>
      <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
        {service.address || "Address not available"}
      </p>
      <p className="text-sm text-[var(--text-secondary)]">
        {[service.city, service.country].filter(Boolean).join(", ")}
      </p>

      <div className="mt-3">
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{ width: scoreWidth, background: style.bar, boxShadow: `0 0 8px ${style.bar}` }}
          />
        </div>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Reliability Score: {score}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={phone ? `tel:${phone}` : "#"}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          📞 Call
        </a>
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost px-3 py-2 text-sm font-semibold"
        >
          🗺 Navigate
        </a>
      </div>
    </article>
  );
}

export default ServiceCard;
