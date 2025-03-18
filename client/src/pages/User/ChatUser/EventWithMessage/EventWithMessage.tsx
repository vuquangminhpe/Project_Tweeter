/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import conversationsApi from '@/apis/conversation.api'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useMutation } from '@tanstack/react-query'
import { Event_Message_Status } from '@/types/Emoji.types'
import { motion } from 'framer-motion'

interface Props {
  refetchChatData: () => void
  message_id: string | number
  content: string
  receiver: string
  totalPages: number
  isOwnMessage: boolean
  onStartEditing: (messageId: string | number, content: string) => void
}

export default function EventWithMessage({
  refetchChatData,
  message_id,
  content,
  receiver,
  totalPages,
  isOwnMessage,
  onStartEditing
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const setEmojiMessageInConversationMutation = useMutation({
    mutationFn: (selectedEmoji: string) => conversationsApi.setEmojiMessageInConversation(message_id, selectedEmoji),
    onSuccess: (data) => {
      console.log(data)
      refetchChatData()
    },
    onError: (error) => {
      console.log(error)
    }
  })

  const deleteMessageInConversationMutation = useMutation({
    mutationFn: () => conversationsApi.deleteMessageInConversation(message_id),
    onSuccess: (data) => {
      refetchChatData()
    },
    onError: (error) => {
      console.log(error)
    }
  })

  const handleEmojiSelect = async (emoji: string) => {
    await setEmojiMessageInConversationMutation.mutateAsync(emoji)
    setDropdownOpen(false)
  }

  const handleDeleteMessage = async () => {
    await deleteMessageInConversationMutation.mutateAsync()
    setDropdownOpen(false)
  }

  const emojiList = Object.values(Event_Message_Status).map((emoji) => ({
    icon: emoji.split('.')[0],
    number: emoji.split('.')[1]
  }))

  return (
    <div className='relative flex'>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <motion.button
            className='p-1.5 hover:bg-gray-700 rounded-full bg-black'
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-4 h-4 text-gray-400'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z'
              />
            </svg>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='min-w-[200px] rounded-xl shadow-xl p-1 bg-gray-800 border border-gray-700'
        >
          {isOwnMessage ? (
            <>
              <DropdownMenuItem
                className='flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 rounded-lg text-gray-100'
                onClick={() => {
                  onStartEditing(message_id, content)
                  setDropdownOpen(false)
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-4 h-4 text-indigo-400'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897Z'
                  />
                  <path d='M16.862 4.487L19.5 7.125' />
                </svg>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  handleDeleteMessage()
                }}
                className='flex items-center gap-2 px-3 py-2 text-sm text-red-400 cursor-pointer hover:bg-gray-700 rounded-lg'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-4 h-4'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'
                  />
                </svg>
                Delete
              </DropdownMenuItem>
            </>
          ) : (
            <div className='w-[200px]'>
              <div className='max-h-[200px] overflow-y-auto px-2 bg-gray-800'>
                <div className='grid grid-cols-5 gap-1'>
                  {emojiList.map((emoji, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleEmojiSelect(emoji.number)}
                      className='p-1.5 text-sm hover:bg-gray-700 rounded-md bg-black'
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {emoji.icon}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
