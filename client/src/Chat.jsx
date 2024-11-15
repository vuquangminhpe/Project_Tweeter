import { useEffect, useState } from "react";
import socket from "./socket";
import axios from "axios";
function Chat() {
  const profile = JSON.parse(localStorage.getItem("profile"));
  const [value, setValue] = useState("");
  const [message, setMessages] = useState([]);
  const [receiver, setReceiver] = useState("");
  const usernames = [
    {
      value: "minh9972",
    },
    {
      value: "minh7792",
    },
  ];
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
  const getProfile = (username) => {
    const controller = new AbortController();
    axios
      .get(`/users/${username}`, {
        baseURL: import.meta.env.VITE_API_URL,
        signal: controller.signal,
      })
      .then((res) => {
        setReceiver(res.data._id);
      });
  };
  const send = (e) => {
    e.preventDefault();
    setValue("");
    console.log(e);

    socket.emit("private message", {
      content: value,
      to: receiver,
      from: profile._id,
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
    <div className="container">
      <div>Hello user {profile.username}</div>
      <h1>Chat</h1>
      <div className="container_username">
        {usernames.map((username) => (
          <div
            key={username.value}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <button onClick={() => getProfile(username.value)}>
              {username.value}
            </button>
          </div>
        ))}
      </div>
      <div className="container">
        {message.map((message, index) => (
          <div key={index}>
            <div
              className={`message_item ${
                message.isSender ? "message-right" : "message-left"
              }`}
            >
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
