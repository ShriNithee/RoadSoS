import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { formatPhone } from "../utils/formatPhone";

const typeColors = {
  hospital: "#dc2626",
  police: "#2563eb",
  ambulance: "#f97316",
  towing: "#eab308",
  puncture: "#6b7280",
  fuel: "#16a34a",
  mechanic: "#9333ea",
};
const typeEmoji = {
  hospital: "🏥",
  police: "🚓",
  ambulance: "🚑",
  towing: "🛻",
  puncture: "🛞",
  fuel: "⛽",
  mechanic: "🛠️",
};

const userIcon = L.divIcon({
  className: "user-marker",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#60a5fa;box-shadow:0 0 0 0 rgba(96,165,250,.65);animation:pulse-red 2s ease-in-out infinite;"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function serviceIcon(type) {
  const color = typeColors[type] || "#1f2937";
  const emoji = typeEmoji[type] || "📍";
  return L.divIcon({
    className: "service-marker",
    html: `<div style="display:flex;align-items:center;justify-content:center;background:${color};width:24px;height:24px;border-radius:9999px;border:2px solid rgba(255,255,255,.85);box-shadow:0 3px 10px rgba(0,0,0,.35);font-size:12px;">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function MapView({ userLat, userLng, services }) {
  if (userLat == null || userLng == null) {
    return (
      <div className="glass flex h-[400px] w-full items-center justify-center rounded-xl text-[var(--text-secondary)]">
        Loading map...
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-xl shadow">
      <MapContainer
        center={[userLat, userLng]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & CartoDB'
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
        />

        <Marker position={[userLat, userLng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>

        {services.map((service, index) => (
          <Marker
            key={`${service.name}-${service.phone}-${index}`}
            position={[service.lat, service.lng]}
            icon={serviceIcon(service.type)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{service.name}</p>
                <p>{service.phone}</p>
                <a
                  href={`tel:${formatPhone(service.phone)}`}
                  className="text-blue-600 underline"
                >
                  Call
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
