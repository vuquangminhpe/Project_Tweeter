import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import socket from "./socket";
import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";

function Chat() {
  const observerRef = useRef();
  const loadMoreRef = useRef(null);
  const chatContainerRef = useRef(null);
  const profile = JSON.parse(localStorage.getItem("profile"));
  const [value, setValue] = useState("");
  const [conversation, setConversation] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0);

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
          params: {
            limit: 15,
            page: 1,
          },
        })
        .then((res) => {
          const conversations = res.data?.result?.conversations;
          setConversation(conversations);
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
          }
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

  const {
    data: PopularData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["conversations", receiver],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get(`/conversations/receivers/${receiver}`, {
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        params: {
          limit: 15,
          page: pageParam,
        },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.result.page < lastPage.result.total_pages) {
        return lastPage.result.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    const container = chatContainerRef.current;

    if (element && container) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        root: container,
        threshold: 0.1,
        rootMargin: "100px", // Thêm margin này để trigger sớm hơn
      });
      observerRef.current.observe(element);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  useEffect(() => {
    if (chatContainerRef.current && previousScrollHeight) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeight;
      chatContainerRef.current.scrollTop = scrollDiff;
    }
  }, [conversation, previousScrollHeight]);

  const allMessages = useMemo(
    () =>
      PopularData?.pages?.flatMap((page) => page.result.conversations) ?? [],
    [PopularData]
  );

  useEffect(() => {
    setConversation(allMessages);
  }, [allMessages]);

  const send = (e) => {
    e.preventDefault();
    if (!value.trim()) return;

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

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };
  console.log(allMessages);

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

      <div
        ref={chatContainerRef}
        className="container container_conversation"
        style={{
          height: "500px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div ref={loadMoreRef} className="py-4 text-center">
          {isFetchingNextPage ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : hasNextPage ? (
            <div className="text-gray-500">Load more messages...</div>
          ) : (
            <div className="text-gray-500">No more messages</div>
          )}
        </div>

        {conversation.map((conversation) => (
          <div key={conversation._id}>
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

      <form onSubmit={send} className="mt-4">
        <input
          type="text"
          onChange={(e) => setValue(e.target.value)}
          value={value}
          className="border p-2 mr-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
