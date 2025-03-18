import React, { useState } from 'react'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { motion, AnimatePresence } from 'framer-motion'
import AIButton from '../AIButton'

interface ChatInputProps {
  value: string
  setValue: (value: string) => void
  send: () => void
  inputRef: React.RefObject<HTMLInputElement>
  refetchChatData: () => void
}

const ChatInput = ({ value, setValue, send, inputRef }: ChatInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
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

  const toggleEmojiPicker = () => setShowEmojiPicker(!showEmojiPicker)

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // Framer Motion variants
  const emojiPickerVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <div className='p-3 sm:p-4 border-t border-[#30363d] bg-[#161b22]'>
      <div className='relative max-w-4xl mx-auto'>
        <div
          className={`absolute inset-0 rounded-xl ${isFocused ? 'ring-2 ring-indigo-500/50' : ''} transition-all duration-300`}
        ></div>

        <div className='relative flex items-center gap-2'>
          <input
            ref={inputRef}
            type='text'
            onChange={(e) => setValue(e.target.value)}
            value={value}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder='Type a message...'
            className='flex-1 p-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none text-gray-200 placeholder-gray-500 transition-all'
          />

          <div className='flex items-center gap-2'>
            <div className='relative'>
              <motion.button
                className='p-2.5 bg-[#1b222c] rounded-xl flex items-center justify-center hover:bg-[#24292f] bg-black text-gray-300'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleEmojiPicker}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='size-5'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z'
                  />
                </svg>
              </motion.button>

              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    className='absolute bottom-full right-0 mb-2 z-50'
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    variants={emojiPickerVariants}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className='bg-[#161b22] rounded-lg shadow-xl border border-[#30363d]'>
                      <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.DARK} lazyLoadEmojis={true} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AIButton />

            <motion.button
              type='submit'
              onClick={send}
              disabled={!value.trim()}
              className='p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed bg-black flex items-center justify-center'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={2}
                stroke='currentColor'
                className='size-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
