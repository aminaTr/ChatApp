import { RoomProvider } from "./context/RoomContext";
import { useState } from "react";
import Login from "./components/Login";
import RoomManager from "./components/RoomManager";
import { UserRoundMinusIcon } from "lucide-react";
import { Toaster } from "react-hot-toast";
import ThemeController from "./components/ThemeController";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined" || stored === "null") return null;
      return JSON.parse(stored);
    } catch (err) {
      console.error("Error parsing user:", err);
      return null;
    }
  });
  return (
    <RoomProvider user={user} setUser={setUser}>
      <AppUI user={user} setUser={setUser} />
      <Toaster />
    </RoomProvider>
  );
}

function signOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("roomId");
  localStorage.removeItem("inLobby");
  window.location.reload();
}

function AppUI({ user, setUser }) {
  // const { logs } = useRoom();

  return (
    <div className=" min-h-screen bg-base-200 p-4">
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <div className=" px-2 py-2">
          {/* Header */}
          <div className="flex items-center w-full justify-between p-2 rounded-lg shadow-md bg-base-100 border border-primary/25">
            {/* App Name */}
            <h1 className="text-2xl  ">Audio Chat App</h1>

            {/* User Info + Logout */}
            <div className="flex items-center space-x-4">
              <ThemeController />
              <div className="text-lg font-mono">
                Hi{" "}
                <span className="capitalize">
                  {user?.displayName || "guest"}!
                </span>
              </div>
              <button
                onClick={signOut}
                className="btn btn-accent text-sm  px-3 py-2 rounded-lg transition-colors"
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
      )}
    </div>
  );
}
