const OSM_TYPE_CONFIG = {
  hospital: { key: "amenity", value: "hospital" },
  police: { key: "amenity", value: "police" },
  fuel: { key: "amenity", value: "fuel" },
  mechanic: { key: "shop", value: "car_repair" },
  ambulance: { key: "amenity", value: "hospital" },
  towing: { key: "amenity", value: "vehicle_inspection" },
  puncture: { key: "shop", value: "tyres" },
};

function buildAddress(tags) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
  ].filter(Boolean);
  return parts.join(", ") || "";
}

function extractLatLng(element) {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return { lat: element.lat, lng: element.lon };
  }

  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon };
  }

  return null;
}

function looksLikeAmbulance(name = "") {
  const lower = name.toLowerCase();
  return (
    lower.includes("ambulance") ||
    lower.includes("ems") ||
    lower.includes("emergency")
  );
}

async function fetchFromOSM(lat, lng, type, radiusKm = 5) {
  try {
    const config = OSM_TYPE_CONFIG[type];
    if (!config) {
      return [];
    }

    const radiusMeters = Math.max(100, Math.round(Number(radiusKm) * 1000));
    const query = `
[out:json][timeout:25];
(
  node["${config.key}"="${config.value}"](around:${radiusMeters},${lat},${lng});
  way["${config.key}"="${config.value}"](around:${radiusMeters},${lat},${lng});
  relation["${config.key}"="${config.value}"](around:${radiusMeters},${lat},${lng});
);
out center tags;
`;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: query,
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data?.elements?.length) {
      return [];
    }

    const mapped = data.elements
      .map((element) => {
        const tags = element.tags || {};
        const coords = extractLatLng(element);
        if (!coords) {
          return null;
        }

        const name = tags.name || "Unnamed Service";
        if (type === "ambulance" && !looksLikeAmbulance(name)) {
          return null;
        }

        return {
          name,
          type,
          phone: tags.phone || tags["contact:phone"] || "N/A",
          lat: coords.lat,
          lng: coords.lng,
          address: buildAddress(tags),
          city: tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "",
          country: tags["addr:country"] || "",
          verified: 0,
          available: 1,
        };
      })
      .filter(Boolean);

    return mapped;
  } catch (_error) {
    return [];
  }
}

module.exports = { fetchFromOSM };
