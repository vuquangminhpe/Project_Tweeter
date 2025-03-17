import React, { useState } from 'react'

import EmojiPicker from 'emoji-picker-react'

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
        <>
          <svg className='size-12' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
            <defs>
              <linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='100%' gradientTransform='rotate(0)'>
                <stop offset='0%' stop-color='#4285f4'>
                  <animate
                    attributeName='stop-color'
                    values='#4285f4; #0F9D58; #F4B400; #DB4437; #4285f4'
                    dur='15s'
                    repeatCount='indefinite'
                  />
                </stop>
                <stop offset='100%' stop-color='#DB4437'>
                  <animate
                    attributeName='stop-color'
                    values='#DB4437; #4285f4; #0F9D58; #F4B400; #DB4437'
                    dur='15s'
                    repeatCount='indefinite'
                  />
                </stop>
                <animate
                  attributeName='gradientTransform'
                  values='rotate(0); rotate(360)'
                  dur='20s'
                  repeatCount='indefinite'
                />
              </linearGradient>

              <filter id='glow' x='-30%' y='-30%' width='160%' height='160%'>
                <feGaussianBlur stdDeviation='4' result='blur' />
                <feComposite in='SourceGraphic' in2='blur' operator='over' />
              </filter>
            </defs>

            <circle cx='100' cy='100' r='60' fill='url(#gradient)' opacity='0.2'>
              <animate attributeName='r' values='60; 65; 60' dur='3s' repeatCount='indefinite' />
            </circle>

            <g filter='url(#glow)'>
              <circle cx='100' cy='40' r='8' fill='url(#gradient)'>
                <animateTransform
                  attributeName='transform'
                  type='rotate'
                  from='0 100 100'
                  to='360 100 100'
                  dur='8s'
                  repeatCount='indefinite'
                />
              </circle>

              <circle cx='150' cy='100' r='6' fill='url(#gradient)'>
                <animateTransform
                  attributeName='transform'
                  type='rotate'
                  from='90 100 100'
                  to='450 100 100'
                  dur='6s'
                  repeatCount='indefinite'
                />
              </circle>

              <circle cx='100' cy='150' r='7' fill='url(#gradient)'>
                <animateTransform
                  attributeName='transform'
                  type='rotate'
                  from='180 100 100'
                  to='540 100 100'
                  dur='10s'
                  repeatCount='indefinite'
                />
              </circle>
            </g>

            <g
              fill='none'
              stroke='url(#gradient)'
              stroke-width='2.5'
              stroke-linecap='round'
              stroke-linejoin='round'
              filter='url(#glow)'
            >
              <path d='M 100,70 L 90,95 L 105,100 L 95,130' stroke-width='3'>
                <animate
                  attributeName='d'
                  values='M 100,70 L 90,95 L 105,100 L 95,130;
                M 100,68 L 88,93 L 107,98 L 93,132;
                M 100,70 L 90,95 L 105,100 L 95,130'
                  dur='3s'
                  repeatCount='indefinite'
                />
                <animate attributeName='opacity' values='0.9;1;0.9' dur='1.5s' repeatCount='indefinite' />
              </path>

              <path d='M 80,75 L 85,95 L 75,105 L 85,120' stroke-width='2'>
                <animate
                  attributeName='d'
                  values='M 80,75 L 85,95 L 75,105 L 85,120;
                M 78,73 L 83,97 L 72,107 L 83,123;
                M 80,75 L 85,95 L 75,105 L 85,120'
                  dur='2.7s'
                  repeatCount='indefinite'
                />
                <animate attributeName='opacity' values='0.7;1;0.7' dur='2s' repeatCount='indefinite' />
              </path>

              <path d='M 120,75 L 115,95 L 125,105 L 115,120' stroke-width='2'>
                <animate
                  attributeName='d'
                  values='M 120,75 L 115,95 L 125,105 L 115,120;
                M 122,73 L 117,97 L 128,107 L 117,123;
                M 120,75 L 115,95 L 125,105 L 115,120'
                  dur='2.5s'
                  repeatCount='indefinite'
                />
                <animate attributeName='opacity' values='0.7;1;0.7' dur='1.8s' repeatCount='indefinite' />
              </path>

              <circle cx='100' cy='70' r='3' fill='url(#gradient)' stroke='none'>
                <animate attributeName='r' values='2; 4; 2' dur='1s' repeatCount='indefinite' />
              </circle>

              <circle cx='90' cy='95' r='3' fill='url(#gradient)' stroke='none'>
                <animate attributeName='r' values='2; 3; 2' dur='0.7s' repeatCount='indefinite' />
              </circle>

              <circle cx='105' cy='100' r='3' fill='url(#gradient)' stroke='none'>
                <animate attributeName='r' values='2; 4; 2' dur='0.8s' repeatCount='indefinite' />
              </circle>

              <circle cx='95' cy='130' r='3' fill='url(#gradient)' stroke='none'>
                <animate attributeName='r' values='2; 3; 2' dur='0.9s' repeatCount='indefinite' />
              </circle>

              <path d='M 97,85 L 92,83' stroke-width='1.5'>
                <animate attributeName='opacity' values='0;1;0' dur='0.8s' repeatCount='indefinite' />
              </path>

              <path d='M 102,110 L 108,112' stroke-width='1.5'>
                <animate attributeName='opacity' values='0;1;0' dur='0.7s' repeatCount='indefinite' />
              </path>

              <path d='M 80,105 L 73,103' stroke-width='1.5'>
                <animate attributeName='opacity' values='0;1;0' dur='0.9s' repeatCount='indefinite' />
              </path>

              <path d='M 120,105 L 127,103' stroke-width='1.5'>
                <animate attributeName='opacity' values='0;1;0' dur='0.75s' repeatCount='indefinite' />
              </path>
            </g>

            <circle cx='100' cy='100' r='40' fill='none' stroke='url(#gradient)' stroke-width='1' opacity='0'>
              <animate attributeName='r' values='40; 80' dur='3s' repeatCount='indefinite' />
              <animate attributeName='opacity' values='0.8; 0' dur='3s' repeatCount='indefinite' />
            </circle>

            <circle cx='100' cy='100' r='2' fill='white'>
              <animate attributeName='cx' values='85; 80; 85; 100' dur='4s' repeatCount='indefinite' />
              <animate attributeName='cy' values='85; 100; 115; 100' dur='4s' repeatCount='indefinite' />
              <animate attributeName='opacity' values='0; 1; 1; 0' dur='4s' repeatCount='indefinite' />
            </circle>

            <circle cx='100' cy='100' r='2' fill='white'>
              <animate attributeName='cx' values='115; 120; 115; 100' dur='4s' begin='1s' repeatCount='indefinite' />
              <animate attributeName='cy' values='85; 100; 115; 100' dur='4s' begin='1s' repeatCount='indefinite' />
              <animate attributeName='opacity' values='0; 1; 1; 0' dur='4s' begin='1s' repeatCount='indefinite' />
            </circle>
          </svg>
        </>
        <button
          type='submit'
          onClick={send}
          disabled={!value.trim()}
          className='px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Send
        </button>
      </div>
    </div>
  )
}
export default ChatInput
