import { useState } from "react";
import { useRoom } from "../context/RoomContext";
import { localStream } from "../webrtc/audioManager.js";
import { Mic, MicOff, MapPin } from "lucide-react";
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

  // return (
  //   <div className="flex h-screen bg-gray-100" data-theme="light">
  //     {/* Left: Rooms List */}
  //     <div className="w-1/4 bg-blue-200 p-4 overflow-y-auto rounded-xl my-2">
  //       <h2 className="text-2xl font-bold mb-4">Rooms</h2>

  //       <ul className="space-y-2">
  //         {!rooms || rooms.length === 0 ? (
  //           <div>Loading rooms...</div>
  //         ) : (
  //           rooms.map((room) => (
  //             <li
  //               key={room._id}
  //               className={`p-2 border rounded-md flex justify-between items-center ${
  //                 roomId === room._id.toString() ? "bg-blue-50" : ""
  //               }`}
  //             >
  //               <div>
  //                 {room.name} ({room.status}){" "}
  //                 {room.isPrivate && <span>🔒</span>}
  //               </div>

  //               <div className="flex space-x-2">
  //                 {room.creator._id === user._id && room.status !== "live" && (
  //                   <button
  //                     onClick={() => handleMakeLive(room._id)}
  //                     className="bg-green-500 hover:bg-green-600 text-white px-2 rounded-md text-sm"
  //                   >
  //                     Make Live
  //                   </button>
  //                 )}

  //                 <button
  //                   onClick={() => handleJoin(room)}
  //                   disabled={roomId === room._id.toString()}
  //                   className={`px-2 py-1 cursor-pointer rounded-md text-sm ${
  //                     roomId === room._id.toString()
  //                       ? "bg-gray-300 cursor-not-allowed"
  //                       : "bg-blue-500 hover:bg-blue-600 text-white"
  //                   }`}
  //                 >
  //                   Join
  //                 </button>
  //               </div>
  //             </li>
  //           ))
  //         )}
  //       </ul>
  //     </div>

  //     {/* Right: Room Panel */}
  //     <div className="flex-1 p-4 relative flex flex-col">
  //       {/* Room Creation Form */}
  //       <div className="bg-white rounded-lg shadow-md p-4 mb-4">
  //         <h2 className="text-xl font-bold mb-2">Create Room</h2>

  //         <div className="flex flex-wrap items-center gap-2">
  //           {/* Room Name */}
  //           <input
  //             value={roomName}
  //             onChange={(e) => setRoomName(e.target.value)}
  //             placeholder="Room Name"
  //             className="border p-2 rounded-md flex-1 min-w-[150px]"
  //           />

  //           {/* Public / Private Toggle */}
  //           <div className="flex items-center space-x-1">
  //             <input
  //               type="checkbox"
  //               id="privateRoom"
  //               checked={isPrivate}
  //               onChange={(e) => setIsPrivate(e.target.checked)}
  //               className="h-4 w-4"
  //             />
  //             <label htmlFor="privateRoom" className="select-none text-sm">
  //               Private
  //             </label>
  //           </div>

  //           {/* Access Code: only enabled if private */}
  //           <input
  //             value={accessCode}
  //             onChange={(e) => setAccessCode(e.target.value)}
  //             placeholder="Access Code"
  //             className={`border p-2 rounded-md min-w-[120px] ${
  //               !isPrivate ? "bg-gray-100 cursor-not-allowed" : ""
  //             }`}
  //             disabled={!isPrivate}
  //           />

  //           {/* Create Button */}
  //           <button
  //             onClick={() => {
  //               handleCreate(roomName, isPrivate ? accessCode : null);
  //               setRoomName("");
  //               setAccessCode("");
  //               setIsPrivate(false);
  //             }}
  //             className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
  //           >
  //             Create
  //           </button>
  //         </div>
  //       </div>

  //       {roomId ? (
  //         <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-[500px]">
  //           <div className="flex flex-1 gap-4 overflow-hidden">
  //             <div className="flex-1 bg-gray-300 rounded-md p-4 flex flex-col justify-between">
  //               <div className="flex items-center justify-between bg-white shadow-md rounded-lg p-4 mb-6">
  //                 {/* Left: Room Info */}
  //                 <div className="flex items-center gap-3">
  //                   <MapPin className="text-blue-500" size={24} />
  //                   <h3 className="text-2xl font-semibold text-gray-800">
  //                     Room:{" "}
  //                     <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium capitalize shadow-sm">
  //                       {getCurrentRoom()?.name}
  //                     </span>
  //                   </h3>
  //                 </div>

  //                 {/* Right: Optional status or users */}
  //                 <div className="flex items-center gap-4">
  //                   <span className="text-gray-500 text-sm">
  //                     {getCurrentRoom()?.isPrivate ? "Private" : "Public"}
  //                   </span>
  //                   <span className="text-gray-500 text-sm">
  //                     Participants {getCurrentRoom()?.participants.length}
  //                   </span>
  //                 </div>
  //               </div>

  //               <div className="flex justify-center gap-2 mt-4">
  //                 <button
  //                   onClick={handleToggleMute}
  //                   title={
  //                     muted
  //                       ? "Click to unmute your mic"
  //                       : "Click to mute your mic"
  //                   }
  //                   className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-md flex items-center gap-2"
  //                 >
  //                   {muted ? <MicOff size={20} /> : <Mic size={20} />}
  //                 </button>
  //                 <button
  //                   onClick={leaveRoom}
  //                   className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
  //                 >
  //                   Leave Room
  //                 </button>
  //               </div>
  //             </div>

  //             <div className="w-80 bg-gray-50 rounded-md p-4 overflow-y-auto overflow-x-hidden wrap-break-word">
  //               <Chat />
  //             </div>
  //           </div>
  //         </div>
  //       ) : (
  //         <div className="flex-1 flex items-center justify-center text-3xl text-gray-500">
  //           Join a room to start
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
  return (
    <div
      className="flex flex-col lg:flex-row h-screen bg-gray-100"
      data-theme="light"
    >
      {/* Left: Rooms List */}
      <div className="w-full lg:w-1/4 bg-blue-200 p-4 overflow-y-auto rounded-xl my-2 lg:my-2">
        <h2 className="text-2xl font-bold mb-4">Rooms</h2>

        <ul className="space-y-2">
          {!rooms || rooms.length === 0 ? (
            <div>Loading rooms...</div>
          ) : (
            rooms.map((room) => (
              <li
                key={room._id}
                className={`p-2 border rounded-md flex justify-between items-center ${
                  roomId === room._id.toString() ? "bg-blue-50" : ""
                }`}
              >
                <div>
                  {room.name} ({room.status}){" "}
                  {room.isPrivate && <span>🔒</span>}
                </div>

                <div className="flex space-x-2">
                  {room.creator._id === user._id && room.status !== "live" && (
                    <button
                      onClick={() => handleMakeLive(room._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 rounded-md text-sm"
                    >
                      Make Live
                    </button>
                  )}

                  <button
                    onClick={() => handleJoin(room)}
                    disabled={roomId === room._id.toString()}
                    className={`px-2 py-1 cursor-pointer rounded-md text-sm ${
                      roomId === room._id.toString()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    Join
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Right: Room Panel */}
      <div className="flex-1 p-4 relative flex flex-col">
        {/* Room Creation Form */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-bold mb-2">Create Room</h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Room Name */}
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room Name"
              className="border p-2 rounded-md flex-1 min-w-[150px]"
            />

            {/* Public / Private Toggle */}
            <div className="flex items-center space-x-1">
              <input
                type="checkbox"
                id="privateRoom"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="privateRoom" className="select-none text-sm">
                Private
              </label>
            </div>

            {/* Access Code: only enabled if private */}
            <input
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Access Code"
              className={`border p-2 rounded-md min-w-[120px] ${
                !isPrivate ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
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
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              Create
            </button>
          </div>
        </div>

        {roomId ? (
          <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-[500px] lg:h-auto">
            <div className="flex flex-col lg:flex-row flex-1 gap-4 overflow-hidden">
              <div className="flex-1 bg-gray-300 rounded-md p-4 flex flex-col justify-between">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white shadow-md rounded-lg p-4 mb-6">
                  {/* Left: Room Info */}
                  <div className="flex items-center gap-3 mb-2 lg:mb-0">
                    <MapPin className="text-blue-500" size={24} />
                    <h3 className="text-2xl font-semibold text-gray-800">
                      Room:{" "}
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium capitalize shadow-sm">
                        {getCurrentRoom()?.name}
                      </span>
                    </h3>
                  </div>

                  {/* Right: Optional status or users */}
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm">
                      {getCurrentRoom()?.isPrivate ? "Private" : "Public"}
                    </span>
                    <span className="text-gray-500 text-sm">
                      Participants {getCurrentRoom()?.participants.length}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  <button
                    onClick={handleToggleMute}
                    title={
                      muted
                        ? "Click to unmute your mic"
                        : "Click to mute your mic"
                    }
                    className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-md flex items-center gap-2"
                  >
                    {muted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <button
                    onClick={leaveRoom}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                  >
                    Leave Room
                  </button>
                </div>
              </div>

              <div className="w-full lg:w-80 bg-gray-50 rounded-md p-4 overflow-y-auto overflow-x-hidden wrap-break-word mt-4 lg:mt-0">
                <Chat />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-3xl text-gray-500">
            Join a room to start
          </div>
        )}
      </div>
    </div>
  );
}
