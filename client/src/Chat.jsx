import { useEffect, useState } from "react";
import socket from "./socket";
import axios from "axios";
function Chat() {
  const profile = JSON.parse(localStorage.getItem("profile"));
  const [value, setValue] = useState("");
  const [conversation, setConversation] = useState([]);
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
    socket.on("receive_conversation", (data) => {
      const { payload } = data;
      setConversation((conversations) => [...conversations, payload]);
    });
    return () => {
      socket.disconnect();
    };
  }, [profile._id]);

  useEffect(() => {
    const controller = new AbortController();

    if (receiver) {
      axios
        .get(`/conversations/receivers/${receiver}`, {
          baseURL: import.meta.env.VITE_API_URL,
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          limit: 40,
          page: 1,
        })
        .then((res) => {
          const conversations = res.data?.result?.conversations;

          setConversation(conversations);
        })
        .catch((error) => console.log(error));
    }
  }, [receiver]);
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
    const conversation = {
      content: value,
      sender_id: profile._id,
      receive_id: receiver,
    };
    socket.emit("send_conversation", {
      payload: conversation,
    });
    setConversation((conversations) => [
      ...conversations,
      {
        ...conversation,
        _id: new Date().getTime(),
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
      <div className="container container_conversation">
        {conversation.map((conversation, index) => (
          <div key={index}>
            <div
              className={`conversation_item ${
                conversation.sender_id === profile._id
                  ? "conversation-right"
                  : "conversation-left"
              }`}
            >
              {conversation.content}
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
