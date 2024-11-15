import { useEffect, useState } from "react";
import socket from "./socket";
function Chat() {
  const profile = JSON.parse(localStorage.getItem("profile"));
  const [value, setValue] = useState("");
  const [message, setMessages] = useState([]);
  useEffect(() => {
    socket.auth = {
      _id: profile._id,
    };
    socket.connect();
    socket.on("receive private message", (data) => {
      const content = data.content;
      setMessages((messages) => [
        ...messages,
        {
          content,
          isSender: false,
        },
      ]);
    });
    return () => {
      socket.disconnect();
    };
  }, [profile._id]);
  const send = (e) => {
    setValue("");
    console.log(e);
    socket.emit("private message", {
      content: value,
      to: "673187cb67a5e547220397ef",
    });
    setMessages((messages) => [
      ...messages,
      {
        content: value,
        isSender: true,
      },
    ]);
  };
  return (
    <div>
      <h1>Chat</h1>
      <div>
        {message.map((message, index) => (
          <div key={index}>
            <div className={`${message.isSender ? "message-right" : ""}`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send}>
        <input
          type="text"
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
