
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket;

export function createSocket(token) {
  if (!socket) {
    socket = io(BACKEND_URL, {
      auth: { token },
      autoConnect: true,
    });
  } else {
    socket.auth = { token };
    socket.connect(); // reconnect if already created
  }

  // ✅ socket.id is only available after 'connect'
  socket.on("connect", () => {
    console.log("Socket connected in client!  id:", socket.id, "token:", socket.auth.token);
  });

  return socket;
}

export function getSocket() {
  if (!socket) return null;
  return socket;
}
