/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Event_Message_Status } from '@/types/Emoji.types'
import EmojiPicker from 'emoji-picker-react'

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleEmojiClick = (emojiObject: { emoji: string | any[] }, event: MouseEvent) => {
    if (inputRef.current) {
      const cursorPosition = inputRef.current.selectionStart || 0
      const text = inputRef.current.value
      const newText = text.slice(0, cursorPosition) + emojiObject.emoji + text.slice(cursorPosition)
      inputRef.current.value = newText
      setValue(newText)
      inputRef.current.focus()
      inputRef.current.selectionEnd = cursorPosition + emojiObject.emoji.length
    }
  }

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }
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
          limit: 15,
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

        // Set click to true to trigger the load
        setClick(true)

        fetchPreviousPage().then(() => {
          // Reset click to false after loading the page
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
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])
  console.log(chatData)

  const allMessages = useMemo(() => {
    return (
      chatData?.pages
        ?.flatMap((page) => page.result.conversations)
        ?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) ?? []
    )
  }, [chatData])
  console.log(allMessages)

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
      emoji: '',
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

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (e.deltaY < 0 && !isFetchingPreviousPage) {
        setClick(true)
        setTimeout(() => setClick(false), 100)
      }
    },
    [isFetchingPreviousPage]
  )

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }
  const getEmojiByNumber = (number: number): string | undefined => {
    const emojiEntry = Object.entries(Event_Message_Status).find(([key, value]) => {
      const [emoji, num] = value.split('.')
      return parseInt(num, 10) === number
    })
    return emojiEntry ? emojiEntry[1].split('.')[0] : undefined
  }
  return (
    <div className='flex h-screen bg-gray-100'>
      <div className='w-[320px] min-w-[280px] border-r border-gray-200 bg-white overflow-hidden'>
        <StatusWithChat onReceiverChange={setReceiver} onlineUsers={onlineUsers} setOnlineUsers={setOnlineUsers} />
      </div>

      <div className='flex-1 flex flex-col min-w-0'>
        {' '}
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
        <div ref={chatContainerRef} className='flex-1 bg-white overflow-y-auto px-4' onWheel={handleWheel}>
          {conversation?.map((conversation) => (
            <div
              key={conversation._id}
              className={`flex mb-3 ${conversation.sender_id === profile._id ? 'justify-end' : 'justify-start'}`}
            >
              {conversation.sender_id !== profile._id ? (
                <Fragment>
                  <div className='relative shrink-0'>
                    <Avatar className='mr-3 h-8 w-8 sm:h-10 sm:w-10'>
                      <AvatarImage src='https://github.com/shadcn.png' />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {onlineUsers[conversation.sender_id]?.is_online && (
                      <span className='absolute bottom-0 left-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white'></span>
                    )}
                  </div>
                  <div
                    className={`max-w-[70%] items-center px-3 py-2 sm:px-4 sm:py-2 rounded-2xl relative ${
                      conversation.sender_id === profile._id
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-black rounded-bl-none'
                    }`}
                  >
                    <HoverCard>
                      <HoverCardTrigger className='flex items-center justify-between'>
                        <div className='break-words'>{conversation.content}</div>
                        <div className='absolute right-0 bottom-0 translate-y-2 text-sm'>
                          {getEmojiByNumber(conversation.emoji as unknown as number)}
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className='bg-gray-300 translate-y-6 p-3 rounded-xl shadow-xl z-50'>
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
                    receiver={receiver}
                    totalPages={totalPages as number}
                  />
                </Fragment>
              ) : (
                <Fragment>
                  <div
                    className={`max-w-[70%] px-3 py-2 sm:px-4 sm:py-2 rounded-2xl ${
                      conversation.sender_id === profile._id
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-black rounded-bl-none'
                    }`}
                  >
                    <div className='break-words'>{conversation.content}</div>
                  </div>
                  <div className='relative shrink-0'>
                    <Avatar className='ml-3 h-8 w-8 sm:h-10 sm:w-10'>
                      <AvatarImage src='https://github.com/shadcn.png' />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {onlineUsers[conversation.sender_id]?.is_online && (
                      <span className='absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white'></span>
                    )}
                  </div>
                </Fragment>
              )}
            </div>
          ))}
        </div>
        <div className='p-2 sm:p-4 border-t border-gray-200'>
          <div className='flex items-center gap-2'>
            <input
              ref={inputRef}
              type='text'
              onChange={(e) => setValue(e.target.value)}
              value={value}
              onKeyPress={handleKeyPress}
              placeholder='Type a message...'
              className='flex-1 p-2 sm:p-3 border-2 border-gray-300 rounded-xl
                       focus:outline-none focus:border-blue-500 transition duration-300'
            />
            <div className='relative'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='size-8 bg-white rounded-xl p-2 cursor-pointer hover:bg-gray-100 transition duration-300'
                onClick={toggleEmojiPicker}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z'
                />
              </svg>
              {showEmojiPicker && (
                <div className='absolute bottom-full right-0 mb-2'>
                  <div className='bg-white rounded-lg shadow-xl border border-gray-200'>
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                </div>
              )}
            </div>
            <button
              type='submit'
              onClick={send}
              disabled={!value.trim()}
              className='px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-xl
                       hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 
                       transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
