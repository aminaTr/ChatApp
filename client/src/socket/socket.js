// import { io } from "socket.io-client";

// export const socket = io("http://localhost:5000", {
//   autoConnect: true,
// });
// socket.js
import { io } from "socket.io-client";

let socket;

export function createSocket(token) {
  if (!socket) {
    socket = io("http://localhost:5000", {
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
