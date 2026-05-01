import { useEffect, useState } from "react";
import ServiceCard from "../components/ServiceCard";
import { fetchNearbyServices } from "../api/api";
import { useLocation } from "../hooks/useLocation";

const types = [
  "all",
  "hospital",
  "police",
  "ambulance",
  "towing",
  "fuel",
  "puncture",
  "mechanic",
];
const typeMeta = {
  all: "🌐",
  hospital: "🏥",
  police: "🚓",
  ambulance: "🚑",
  towing: "🛻",
  fuel: "⛽",
  puncture: "🛞",
  mechanic: "🛠️",
};

function Services() {
  const { lat, lng, loading: locationLoading, error: locationError } = useLocation();
  const [selectedType, setSelectedType] = useState("all");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

  useEffect(() => {
    if (lat == null || lng == null) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetchNearbyServices(lat, lng, selectedType, 10)
      .then((data) => {
        if (!cancelled) {
          setServices(Array.isArray(data) ? data : []);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message || "Failed to fetch services.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng, selectedType]);

  const showSkeletons = loading || locationLoading;
  const countries = Array.from(
    new Set(services.map((item) => item.country).filter(Boolean))
  );
  const displayedServices =
    countryFilter === "all"
      ? services
      : services.filter((item) => item.country === countryFilter);

  return (
    <div className="mx-auto max-w-7xl bg-[var(--bg-base)] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-['Syne'] text-3xl font-bold text-white">Nearby Emergency Services</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          High-priority response services around your current location.
        </p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {types.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold ${
              selectedType === type
                ? "bg-red-600 text-white"
                : "glass text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            {typeMeta[type]} {type}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <select
          value={countryFilter}
          onChange={(event) => setCountryFilter(event.target.value)}
          className="glass rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
        >
          <option value="all">All countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <p className="text-sm text-[var(--text-muted)]">
          Showing {displayedServices.length} services near you
        </p>
      </div>

      {locationError ? (
        <p className="mb-4 rounded-md border border-red-500/40 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-300">
          {locationError}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-md border border-red-500/40 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-300">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {showSkeletons ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="glass h-44 overflow-hidden"
            >
              <div className="h-full animate-[marquee_1.6s_linear_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          ))
        ) : displayedServices.length ? (
          displayedServices.map((service, index) => (
            <ServiceCard
              key={`${service.name}-${service.phone}-${service.source}-${index}`}
              service={service}
              index={index}
            />
          ))
        ) : (
          <div className="glass col-span-full mx-auto max-w-md p-8 text-center">
            <p className="text-3xl">🔎</p>
            <p className="mt-2 font-semibold text-white">No services found in this area</p>
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className="btn-primary mt-4 text-sm font-semibold"
            >
              Try increasing search radius
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Services;
