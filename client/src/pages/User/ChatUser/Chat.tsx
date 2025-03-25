/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import socket from '@/utils/socket'
import { Conversation } from '@/types/Conversation.type'
import { Profile } from '@/types/User.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import StatusWithChat from './StatusWithChat/StatusWithChat'
import EventWithMessage from './EventWithMessage'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@radix-ui/react-hover-card'
import { Event_Message_Status } from '@/types/Emoji.types'
import conversationsApi from '@/apis/conversation.api'
import ChatInput from './ChatInput'
import HeaderChat from './HeaderChat'
import { AnimatePresence, motion } from 'framer-motion'
import Navigation from '@/components/Navigation/Navigation'

export interface UserStatus {
  user_id: string
  is_online: boolean
  last_active: Date
}

function Chat() {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadPreviousRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isLoadingRef = useRef<boolean>(false)

  const [isMobile, setIsMobile] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)

  const profile = JSON.parse(localStorage.getItem('profile') as string) as Profile
  const [click, setClick] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const [conversation, setConversation] = useState<Conversation[]>([])
  const [totalPages, setTotalPages] = useState<number | undefined>()
  const [receiver, setReceiver] = useState<string>('')
  const [initialScrollSet, setInitialScrollSet] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: UserStatus }>({})

  const [editingMessageId, setEditingMessageId] = useState<string | number | null>(null)
  const [editingContent, setEditingContent] = useState<string>('')

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 1024) {
        setSidebarVisible(true)
      } else if (window.innerWidth < 768 && receiver) {
        setSidebarVisible(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [receiver])

  const handleStartEditing = (messageId: string | number, content: string) => {
    setEditingMessageId(messageId)
    setEditingContent(content)
  }

  const handleFinishEditing = async (messageId: string | number) => {
    try {
      await conversationsApi.editMessageInConversation(messageId, editingContent)
      await handleRefetch()
      setEditingMessageId(null)
      setEditingContent('')
    } catch (error) {
      console.error('Error editing message:', error)
    }
  }

  const handleRefetch = async () => {
    const currentScroll = chatContainerRef.current?.scrollTop || 0
    await refetchChatData()
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = currentScroll
    }
  }

  const handleReceiverSelect = (receiverId: string) => {
    setReceiver(receiverId)
    if (isMobile) {
      setSidebarVisible(false)
    }
  }

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev)
  }

  useEffect(() => {
    socket.connect()
    if (profile._id) {
      setReceiver(profile._id)
      socket.auth = {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        _id: profile._id
      }
    }

    socket.on('all_online_users_response', (users) => {
      setOnlineUsers(users)
      setIsLoading(false)
    })

    socket.on('user_status_response', (status: UserStatus) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [status.user_id]: status
      }))
    })

    socket.on('user_status_change', (status: UserStatus) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [status.user_id]: status
      }))
    })

    socket.on('receive_conversation', (data: { payload: Conversation }) => {
      const { payload } = data
      setConversation((prev) => [...prev, payload])
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    })

    socket.emit('get_all_online_users')

    return () => {
      socket.off('receive_conversation')
      socket.off('all_online_users_response')
      socket.off('user_status_response')
      socket.off('user_status_change')
    }
  }, [profile?._id])

  useEffect(() => {
    if (receiver && receiver !== profile._id) {
      socket.emit('get_user_status', receiver)
    }
  }, [receiver, profile._id])

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const response = await conversationsApi.getChatWithFriend(receiver, 10, 1)
        setTotalPages(response.data.result.total_pages)
      } catch (error) {
        console.error('Error fetching chat data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (receiver) {
      fetchData()
    }
  }, [receiver])

  const {
    data: chatData,
    refetch: refetchChatData,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage
  } = useInfiniteQuery({
    queryKey: [receiver, totalPages],
    queryFn: async ({ pageParam = Number(totalPages) }) => {
      const response = await conversationsApi.getChatWithFriend(receiver, 10, pageParam)
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
    }),
    enabled: !!receiver && !!totalPages
  })

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && hasPreviousPage && !isFetchingPreviousPage) {
        const currentScrollHeight = chatContainerRef.current?.scrollHeight || 0
        setClick(true)
        fetchPreviousPage().then(() => {
          setClick(false)
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
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [handleObserver])

  const allMessages = useMemo(() => {
    return chatData?.pages?.flatMap((page) => page.result.conversations) ?? []
  }, [chatData])

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
    const newMessage: Conversation = {
      content: value,
      sender_id: profile._id,
      receive_id: receiver,
      _id: new Date().getTime(),
      emoji: '',
      created_at: new Date(),
      updated_at: new Date()
    }
    socket.emit('send_conversation', { payload: newMessage })
    setConversation((prev) => [...prev, newMessage])
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.deltaY < 0 && !isFetchingPreviousPage) {
        setClick(true)
        setTimeout(() => setClick(false), 100)
      }
    },
    [isFetchingPreviousPage]
  )

  const getEmojiByNumber = (number: number): string | undefined => {
    const emojiEntry = Object.entries(Event_Message_Status).find(([key, value]) => {
      const [emoji, num] = value.split('.')
      return parseInt(num, 10) === number
    })
    return emojiEntry ? emojiEntry[1].split('.')[0] : undefined
  }

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-[#0d1117] text-indigo-300'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='relative w-12 h-12'>
            <div className='absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin'></div>
            <div className='absolute inset-1 rounded-full border-2 border-transparent border-r-violet-500 animate-spin animation-delay-150'></div>
          </div>
          <p className='text-lg font-medium bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent'>
            Loading chat data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-black flex min-h-screen max-w-[1500px] mx-auto'>
      {/* Navigation */}
      <div className='hidden sm:flex flex-col items-center xl:items-start xl:w-[340px] p-2 fixed h-full'>
        <Navigation />
      </div>

      {/* Main Content Area */}
      <div className='w-full sm:ml-[73px] xl:ml-[340px] flex'>
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className={`absolute top-4 ${sidebarVisible ? 'left-64' : 'left-4'} z-30 p-2 rounded-full bg-[#161b22] shadow-lg`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              className='w-5 h-5 text-indigo-400'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              {sidebarVisible ? (
                <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
              ) : (
                <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
              )}
            </svg>
          </button>
        )}

        <AnimatePresence>
          {sidebarVisible && (
            <motion.div
              initial={isMobile ? { x: -320 } : { x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='w-80 min-w-80 h-full border-r border-[#1f252e] bg-[#161b22] overflow-hidden shadow-xl absolute md:relative z-20'
            >
              <StatusWithChat
                onReceiverChange={handleReceiverSelect}
                onlineUsers={onlineUsers}
                statusOnline={onlineUsers[receiver]?.is_online || false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Container */}
        <div className='flex-1 flex flex-col h-screen bg-[#0d1117] overflow-hidden'>
          <div className='z-10 relative'>
            <div ref={loadPreviousRef} className='w-full bg-[#161b22] shadow-md'>
              <HeaderChat
                receiverId={receiver}
                onlineReceiver={onlineUsers[receiver]?.is_online || false}
                onlineUsers={onlineUsers}
                setOnlineUsers={setOnlineUsers}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
              />
            </div>
          </div>

          <div 
            ref={chatContainerRef} 
            className='flex-1 bg-[#0d1117] overflow-y-auto px-4 text-white' 
            onWheel={handleWheel}
          >
            {conversation?.map((msg) => (
              <div
                key={msg._id}
                className={`flex mb-3 ${msg.sender_id === profile._id ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender_id !== profile._id ? (
                  <div className='flex items-center group'>
                    <div className='relative shrink-0 ml-2 mr-3'>
                      <Avatar className='h-8 w-8 sm:h-10 sm:w-10'>
                        <AvatarImage src='https://github.com/shadcn.png' />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      {onlineUsers[msg.sender_id]?.is_online && (
                        <span className='absolute bottom-0 left-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white'></span>
                      )}
                    </div>
                    <div className='max-w-[70%] items-center px-3 py-2 sm:px-4 sm:py-2 rounded-2xl relative bg-gray-200 text-black rounded-bl-none'>
                      <HoverCard>
                        <HoverCardTrigger className='flex items-center justify-between'>
                          <div className='break-words'>{msg.content}</div>
                          <div className='absolute right-0 bottom-0 translate-y-2 text-sm'>
                            {getEmojiByNumber(msg.emoji as unknown as number)}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className='bg-gray-300 translate-y-6 p-3 rounded-xl shadow-xl z-50'>
                          {new Date(msg.created_at).toISOString() !== new Date(msg.updated_at).toISOString()
                            ? new Date(msg.updated_at).toLocaleString() + ' (đã chỉnh sửa)'
                            : new Date(msg.created_at).toLocaleString()}
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    <div className='ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                      <EventWithMessage
                        refetchChatData={handleRefetch}
                        message_id={msg._id}
                        content={msg.content}
                        receiver={receiver}
                        totalPages={totalPages as number}
                        isOwnMessage={false}
                        onStartEditing={handleStartEditing}
                      />
                    </div>
                  </div>
                ) : (
                  <div className='flex items-center group'>
                    <div className='mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                      <EventWithMessage
                        refetchChatData={handleRefetch}
                        message_id={msg._id}
                        content={msg.content}
                        receiver={receiver}
                        totalPages={totalPages as number}
                        isOwnMessage={true}
                        onStartEditing={handleStartEditing}
                      />
                    </div>
                    <div className='max-w-[70%] px-3 py-2 sm:px-4 sm:py-2 rounded-2xl bg-blue-500 text-white rounded-br-none'>
                      {editingMessageId === msg._id ? (
                        <div className='flex items-center gap-2'>
                          <input
                            type='text'
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleFinishEditing(msg._id)
                              } else if (e.key === 'Escape') {
                                setEditingMessageId(null)
                                setEditingContent('')
                              }
                            }}
                            className='w-full bg-white text-black px-2 py-1 rounded focus:outline-none'
                            autoFocus
                          />
                          <button
                            onClick={() => handleFinishEditing(msg._id)}
                            className='text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded'
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingMessageId(null)
                              setEditingContent('')
                            }}
                            className='text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded'
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className='break-words'>{msg.content}</div>
                      )}
                    </div>
                    <div className='relative shrink-0 ml-3'>
                      <Avatar className='h-8 w-8 sm:h-10 sm:w-10'>
                        <AvatarImage src='https://github.com/shadcn.png' />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      {onlineUsers[msg.sender_id]?.is_online && (
                        <span className='absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white'></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <ChatInput value={value} setValue={setValue} send={send} inputRef={inputRef} refetchChatData={handleRefetch} />
        </div>
      </div>
    </div>
  )
}

export default Chat
