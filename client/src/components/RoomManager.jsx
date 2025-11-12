import { useState } from "react";
import { useRoom } from "../context/RoomContext";
import { localStream } from "../webrtc/audioManager.js";
import {
  Mic,
  MicOff,
  MapPin,
  CirclePlus,
  Circle,
  RadioIcon,
  KeySquareIcon,
} from "lucide-react";
import Chat from "./Chat.jsx";

export default function RoomManager() {
  const {
    user,
    rooms,
    roomId,
    handleCreate,
    handleJoin,
    leaveRoom,
    handleMakeLive,
    getCurrentRoom,
  } = useRoom();

  const [muted, setMuted] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  function handleToggleMute() {
    if (!localStream) return;

    const track = localStream.getAudioTracks()[0];
    track.enabled = !track.enabled; // toggle

    setMuted(!track.enabled); // muted = !enabled
    console.log("Mic enabled:", track.enabled);
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen ">
      {/* Left: Rooms List */}
      <div className="bg-base-100 border border-primary/30 w-full lg:w-1/4 p-3 rounded-xl my-2 lg:my-2">
        <h2 className="text-xl mb-4 ">Rooms</h2>
        <ul className="space-y-2 max-h-[500px] overflow-x-hidden overflow-y-auto no-scrollbar">
          {!rooms || rooms.length === 0 ? (
            <div>Loading rooms...</div>
          ) : (
            rooms
              .slice()
              .reverse()
              .map((room) => (
                <li
                  key={room._id}
                  className={`capitalize py-1 px-2 border border-primary/30 flex justify-between items-center ${
                    roomId === room._id.toString() ? "bg-base-300" : ""
                  }`}
                >
                  <div className="flex items-center text-center gap-x-1">
                    {room.name}
                    <span
                      className="tooltip tooltip-bottom"
                      data-tip={room.status === "live" ? "Live" : "Inactive"}
                    >
                      {room.status === "live" ? (
                        <RadioIcon className="w-4 h-4 text-green-500 " />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                    </span>
                    {room.isPrivate && (
                      <span
                        className="tooltip tooltip-bottom"
                        data-tip="Private Room"
                      >
                        <KeySquareIcon className="w-4 h-4 text-orange-400" />
                      </span>
                    )}
                  </div>
                  {room.creator._id === user._id && room.status !== "live" && (
                    <button
                      onClick={() => handleMakeLive(room._id)}
                      className="btn btn-success btn-xs btn-outline"
                    >
                      Make Room Live
                    </button>
                  )}
                  <div className="flex space-x-2">
                    <div
                      className="tooltip tooltip-left"
                      data-tip={
                        roomId === room._id.toString()
                          ? "Joined"
                          : "Join this room"
                      }
                    >
                      <CirclePlus
                        onClick={() => handleJoin(room)}
                        disabled={roomId === room._id.toString()}
                        className={`cursor-pointer rounded-md text-sm w-4 h-4 ${
                          roomId === room._id.toString()
                            ? "text-primary cursor-not-allowed"
                            : "text-blue-500 hover:text-blue-600"
                        }`}
                      />
                    </div>
                  </div>
                </li>
              ))
          )}
        </ul>
      </div>

      {/* Right: Room Panel */}
      <div className="flex-1 m-2 relative flex flex-col">
        {/* Room Creation Form */}
        <div className="border border-primary/30 rounded-lg shadow-md p-4 mb-2 bg-base-100">
          <h2 className="text-xl font-bold mb-2">Create Room</h2>
          <div className="flex flex-wrap items-center gap-2 w-full">
            {/* Room Name */}
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room Name"
              type="text"
              className="input input-sm grow"
            />

            {/* Access Code: only enabled if private */}
            <input
              value={accessCode}
              type="text"
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Access Code"
              className="input input-sm w-32"
              disabled={!isPrivate}
            />

            {/* Create Button */}
            <button
              onClick={() => {
                handleCreate(roomName, isPrivate ? accessCode : null);
                setRoomName("");
                setAccessCode("");
                setIsPrivate(false);
              }}
              className="btn btn-secondary btn-sm py-1 px-3"
            >
              Create
            </button>

            {/* Public / Private Toggle below */}
            <div className="flex items-center space-x-1 w-full mt-1">
              <input
                type="checkbox"
                id="privateRoom"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="checkbox checkbox-xs"
              />
              <label htmlFor="privateRoom" className="select-none text-xs">
                Make room private via access code
              </label>
            </div>
          </div>
        </div>

        {roomId ? (
          <div className="bg-base-100 border border-primary/30 rounded-lg shadow-md p-4 flex flex-col h-[500px] lg:h-auto">
            <div className="flex flex-col lg:flex-row flex-1 gap-4 overflow-hidden">
              <div className="flex-1 bg-base-300 rounded-md p-4 flex flex-col justify-between">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-base-100 shadow-md rounded-lg p-2 mb-6">
                  <div className="flex items-center gap-3 mb-2 lg:mb-0">
                    <div className="badge badge-outline border-blue-400 text-blue-500 p-3">
                      <MapPin size={18} />
                    </div>

                    {/* Room Title */}
                    <h3 className="text-xl font-semibold ">
                      <span className="badge badge-primary badge-lg font-medium capitalize shadow-md">
                        {getCurrentRoom()?.name || "Unnamed"}
                      </span>
                    </h3>
                  </div>

                  {/* Right: Optional status or users */}
                  <div className="flex items-center gap-4">
                    {/* Room Visibility Badge */}
                    <div
                      className={`badge badge-sm ${
                        getCurrentRoom()?.isPrivate
                          ? "badge-error text-white" // Red badge for private
                          : "badge-success text-white" // Green badge for public
                      }`}
                    >
                      {getCurrentRoom()?.isPrivate ? "Private" : "Public"}
                    </div>

                    {/* Participants Count */}
                    <div className="badge badge-ghost badge-sm text-gray-600">
                      👥 {getCurrentRoom()?.participants.length || 0}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3 mt-4 flex-wrap">
                  {/* Mute / Unmute Button */}
                  <button
                    onClick={handleToggleMute}
                    title={
                      muted
                        ? "Click to unmute your mic"
                        : "Click to mute your mic"
                    }
                    className={`btn btn-sm flex items-center gap-2 ${
                      muted ? "btn-success" : "btn-warning"
                    }`}
                  >
                    {muted ? <MicOff size={18} /> : <Mic size={18} />}
                    {muted ? "Unmute" : "Mute"}
                  </button>

                  {/* Leave Room Button */}
                  <button
                    onClick={leaveRoom}
                    className="btn btn-error btn-sm flex items-center gap-2"
                  >
                    🚪 Leave Room
                  </button>
                </div>
              </div>
              <div className="w-full lg:w-80 border border-primary/30 rounded-md p-4 overflow-y-auto overflow-x-hidden wrap-break-word mt-4 lg:mt-0 box-border ">
                <Chat />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-3xl font-semibold text-primary">
            Join a room to start..
          </div>
        )}
      </div>
    </div>
  );
}
