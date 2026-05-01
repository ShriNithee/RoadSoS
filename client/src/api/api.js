const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function safeFetchJson(url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (_error) {
    throw new Error("Failed to connect to the server.");
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch (_error) {
      // Ignore parse failure and keep default message.
    }
    throw new Error(message);
  }

  try {
    return await response.json();
  } catch (_error) {
    throw new Error("Server returned an invalid response.");
  }
}

async function fetchNearbyServices(lat, lng, type = "all", radius = 10) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    type,
    radius: String(radius),
  });

  return safeFetchJson(`${BASE_URL}/api/services/nearby?${params.toString()}`);
}

async function fetchAllContacts() {
  return safeFetchJson(`${BASE_URL}/api/contacts`);
}

async function addContact(data) {
  return safeFetchJson(`${BASE_URL}/api/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function updateContact(id, data) {
  return safeFetchJson(`${BASE_URL}/api/contacts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function deleteContact(id) {
  return safeFetchJson(`${BASE_URL}/api/contacts/${id}`, {
    method: "DELETE",
  });
}

export {
  fetchNearbyServices,
  fetchAllContacts,
  addContact,
  updateContact,
  deleteContact,
  BASE_URL,
};
