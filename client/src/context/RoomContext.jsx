import { createContext, useContext, useState, useEffect } from "react";
import { createSocket } from "../socket/socket.js";
import { setupSignaling } from "../socket/signaling.js";
import {
  initLocalAudio,
  stopLocalAudio,
  removeAllRemoteAudioElements,
} from "../webrtc/audioManager.js";
import { getRooms } from "../api/rooms.js";
import { createRoom, makeRoomLive, authorizeRoomAccess } from "../api/rooms.js";
import toast from "react-hot-toast";
import { OctagonX } from "lucide-react";

const RoomContext = createContext();

export function RoomProvider({ children, user }) {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(
    () => localStorage.getItem("roomId") || ""
  );
  const [inLobby, setInLobby] = useState(
    () => localStorage.getItem("inLobby") || false
  );
  const [logs, setLogs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  function log(msg) {
    setLogs((l) => [msg, ...l].slice(0, 100));
  }
  async function loadRooms(token) {
    try {
      if (!token) return;
      const data = await getRooms(token);
      setRooms(data);
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    }
  }
  useEffect(() => {
    if (!token) return;

    async function fetchRooms() {
      try {
        const data = await getRooms(token);
        setRooms(data);
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      }
    }

    fetchRooms();
  }, [token]);

  useEffect(() => {
    if (roomId) {
      localStorage.setItem("roomId", roomId);
    } else {
      localStorage.removeItem("roomId");
    }
  }, [roomId]);

  useEffect(() => {
    if (inLobby) {
      localStorage.setItem("inLobby", true);
    } else {
      localStorage.removeItem("inLobby");
    }
  }, [inLobby]);

  // --- socket init ---
  useEffect(() => {
    if (!user || !token || rooms.length === 0) return;

    loadRooms(token);

    const s = createSocket(token);
    setSocket(s);

    s.on("connect", () => {
      // log("Connected: " + s.id);
      if (roomId) {
        console.log("Rejoining saved room:", roomId);
        rejoinRoom(roomId, s);
      }
    });

    s.on("disconnect", () => log("Disconnected"));
    s.on("user-joined", (d) => log("User joined: " + d.username));
    s.on("user-left", (d) => log("User left: " + d.username));
    s.on("force-disconnect", ({ reason }) => {
      toast.error(reason);
      s.disconnect();
      setSocket(null);
      setRoomId("");
    });

    s.on("lobby", ({ message, roomId: lobbyRoomId }) => {
      toast(message);
      setInLobby(true);
    });

    s.on("room-live", ({ roomId: liveRoomId }) => {
      const room = rooms.find((r) => r._id === liveRoomId);
      toast(`Room ${room.name} is now LIVE! Joining...`);
      setInLobby(false);
      joinRoom(liveRoomId, s);
    });

    s.on("room-created", (newRoom) => {
      setRooms((prevRooms) => {
        // Prevent duplicates
        if (prevRooms.some((r) => r._id === newRoom._id)) return prevRooms;
        return [...prevRooms, newRoom];
      });
    });
    const handleNewMessage = (data) => setMessages((prev) => [...prev, data]);
    s.on("receive-message", handleNewMessage);

    const handleMessageErrors = (response) => {
      toast.error(response.error);
    };

    const handleMessagesOnJoin = (msgs) => {
      setMessages(msgs);
    };
    s.on("messages", handleMessagesOnJoin);
    s.on("message-send-error", handleMessageErrors);

    return () => s.off();
  }, [user, rooms, token]);

  function getCurrentRoom() {
    const room = rooms.find((r) => r._id === roomId);
    return room ? room : null;
  }

  async function joinRoom(targetRoomId) {
    if (!socket || !socket.connected) return log("Socket not ready yet!");
    const finalRoom = targetRoomId;

    if (!finalRoom) return log("No room selected");
    stopLocalAudio();
    removeAllRemoteAudioElements();

    await initLocalAudio();
    setupSignaling(log);

    socket.emit("join-room", { roomId: finalRoom }, (response) => {
      if (response.status === "error") {
        // log("Server: " + response.message);
        toast.error(response.message);
      } else if (response.status === "lobby") {
        log("Server (lobby): " + response.message);
        toast(response.message);
      } else if (response.status === "joined") {
        toast(
          "Joining room " +
            response?.roomName.charAt(0).toUpperCase() +
            response?.roomName.slice(1)
        );
        log(`Joined room: ${response.roomName}`);
        setRoomId(finalRoom);
      }
    });
  }
  // console.log("logs;", logs);
  async function rejoinRoom(targetRoomId, s) {
    if (!s || !s.connected) return log("Socket not ready yet!");
    const finalRoom = targetRoomId;

    if (!finalRoom) return log("No room selected");
    stopLocalAudio();
    removeAllRemoteAudioElements();

    await initLocalAudio();
    setupSignaling(log);

    s.emit("join-room", { roomId: finalRoom }, (response) => {
      if (response.status === "error") {
        // log("Server: " + response.message);
        toast.error(response.message);
      } else if (response.status === "lobby") {
        log("Server (lobby): " + response.message);
        toast(response.message);
      } else if (response.status === "joined") {
        log(`Joined room: ${response.roomName}`);
        setRoomId(finalRoom);
      }
    });
  }

  async function handleCreate(roomName, accessCode) {
    if (!roomName.trim()) return;
    try {
      await createRoom(
        { name: roomName, isPrivate: !!accessCode, accessCode },
        token
      );
      loadRooms();
    } catch (error) {
      return toast.error(error);
    }
  }

  async function handleMakeLive(roomId) {
    try {
      await makeRoomLive(roomId, token);
      loadRooms();
    } catch (err) {
      console.error("Failed to make room live", err);
    }
  }

  async function handleJoin(room) {
    try {
      if (room.isPrivate) {
        const code = await new Promise((resolve) => {
          const ToastInput = () => {
            const [value, setValue] = useState("");

            return (
              <div className="relative flex flex-col gap-3 p-5 bg-base-200 rounded-2xl shadow-md w-80 border border-primary/50">
                {/* Top-right cancel button */}
                <OctagonX
                  onClick={dismissToast}
                  className="w-4 h-4 text-primary absolute 
                      top-2 right-2 cursor-pointer 
                      transition-transform duration-150
                      hover:scale-110 
                      active:scale-90"
                />

                <h3 className="text-lg font-semibold text-center">
                  Enter Access Code
                </h3>

                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Access code"
                  className="input"
                />

                <button
                  onClick={() => {
                    toast.dismiss();
                    resolve(value);
                  }}
                  className="btn btn-primary"
                >
                  Submit
                </button>
              </div>
            );
          };

          const toastId = toast.custom((t) => <ToastInput />, {
            duration: Infinity, // stays forever until dismissed
          });

          const dismissToast = () => {
            toast.dismiss();
          };
        });
        const resp = await authorizeRoomAccess(
          { roomId: room._id, accessCode: code },
          token
        );

        if (!resp.success) {
          toast.error(resp.message);
          return;
        }
      }

      joinRoom(room._id);
    } catch (err) {
      console.error("Failed to join room", err);
    }
  }

  function leaveRoom() {
    if (!socket || !socket.connected || !roomId) return log("No room to leave");
    socket.emit("leave-room", (response) => {
      if (response.status === "error") {
        log("Server: " + response.message);
        toast.error(response.message);
      } else if (response.status === "left") {
        log(`Left room: ${response.roomId}`);
        setRoomId("");
        localStorage.removeItem("roomId");
        stopLocalAudio();
      }
    });
  }
  function showConfirmToast(message, onConfirm, onCancel) {
    toast.custom((t) => (
      <div
        className={`bg-white border shadow-md p-4 rounded-md flex flex-col gap-3 ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
      >
        <p className="font-medium">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onCancel?.();
            }}
            className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm?.();
            }}
            className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    ));
  }
  return (
    <RoomContext.Provider
      value={{
        socket,
        roomId,
        inLobby,
        logs,
        rooms,
        token,
        user,
        messages,
        setRooms,
        log,
        joinRoom,
        handleJoin,
        leaveRoom,
        handleCreate,
        handleMakeLive,
        getCurrentRoom,
        loadRooms,
        setToken,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => useContext(RoomContext);
