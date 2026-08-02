const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function fetchIncidentsSummary(token) {
  const res = await fetch(`${API_BASE}/api/incidents/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch incidents summary");
  return res.json();
}

export async function fetchIncidents(token) {
  const res = await fetch(`${API_BASE}/api/incidents/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch incidents");
  return res.json();
}

export async function createIncident(token, payload) {
  const res = await fetch(`${API_BASE}/api/incidents/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create incident");
  return res.json();
}

export { API_BASE };