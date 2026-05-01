const BASE = import.meta.env.VITE_API_URL;

// Παίρνει όλες τις αίθουσες ή search
export async function getRooms(search = "") {
  const url = new URL(`${BASE}/api/rooms/`);
  if (search) url.searchParams.set("search", search);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) throw new Error(data?.detail || "Failed to fetch rooms");
  return data;
}

// Παίρνει ΜΟΝΟ διαθέσιμες αίθουσες
export async function getAvailableRooms({ date, from, to }) {
  const url = new URL(`${BASE}/api/rooms/available/`);
  url.searchParams.set("date", date);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) throw new Error(data?.detail || "Failed to fetch available rooms");
  return data;
}