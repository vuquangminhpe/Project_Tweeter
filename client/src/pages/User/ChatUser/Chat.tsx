import { useEffect, useState, useCallback, useMemo, useRef, WheelEvent, Fragment } from 'react'
import axios from 'axios'
import { useInfiniteQuery } from '@tanstack/react-query'
import socket from '@/utils/socket'
import { Conversation, ConversationResponse } from '@/types/Conversation.type'
import { Profile } from '@/types/User.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import StatusWithChat from './StatusWithChat/StatusWithChat'
import EventWithMessage from './EventWithMessage'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@radix-ui/react-hover-card'

interface UserStatus {
  user_id: string
  is_online: boolean
  last_active: Date
}

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
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: UserStatus }>({
    [profile._id]: {
      user_id: profile._id,
      is_online: true,
      last_active: new Date()
    }
  })

  const isLoadingRef = useRef<boolean>(false)

  useEffect(() => {
    if (profile._id) {
      setReceiver(profile._id)
    }

    socket.on('receive_conversation', (data: { payload: Conversation }) => {
      const { payload } = data
      setConversation((conversations) => [...conversations, payload])
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    })

    return () => {
      socket.off('receive_conversation')
    }
  }, [profile._id])

  useEffect(() => {
    if (receiver) {
      socket.emit('get_user_status', receiver)
      socket.on('user_status_response', (status: UserStatus) => {
        setOnlineUsers((prev) => ({
          ...prev,
          [status.user_id]: status
        }))
      })
    }
  }, [receiver])

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

    return () => {
      controller.abort()
    }
  }, [receiver, totalPages])

  const {
    data: chatData,
    refetch: refetchChatData,
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
        threshold: 0.5,
        rootMargin: '50px'
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
    if (!isLoadingRef.current) {
      setConversation(allMessages)

      if (!initialScrollSet && chatContainerRef.current && allMessages.length > 0) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        setInitialScrollSet(true)
      }
    }
  }, [allMessages, initialScrollSet])

  const send = () => {
    if (!value.trim()) return

    setValue('')
    const conversation: Conversation = {
      content: value,
      sender_id: profile._id,
      receive_id: receiver,
      _id: new Date().getTime(),
      created_at: new Date(),
      updated_at: new Date()
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }
  console.log(conversation)

  return (
    <div className='container mx-auto max-w-4xl px-4 py-8'>
      <StatusWithChat onReceiverChange={setReceiver} onlineUsers={onlineUsers} setOnlineUsers={setOnlineUsers} />

      <div ref={loadPreviousRef} className='w-full py-4 text-center'>
        {isFetchingPreviousPage ? (
          <div className='flex justify-center'>
            <div className='animate-spin rounded-full h-3 w-3 border-t-4 border-b-4 border-blue-500'></div>
          </div>
        ) : hasPreviousPage ? (
          <div className='text-gray-500 italic'>Scroll up for previous messages...</div>
        ) : (
          receiver.length > 0 && <div className='text-gray-400'>No more messages to load</div>
        )}
      </div>

      <div
        ref={chatContainerRef}
        className='bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto'
        style={{
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem'
        }}
        onWheel={handleWheel}
      >
        {conversation?.map((conversation) => (
          <div
            key={conversation._id}
            className={`flex mb-3 ${conversation.sender_id === profile._id ? 'justify-end' : 'justify-start'}`}
          >
            {conversation.sender_id !== profile._id ? (
              <Fragment>
                <div className='relative'>
                  <Avatar className='mr-3'>
                    <AvatarImage src='https://github.com/shadcn.png' />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {onlineUsers[conversation.sender_id]?.is_online && (
                    <span className='absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></span>
                  )}
                </div>
                <div
                  className={`max-w-[70%] items-center px-4 py-2 rounded-2xl ${
                    conversation.sender_id === profile._id
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-black rounded-bl-none'
                  }`}
                >
                  <HoverCard>
                    <HoverCardTrigger className='flex items-center justify-between'>
                      <div>{conversation.content}</div>
                    </HoverCardTrigger>
                    <HoverCardContent className='bg-gray-300 translate-y-6 p-3 rounded-xl shadow-xl'>
                      {new Date(conversation?.created_at).toISOString() !==
                      new Date(conversation?.updated_at).toISOString()
                        ? new Date(conversation?.updated_at).toLocaleString() + ' (đã chỉnh sửa)'
                        : new Date(conversation?.created_at).toLocaleString()}
                    </HoverCardContent>
                  </HoverCard>
                </div>

                <EventWithMessage
                  refetchChatData={refetchChatData}
                  message_id={conversation?._id}
                  content={conversation?.content}
                />
              </Fragment>
            ) : (
              <Fragment>
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    conversation.sender_id === profile._id
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-black rounded-bl-none'
                  }`}
                >
                  {conversation.content}
                </div>
                <div className='relative'>
                  <Avatar className='ml-3'>
                    <AvatarImage src='https://github.com/shadcn.png' />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {onlineUsers[conversation.sender_id]?.is_online && (
                    <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></span>
                  )}
                </div>
              </Fragment>
            )}
          </div>
        ))}
      </div>

      <div className='flex items-center mt-4 shadow-sm'>
        <input
          type='text'
          onChange={(e) => setValue(e.target.value)}
          value={value}
          onKeyPress={handleKeyPress}
          placeholder='Type a message...'
          className='flex-grow p-3 border-2 border-r-0 border-gray-300 rounded-xl mr-2
                     focus:outline-none focus:border-blue-500 transition duration-300'
        />
        <button
          type='submit'
          onClick={send}
          disabled={!value.trim()}
          className='px-6 py-3 bg-blue-500 text-white rounded-xl
                     hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 
                     transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat
