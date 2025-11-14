import { useState } from "react";
import { useRoom } from "../context/RoomContext";
import { SendIcon } from "lucide-react";
import { getSocket } from "../socket/socket";

export default function Chat() {
  const [input, setInput] = useState("");
  const { user, roomId, messages } = useRoom();

  function sendMessage() {
    const socket = getSocket();
    // console.log('input',input)
    if (!input.trim()) return;
    socket.emit("send-message", { roomId, user, message: input });
    setInput("");
  }

  return (
    <div className="flex flex-col shadow-md rounded-lg w-80 h-[380px] box-border bg-base-100">
      <h3 className="text-lg mb-2 font-semibold">Side Chat</h3>

      {/* Messages Container */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto border border-base-300 rounded-lg bg-base-200 p-2 box-border w-11/12">
        {messages.map((msg, i) => {
          const isOwn = msg.userId === user._id;

          return (
            <div
              key={i}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-xl wrap-break-word whitespace-pre-wrap overflow-hidden ${
                  isOwn
                    ? "bg-primary text-primary-content"
                    : "bg-base-100 text-base-content"
                } shadow-sm max-w-[95%]`}
              >
                <span className="text-xs font-semibold">{msg.username}: </span>
                <span className="text-xs">{msg.message}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input + Send Button */}
      <div className="flex gap-2 mt-3 w-11/12 ">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="input input-bordered input-sm flex-1"
        />
        <button
          onClick={sendMessage}
          className="btn btn-success btn-sm shrink-0"
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
