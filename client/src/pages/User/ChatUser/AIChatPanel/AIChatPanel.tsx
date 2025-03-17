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
        <Avatar className='h-8 w-8 mt-1'>
          <AvatarImage src='/ai-avatar.png' />
          <AvatarFallback className='bg-indigo-600 text-white'>FL</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`p-3 rounded-xl shadow-sm max-w-[80%] ${
          isUser ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white rounded-tl-none'
        }`}
      >
        <p className='text-sm'>{isUser ? message.content : <AnimatedText text={message.content} />}</p>
      </div>
      {isUser && (
        <Avatar className='h-8 w-8 mt-1'>
          <AvatarImage src='https://github.com/shadcn.png' />
          <AvatarFallback>U</AvatarFallback>
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
          className='fixed bottom-16 right-16 w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200'
          initial='hidden'
          animate='visible'
          exit='exit'
          variants={panelVariants}
        >
          <motion.div
            className='p-3 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white'
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
                  <Avatar className='h-8 w-8 bg-white/10'>
                    <AvatarImage src='/ai-avatar.png' />
                    <AvatarFallback className='bg-indigo-600 text-white'>FL</AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <h3 className='font-semibold'>Flow Friend Assistant</h3>
                  <p className='text-xs text-white/80'>Always here to help</p>
                </motion.div>
              </div>
              <motion.button
                onClick={onClose}
                className='p-1 rounded-full hover:bg-white/20 transition-colors'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={2}
                  stroke='currentColor'
                  className='w-5 h-5'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          <div ref={chatContainerRef} className='flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col gap-3'>
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
              <Avatar className='h-8 w-8 mt-1'>
                <AvatarImage src='/ai-avatar.png' />
                <AvatarFallback className='bg-indigo-600 text-white'>AI</AvatarFallback>
              </Avatar>
              <div className='bg-white p-3 rounded-xl rounded-tl-none shadow-sm max-w-[80%]'>
                <p className='text-sm'>
                  <AnimatedText text="Hi there! I'm your AI assistant. How can I help you today?" />
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
                  <Avatar className='h-8 w-8 mt-1'>
                    <AvatarImage src='/ai-avatar.png' />
                    <AvatarFallback className='bg-indigo-600 text-white'>AI</AvatarFallback>
                  </Avatar>
                  <div className='bg-white p-3 rounded-xl rounded-tl-none shadow-sm'>
                    <div className='flex gap-1'>
                      <motion.div
                        className='w-2 h-2 bg-gray-400 rounded-full'
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0
                        }}
                      />
                      <motion.div
                        className='w-2 h-2 bg-gray-400 rounded-full'
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0.15
                        }}
                      />
                      <motion.div
                        className='w-2 h-2 bg-gray-400 rounded-full'
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

          <motion.div
            className='p-3 border-t border-gray-200 bg-white'
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
                className='flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className='p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={2}
                  stroke='currentColor'
                  className='w-5 h-5'
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
