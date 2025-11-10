import { RoomProvider } from "./context/RoomContext";
import { useRoom } from "./context/RoomContext";
import { useState } from "react";
import Login from "./components/Login";
import RoomManager from "./components/RoomManager";
import "./App.css";
import { UserRoundMinusIcon } from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  });

  if (!user) return <Login onLogin={setUser} />;

  return (
    <RoomProvider user={user}>
      <AppUI user={user} />
      <Toaster />
    </RoomProvider>
  );
}

function logOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("roomId");
  localStorage.removeItem("inLobby");
  window.location.reload();
}

function AppUI({ user }) {
  const { logs } = useRoom();

  return (
    <div className=" " data-theme="light">
      <div className=" mx-2 px-4 mt-4">
        {/* Header */}
        <div className="flex items-center w-full justify-between bg-blue-200 p-4 rounded-lg shadow-md">
          {/* App Name */}
          <h1 className="text-4xl font-bold ">Audio Chat App</h1>

          {/* User Info + Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-lg font-medium">
              Hi {user?.displayName || "Guest"}!
            </div>
            <button
              onClick={logOut}
              className="bg-blue-500 hover:bg-blue-600 text-sm text-white px-3 py-2 rounded-lg transition-colors"
            >
              <UserRoundMinusIcon className="inline-block w-4 h-4 mr-1" />
              Sign Out
            </button>
          </div>
        </div>

        <RoomManager />

        {/* <h3>Logs</h3>
      <div
        style={{
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
          padding: 10,
          background: "#eee",
          height: 300,
          overflow: "auto",
          marginTop: 10,
        }}
      >
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div> */}
      </div>
    </div>
  );
}
