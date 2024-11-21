import { useEffect, useState, useCallback, useMemo, useRef, FormEvent, WheelEvent } from 'react'
import axios from 'axios'
import { useInfiniteQuery } from '@tanstack/react-query'
import socket from '@/socket'
import { Conversation, ConversationResponse } from '@/types/Conversation.type'
import { Profile } from '@/types/User.type'

function Chat() {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadPreviousRef = useRef<HTMLDivElement>(null)
  const profile = JSON.parse(localStorage.getItem('profile') as string) as Profile
  const [click, setClick] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const [conversation, setConversation] = useState<Conversation[]>([])
  const [totalPages, setTotalPages] = useState<number | undefined>()
  const [receiver, setReceiver] = useState<string>('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [initialScrollSet, setInitialScrollSet] = useState<boolean>(false)

  const usernames = [{ value: 'minh9972' }, { value: 'minh7792' }]

  useEffect(() => {
    socket.auth = {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      _id: profile._id
    }
    socket.connect()
    socket.on('receive_conversation', (data: { payload: Conversation }) => {
      const { payload } = data
      setConversation((conversations) => [...conversations, payload])
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [profile._id])

  useEffect(() => {
    const controller = new AbortController()

    if (receiver) {
      axios
        .get<ConversationResponse>(`/conversations/receivers/${receiver}`, {
          baseURL: import.meta.env.VITE_API_URL,
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          },
          params: {
            limit: 10,
            page: 1
          }
        })
        .then((res) => {
          const conversations = res.data?.result.total_pages
          setTotalPages(conversations)
        })
        .catch((error) => console.log(error))
    }
  }, [receiver, totalPages])

  const getProfile = (username: string) => {
    const controller = new AbortController()
    axios
      .get<{ _id: string }>(`/users/${username}`, {
        baseURL: import.meta.env.VITE_API_URL,
        signal: controller.signal
      })
      .then((res) => {
        setReceiver(res.data._id)
      })
  }

  const {
    data: chatData,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage
  } = useInfiniteQuery({
    queryKey: [receiver, totalPages],
    queryFn: async ({ pageParam = Number(totalPages) }) => {
      const response = await axios.get<ConversationResponse>(`/conversations/receivers/${receiver}`, {
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        params: {
          limit: 10,
          page: pageParam
        }
      })

      return response.data
    },
    getPreviousPageParam: (firstPage) => {
      if (click && firstPage.result.page > 1) {
        return Number(firstPage.result.page) - 1
      }
      return undefined
    },
    initialPageParam: totalPages,
    staleTime: 5 * 60 * 1000,
    getNextPageParam: () => undefined,
    select: (data) => ({
      pages: [...data.pages],
      pageParams: [...data.pageParams]
    })
  })

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && hasPreviousPage && !isFetchingPreviousPage) {
        const currentScrollHeight = chatContainerRef.current?.scrollHeight || 0

        fetchPreviousPage().then(() => {
          requestAnimationFrame(() => {
            if (chatContainerRef.current) {
              const newScrollHeight = chatContainerRef.current.scrollHeight
              chatContainerRef.current.scrollTop = newScrollHeight - currentScrollHeight
            }
          })
        })
      }
    },
    [fetchPreviousPage, hasPreviousPage, isFetchingPreviousPage]
  )

  useEffect(() => {
    const element = loadPreviousRef.current
    if (element) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        threshold: 0.8
      })
      observerRef.current.observe(element)
    }
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])

  const allMessages = useMemo(() => chatData?.pages?.flatMap((page) => page.result.conversations) ?? [], [chatData])

  useEffect(() => {
    setConversation(allMessages)

    if (!initialScrollSet && chatContainerRef.current && allMessages.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      setInitialScrollSet(true)
    }
  }, [allMessages, initialScrollSet])

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValue('')
    const conversation: Conversation = {
      content: value,
      sender_id: profile._id,
      receive_id: receiver,
      _id: new Date().getTime()
    }
    socket.emit('send_conversation', {
      payload: conversation
    })
    setConversation((conversations) => [...conversations, conversation])
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) {
      setClick(true)
    }
  }, [])

  console.log(conversation)

  return (
    <div className='container'>
      <div>Hello user {profile.username}</div>
      <h1>Chat</h1>
      <div className='container_username'>
        {usernames.map((username) => (
          <div key={username.value} style={{ display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => getProfile(username.value)}>{username.value}</button>
          </div>
        ))}
      </div>

      <div ref={loadPreviousRef} className='w-full py-4 text-center flex justify-center items-center'>
        {isFetchingPreviousPage ? (
          <div className='flex justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
          </div>
        ) : hasPreviousPage ? (
          <div className='text-gray-500'>Scroll up for previous messages....</div>
        ) : (
          <div className='text-gray-500'>No more messages to load</div>
        )}
      </div>

      <div
        ref={chatContainerRef}
        className='container container_conversation'
        style={{
          height: '500px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
        onWheel={handleWheel}
      >
        {conversation.map((conversation) => (
          <div key={conversation._id}>
            <div
              className={`conversation_item ${
                conversation.sender_id === profile._id ? 'conversation-right' : 'conversation-left'
              }`}
            >
              {conversation.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className='mt-4'>
        <input type='text' onChange={(e) => setValue(e.target.value)} value={value} className='border p-2 mr-2' />
        <button type='submit' className='px-4 py-2 bg-blue-500 text-white rounded'>
          Send
        </button>
      </form>
    </div>
  )
}

export default Chat
