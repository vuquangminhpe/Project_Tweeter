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

  const profile = JSON.parse(localStorage.getItem('profile') as string) as Profile
  const [click, setClick] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const [conversation, setConversation] = useState<Conversation[]>([])
  const [totalPages, setTotalPages] = useState<number | undefined>()
  const [receiver, setReceiver] = useState<string>('')
  const [initialScrollSet, setInitialScrollSet] = useState<boolean>(false)
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: UserStatus }>({
    [profile?._id]: {
      user_id: profile?._id,
      is_online: true,
      last_active: new Date()
    }
  })

  // Trong component Chat, thêm state
  const [editingMessageId, setEditingMessageId] = useState<string | number | null>(null)
  const [editingContent, setEditingContent] = useState<string>('')

  // Thêm hàm xử lý edit
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

  useEffect(() => {
    socket.connect()
    if (profile._id) {
      setReceiver(profile._id)
    }
    console.log(socket)

    socket.on('receive_conversation', (data: { payload: Conversation }) => {
      const { payload } = data
      setConversation((prev) => [...prev, payload])
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    })

    return () => {
      socket.off('receive_conversation')
    }
  }, [profile?._id])

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
    async function fetchData() {
      const response = await conversationsApi.getChatWithFriend(receiver, 10, 1)
      setTotalPages(response.data.result.total_pages)
    }
    fetchData()
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
    })
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

  return (
    <div ref={messagesEndRef} className='flex h-screen bg-gray-100'>
      <div className='w-[320px] min-w-[280px] border-r border-gray-200 bg-white overflow-hidden'>
        <StatusWithChat
          onReceiverChange={setReceiver}
          onlineUsers={onlineUsers}
          statusOnline={onlineUsers[receiver]?.is_online}
        />
      </div>

      <div className='flex-1 flex flex-col min-w-0'>
        <div ref={loadPreviousRef} className='w-full py-4 text-center'>
          <HeaderChat
            receiverId={receiver}
            onlineReceiver={onlineUsers[receiver]?.is_online}
            onlineUsers={onlineUsers}
            setOnlineUsers={setOnlineUsers}
          />
        </div>

        <div ref={chatContainerRef} className='flex-1 bg-white overflow-y-auto px-4' onWheel={handleWheel}>
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
                      onStartEditing={handleStartEditing} // thêm prop onStartEditing
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
                    <span className='absolute bottom-0 left-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white'></span>
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
  )
}

export default Chat
