import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNearbyServices } from "../api/api";
import { useLocation } from "../hooks/useLocation";

function resolveCurrentLocation(lat, lng) {
  if (lat != null && lng != null) {
    return Promise.resolve({ lat, lng });
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location access denied. Please enable GPS."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => reject(new Error("Location access denied. Please enable GPS.")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
}

function Home() {
  const navigate = useNavigate();
  const { lat, lng, error: locationError } = useLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSOS = async () => {
    setLoading(true);
    setError("");

    try {
      const coords = await resolveCurrentLocation(lat, lng);
      const services = await fetchNearbyServices(coords.lat, coords.lng, "all", 10);
      navigate("/emergency", {
        state: { services, userLat: coords.lat, userLng: coords.lng },
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to fetch emergency services.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-[var(--bg-base)]">
      <div className="pointer-events-none absolute inset-0 opacity-5 [background-image:repeating-linear-gradient(to_right,transparent,transparent_39px,rgba(255,255,255,0.7)_40px),repeating-linear-gradient(to_bottom,transparent,transparent_39px,rgba(255,255,255,0.7)_40px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(220,38,38,0.12)_0%,transparent_70%)]" />

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <span className="glass mb-6 rounded-full border border-[var(--border-accent)] px-4 py-2 text-xs text-[var(--text-secondary)]">
          🛡 Road Safety Hackathon 2026 · IIT Madras
        </span>

        <h1 className="font-['Syne'] text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-tight text-white">
          Emergency Help,
          <br />
          <span className="text-red-500">When Every Second Counts</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
          Instant access to hospitals, police, ambulance &amp; rescue services across BIMSTEC countries.
        </p>

        <div className="mt-10 flex flex-col items-center">
          <button
            type="button"
            onClick={handleSOS}
            disabled={loading}
            className="group relative flex h-48 w-48 items-center justify-center disabled:cursor-not-allowed"
          >
            <span className={`absolute h-28 w-28 rounded-full border border-red-500/30 ${loading ? "" : "animate-[sos-ring_2s_linear_infinite]"}`} />
            <span className={`absolute h-28 w-28 rounded-full border border-red-400/40 ${loading ? "" : "animate-[sos-ring_2s_linear_infinite_0.5s]"}`} />
            <span className="glow-red relative flex h-[140px] w-[140px] items-center justify-center rounded-full bg-red-600 transition group-hover:brightness-110">
              {loading ? (
                <span className="h-12 w-12 rounded-full border-4 border-white/30 border-t-white animate-[spin_1s_linear_infinite]" />
              ) : (
                <span className="font-['Syne'] text-[2rem] font-extrabold text-white">SOS</span>
              )}
            </span>
          </button>
          <p className="mt-2 text-[9px] tracking-[0.28em] text-[var(--text-muted)]">
            TAP FOR EMERGENCY
          </p>
        </div>

        {error || locationError ? (
          <p className="mt-5 text-sm font-semibold text-red-300">{error || locationError}</p>
        ) : null}
      </section>

      <section className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-4 sm:px-6">
        <div className="glass overflow-hidden rounded-full py-2 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <p className="animate-marquee whitespace-nowrap px-6 text-sm font-medium text-[var(--text-secondary)]">
            🌏 India · Bangladesh · Nepal · Bhutan · Sri Lanka · Myanmar · Thailand · Maldives
          </p>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-6xl px-4 sm:px-6">
        <h2 className="font-['Syne'] text-3xl font-bold text-white">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="glass glass-hover group relative overflow-hidden border-t-2 border-t-red-500 p-5 hover:-translate-y-1">
            <span className="pointer-events-none absolute right-3 top-2 font-['Syne'] text-5xl font-extrabold text-white/10">1</span>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-xl">🚨</div>
            <p className="font-semibold text-white">Press SOS</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Trigger rapid emergency discovery in a single tap.</p>
          </article>
          <article className="glass glass-hover group relative overflow-hidden border-t-2 border-t-amber-500 p-5 hover:-translate-y-1">
            <span className="pointer-events-none absolute right-3 top-2 font-['Syne'] text-5xl font-extrabold text-white/10">2</span>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-xl">📍</div>
            <p className="font-semibold text-white">We find help</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Live + fallback intelligence ranks nearby responders.</p>
          </article>
          <article className="glass glass-hover group relative overflow-hidden border-t-2 border-t-emerald-500 p-5 hover:-translate-y-1">
            <span className="pointer-events-none absolute right-3 top-2 font-['Syne'] text-5xl font-extrabold text-white/10">3</span>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-xl">📞</div>
            <p className="font-semibold text-white">One tap to call</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Call, navigate, and share your location instantly.</p>
          </article>
        </div>
      </section>

      <footer className="mx-auto mt-12 max-w-6xl border-t border-white/10 px-4 py-6 text-center text-xs text-[var(--text-muted)] sm:px-6">
        Built for Road Safety Hackathon 2026 · IIT Madras CoERS · RBG Labs
      </footer>
    </div>
  );
}

export default Home;
