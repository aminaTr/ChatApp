// api/rooms.js
const backendUrl = (import.meta.env.VITE_SOCKET_URL || "http://localhost:5000")+"/api/rooms";

/**
 * Create a room
 */
export async function createRoom({ name, isPrivate = false, accessCode }, token) {
  try{
    const res = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, isPrivate, accessCode }),
  });
    const data = await res.json();
    if (!res.ok) {
      // Handle invalid values
      throw (data.error || "Invalid values");
    }
    return data;
  }
  catch (error) {
    console.error("Room creation error:", error);
    throw error;
  }
}

/**
 * Authorize room access
 */
export async function authorizeRoomAccess({roomId, accessCode}, token) {
  console.log(typeof roomId, accessCode, token)
  try{
    const res = await fetch(`${backendUrl}/verify-access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomId, accessCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      // Handle invalid values
      throw (data.error || "Invalid values");
    }
    return data;
  }catch (error) {
    console.error("Error in authorization:", error);
    throw error;
  }
}

/**
 * Make a room live
 */
export async function makeRoomLive(roomId, token) {
  try {
    const res = await fetch(`${backendUrl}/${roomId}/live`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      // Handle invalid values
      throw (data.error || "Invalid values");
    }
    return data;
  }catch (error) {
    console.error("Error in changing room status:", error);
    throw error;
  }
}

/**
 * Fetch all rooms 
 */
export async function getRooms(token) {
  try {
    const res = await fetch(backendUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      // Handle invalid values
      throw (data.error || "Invalid values");
    }  
    return data;
  }
  catch (error) {
    console.error("Error getting rooms:", error);
    throw error;
  }
}
