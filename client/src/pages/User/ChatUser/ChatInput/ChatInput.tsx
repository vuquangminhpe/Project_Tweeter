import React, { useEffect, useRef, useState } from 'react'
import EmojiPicker from 'emoji-picker-react'
import Orb from '@/components/ui/orb'

interface ChatInputProps {
  value: string
  setValue: (value: string) => void
  send: () => void
  inputRef: React.RefObject<HTMLInputElement>
  refetchChatData: () => void
}

const ChatInput = ({ value, setValue, send, inputRef }: ChatInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

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

  return (
    <div className='p-2 sm:p-4 border-t border-gray-200'>
      <div className='flex items-center gap-2'>
        <input
          ref={inputRef}
          type='text'
          onChange={(e) => setValue(e.target.value)}
          value={value}
          onKeyPress={handleKeyPress}
          placeholder='Type a message...'
          className='flex-1 p-2 sm:p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition duration-300'
        />
        
      
        <div className='relative flex items-center justify-center w-8 h-8 flex-shrink-0'>
          <Orb
            hoverIntensity={0.3} 
            rotateOnHover={true}
            hue={120} 
            forceHoverState={false}
         
          />
        </div>

        {/* Emoji picker */}
        <div className='relative flex-shrink-0'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='size-8 bg-white rounded-xl p-1.5 cursor-pointer hover:bg-gray-100 transition duration-300'
            onClick={toggleEmojiPicker}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z'
            />
          </svg>
          {showEmojiPicker && (
            <div className='absolute bottom-full right-0 mb-2 z-10'>
              <div className='bg-white rounded-lg shadow-xl border border-gray-200'>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type='submit'
          onClick={send}
          disabled={!value.trim()}
          className='px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0'
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatInput