import { useEffect, useState } from "react";
import socket from "./socket";
function Chat() {
  const profile = JSON.parse(localStorage.getItem("profile"));
  const [value, setValue] = useState("");
  useEffect(() => {
    console.log(profile._id);

    socket.auth = {
      _id: profile._id,
    };
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [profile._id]);
  const handleSubmit = (e) => {
    setValue("");
    console.log(e);
  };
  return (
    <div>
      <h1>Chat</h1>
      <form onSubmit={handleSubmit}>
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
