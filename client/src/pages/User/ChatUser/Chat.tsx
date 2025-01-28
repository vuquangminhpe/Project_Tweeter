import { useEffect, useState, useCallback, useMemo, useRef, WheelEvent, Fragment } from 'react'
import axios from 'axios'
import { useInfiniteQuery } from '@tanstack/react-query'
import socket from '@/utils/socket'
import { Conversation, ConversationResponse } from '@/types/Conversation.type'
import { Profile } from '@/types/User.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

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
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: UserStatus }>({})
  console.log('onlineUsers', onlineUsers)
  const previousScrollHeightRef = useRef<number>(0)
  const isLoadingRef = useRef<boolean>(false)
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

    socket.on('user_status_change', (data: UserStatus) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.user_id]: data
      }))
    })

    socket.emit('get_all_online_users')
    socket.on('all_online_users_response', (users: { [key: string]: UserStatus }) => {
      setOnlineUsers(users)
    })

    return () => {
      socket.disconnect()
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

  const formatLastActive = (date: Date) => {
    const lastActive = new Date(date)
    const now = new Date()
    const diffInMilliseconds = Math.abs(now.getTime() - lastActive.getTime()) // Xử lý chênh lệch âm
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))

    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className='container mx-auto max-w-4xl px-4 py-8'>
      <div className='text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-xl shadow-md'>
        <div className='text-xl font-medium'>Welcome</div>
        <h1 className='text-3xl font-bold tracking-wider'>{profile.username}</h1>
      </div>

      <div className='flex justify-center space-x-4 my-6'>
        {usernames.map((username) => (
          <button
            key={username.value}
            onClick={() => getProfile(username.value)}
            className='px-6 py-2 bg-blue-500 text-white rounded-full transition duration-300 
                       hover:bg-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300'
          >
            <div className='flex items-center space-x-2'>
              <span>{username.value}</span>
              {receiver && onlineUsers[receiver] && (
                <Badge variant={onlineUsers[receiver].is_online ? 'success' : 'secondary'} className='ml-2'>
                  {onlineUsers[receiver].is_online
                    ? 'Online'
                    : `Last seen ${formatLastActive(onlineUsers[receiver].last_active)}`}
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>

      <div ref={loadPreviousRef} className='w-full py-4 text-center'>
        {isFetchingPreviousPage ? (
          <div className='flex justify-center'>
            <div className='animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500'></div>
          </div>
        ) : hasPreviousPage ? (
          <div className='text-gray-500 italic'>Scroll up for previous messages...</div>
        ) : (
          <div className='text-gray-400'>No more messages to load</div>
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
        {conversation.map((conversation) => (
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
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    conversation.sender_id === profile._id
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-black rounded-bl-none'
                  }`}
                >
                  {conversation.content}
                </div>
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
