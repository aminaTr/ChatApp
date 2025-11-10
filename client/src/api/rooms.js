// api/rooms.js
const backendUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000")+"/api";

/**
 * Create a room
 */
export async function createRoom({ name, isPrivate = false, accessCode }, token) {
  const res = await fetch(`${backendUrl}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, isPrivate, accessCode }),
  });
  return res.json();
}

/**
 * Make a room live
 */
export async function makeRoomLive(roomId, token) {
  const res = await fetch(`${backendUrl}/rooms/${roomId}/live`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

/**
 * Fetch all rooms (optional)
 */
export async function getRooms(token) {
  const res = await fetch(`${backendUrl}/rooms`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
