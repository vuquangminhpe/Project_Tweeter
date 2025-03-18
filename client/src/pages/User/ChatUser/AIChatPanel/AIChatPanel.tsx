/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import apiAIGEN from '@/apis/ai-gen.api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import { conversations } from '@/types/Ai.types'

interface AIChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

const AnimatedText = memo(({ text }: { text: string }) => {
  return (
    <motion.span
      initial='hidden'
      animate='visible'
      variants={{
        hidden: { opacity: 0.3 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.03
          }
        }
      }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0.3 },
            visible: { opacity: 1 }
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
})

AnimatedText.displayName = 'AnimatedText'

const ChatMessage = memo(({ message }: { message: conversations }) => {
  const isUser = message.sender_id === 'user'

  return (
    <motion.div
      className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial='hidden'
      animate='visible'
      layout='position'
      variants={
        isUser
          ? {
              hidden: { opacity: 0, x: 20 },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  type: 'spring',
                  damping: 25,
                  stiffness: 500
                }
              }
            }
          : {
              hidden: { opacity: 0, x: -20 },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  type: 'spring',
                  damping: 25,
                  stiffness: 500
                }
              }
            }
      }
    >
      {!isUser && (
        <Avatar className='h-8 w-8 mt-1 border-2 border-[#30363d] bg-[#0d1117]'>
          <AvatarImage src='/ai-avatar.png' />
          <AvatarFallback className='bg-[#1d2432] text-indigo-300'>AI</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`p-3 rounded-xl shadow-md max-w-[80%] ${
          isUser
            ? 'bg-[#224a80] text-white rounded-tr-none'
            : 'bg-[#1b222c] text-gray-100 rounded-tl-none border border-[#30363d]'
        }`}
      >
        <p className='text-sm'>{isUser ? message.content : <AnimatedText text={message.content} />}</p>
      </div>
      {isUser && (
        <Avatar className='h-8 w-8 mt-1 border-2 border-[#30363d] bg-[#0d1117]'>
          <AvatarImage src='https://github.com/shadcn.png' />
          <AvatarFallback className='bg-[#1d2432] text-indigo-300'>U</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  )
})

ChatMessage.displayName = 'ChatMessage'

const AIChatPanel = ({ isOpen, onClose }: AIChatPanelProps) => {
  const [message, setMessage] = useState<string>('')
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevConversationLengthRef = useRef(0)

  const { data: conversationData, refetch } = useQuery({
    queryKey: ['ai-conversation'],
    queryFn: async () => await apiAIGEN.getConversationAI({ page: 1, limit: 10 }),
    enabled: isOpen
  })

  const conversations = useMemo(
    () => (conversationData?.data?.data as any)?.conversations || [],
    [conversationData?.data?.data]
  )

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => apiAIGEN.chatBotAiGen(message),
    onMutate: () => {
      setIsTyping(true)
    },
    onSuccess: (data) => {
      refetch()
      console.log(data)

      setIsTyping(false)
    },
    onError: (error) => {
      console.error('Error sending message to AI:', error)
      setIsTyping(false)
    }
  })

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!chatContainerRef.current) return

    const currentLength = conversations.length
    if (currentLength > prevConversationLengthRef.current || isTyping) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      prevConversationLengthRef.current = currentLength
    }
  }, [conversations, isTyping])

  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return

    setMessage('')
    await sendMessageMutation.mutateAsync(message)
  }, [message, sendMessageMutation])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage]
  )

  const panelVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 500
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed bottom-16 right-4 md:right-16 w-[calc(100%-2rem)] sm:w-[350px] h-[450px] bg-[#161b22] rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden border border-[#30363d] backdrop-blur-sm'
          initial='hidden'
          animate='visible'
          exit='exit'
          variants={panelVariants}
        >
          {/* Header */}
          <motion.div
            className='p-3 border-b border-[#30363d] bg-gradient-to-r from-[#1a1f29] to-[#161b22]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    damping: 10,
                    stiffness: 200,
                    delay: 0.2
                  }}
                >
                  <div className='relative'>
                    <Avatar className='h-8 w-8 border-2 border-[#30363d] bg-[#0d1117]'>
                      <AvatarImage src='/ai-avatar.png' />
                      <AvatarFallback className='bg-[#1d2432] text-indigo-300'>AI</AvatarFallback>
                    </Avatar>
                    <span className='absolute bottom-0 right-0 h-2.5 w-2.5'>
                      <span className='absolute inset-0 rounded-full bg-cyan-500 opacity-50 animate-ping-slow'></span>
                      <span className='relative inline-flex h-full w-full rounded-full bg-cyan-500 border-2 border-[#161b22]'></span>
                    </span>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <h3 className='font-semibold text-gray-100'>Flow AI</h3>
                  <p className='text-xs text-gray-400'>Smart neural interface</p>
                </motion.div>
              </div>
              <motion.button
                onClick={onClose}
                className='p-1.5 rounded-full hover:bg-[#24292f] bg-black text-gray-400 hover:text-gray-300'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={2}
                  stroke='currentColor'
                  className='w-4 h-4'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className='flex-1 p-3 overflow-y-auto bg-[#0d1117] flex flex-col gap-3 scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent'
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.03) 0%, transparent 70%), radial-gradient(circle at 50% 100%, rgba(79, 70, 229, 0.03) 0%, transparent 70%)',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <motion.div
              className='flex items-start gap-2'
              initial='hidden'
              animate='visible'
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: {
                    type: 'spring',
                    damping: 25,
                    stiffness: 500,
                    delay: 0.4
                  }
                }
              }}
            >
              <Avatar className='h-8 w-8 mt-1 border-2 border-[#30363d] bg-[#0d1117]'>
                <AvatarImage src='/ai-avatar.png' />
                <AvatarFallback className='bg-[#1d2432] text-indigo-300'>AI</AvatarFallback>
              </Avatar>
              <div className='bg-[#1b222c] p-3 rounded-xl rounded-tl-none shadow-sm max-w-[80%] border border-[#30363d]'>
                <p className='text-sm text-gray-100'>
                  <AnimatedText text="Hello! I'm your AI assistant with advanced capabilities. How may I assist you today?" />
                </p>
              </div>
            </motion.div>

            {conversations.map((msg: any) => (
              <ChatMessage key={msg._id} message={msg} />
            ))}

            <AnimatePresence>
              {isTyping && (
                <motion.div
                  className='flex items-start gap-2'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar className='h-8 w-8 mt-1 border-2 border-[#30363d] bg-[#0d1117]'>
                    <AvatarImage src='/ai-avatar.png' />
                    <AvatarFallback className='bg-[#1d2432] text-indigo-300'>AI</AvatarFallback>
                  </Avatar>
                  <div className='bg-[#1b222c] p-3 rounded-xl rounded-tl-none shadow-sm border border-[#30363d]'>
                    <div className='flex gap-1'>
                      <motion.div
                        className='w-2 h-2 bg-indigo-500 rounded-full'
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0
                        }}
                      />
                      <motion.div
                        className='w-2 h-2 bg-blue-500 rounded-full'
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0.15
                        }}
                      />
                      <motion.div
                        className='w-2 h-2 bg-cyan-500 rounded-full'
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0.3
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input area */}
          <motion.div
            className='p-3 border-t border-[#30363d] bg-[#161b22]'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className='flex items-center gap-2'>
              <input
                ref={inputRef}
                type='text'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Ask me anything...'
                className='flex-1 p-2.5 bg-[#0d1117] border border-[#30363d] text-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-500'
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className='p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={2}
                  stroke='currentColor'
                  className='w-4 h-4'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
                  />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AIChatPanel
