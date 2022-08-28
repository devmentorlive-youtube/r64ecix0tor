import { useEffect, useState, useRef } from "react";

export default function Homepage() {
  const [messages, setMessages] = useState([]);

  const [cbMode, setCbMode] = useState(false);
  const socketRef = useRef();
  const chatWindowRef = useRef();

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8080");
    socketRef.current.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type !== "chat-message") return;

      setMessages((prev) => [...prev, data]);
    };
    return () => {
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    chatWindowRef.current.scrollTo(0, chatWindowRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className="mt-16 container mx-auto">
      <div>
        <div className="h-[600px] overflow-y-scroll p-4" ref={chatWindowRef}>
          {messages.map((message) => (
            <Message {...message} cbMode={cbMode} />
          ))}
        </div>

        <Composer
          socket={socketRef.current}
          cbMode={cbMode}
          onCbModeChange={setCbMode}
        />
      </div>
    </div>
  );
}

function Composer({ socket, cbMode = false, onCbModeChange = () => {} }) {
  const [message, setMessage] = useState("");
  const chatMessageRef = useRef();

  function sendMessage(message) {
    socket.send(
      JSON.stringify({
        type: "chat-message",
        body: message,
        user: {
          name: "Mark",
          color: "indigo",
        },
      })
    );
  }

  return (
    <div>
      <input
        ref={chatMessageRef}
        className="p-2 w-full text-gray-800"
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        className="bg-blue-400 py-1 px-8 rounded"
        onClick={() => {
          sendMessage(message);
          setMessage("");
        }}>
        send
      </button>
      <div>
        <input
          type="checkbox"
          checked={cbMode}
          onChange={(e) => onCbModeChange(e.target.checked)}
        />{" "}
        <label onClick={(e) => onCbModeChange((prev) => !prev)}>
          Color blind mode
        </label>
      </div>
    </div>
  );
}

function Message({ body, user, cbMode = false }) {
  return (
    <div className="py-1">
      <span
        style={{
          color: cbMode ? "white" : user.color,
          fontWeight: cbMode ? "bold" : "normal",
        }}>
        [{user.name}]
      </span>{" "}
      - <span>{body}</span>
    </div>
  );
}
