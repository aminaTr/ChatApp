import { useEffect, useState } from "react";
import { useRoom } from "../context/RoomContext";
import { getSocket } from "../socket/socket";
import { SendIcon } from "lucide-react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { user, roomId } = useRoom();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);
  }, [getSocket]);

  useEffect(() => {
    if (!socket) return;

    // Handler for new messages
    const handleNewMessage = (data) => setMessages((prev) => [...prev, data]);
    socket.on("receive-message", handleNewMessage);

    // Handler for messages emitted on join (chat history)
    const handleMessagesOnJoin = (msgs) => setMessages(msgs);
    socket.on("messages", handleMessagesOnJoin);

    return () => {
      socket.off("receive-message", handleNewMessage);
      socket.off("messages", handleMessagesOnJoin);
    };
  }, [socket]);

  function sendMessage() {
    // console.log('input',input)
    if (!input.trim()) return;
    socket.emit("send-message", { roomId, user, message: input });
    setInput("");
  }

  return (
    <div className="flex flex-col bg-green-100 shadow-md rounded-lg w-80 h-[380px] p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-700 ">Side Chat</h3>

      {/* Messages Container */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50">
        {messages.map((msg, i) => {
          const isOwn = msg.userId === user._id;

          return (
            <div
              key={i}
              className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
            >
              <div
                className={`px-3 py-1 rounded-xl max-w-[80%] wrap-break-word ${
                  isOwn
                    ? "bg-green-200 text-gray-800"
                    : "bg-gray-200 text-gray-900"
                } shadow-sm`}
              >
                <span className="text-sm font-semibold">{msg.username}</span>:{" "}
                <span className="text-sm">{msg.message}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input + Send Button */}
      <div className="flex mt-3 gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 hover:bg-green-600 text-white cursor-pointer px-4 py-2 rounded-lg transition-colors"
        >
          <SendIcon className="inline-block w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
