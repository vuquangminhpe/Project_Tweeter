/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import conversationsApi from '@/apis/conversation.api'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useMutation } from '@tanstack/react-query'
import { Event_Message_Status } from '@/types/Emoji.types'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@radix-ui/react-hover-card'
import { useQueryClient } from '@tanstack/react-query'

interface Props {
  refetchChatData: () => void
  message_id: string | number
  content: string
  receiver: string
  totalPages: number
}

export default function EventWithMessage({ refetchChatData, message_id, content }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [newContent, setNewContent] = useState(content)
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
  const editMessageMutation = useMutation({
    mutationFn: (updatedContent: string) => conversationsApi.editMessageInConversation(message_id, updatedContent),
    onSuccess: (data) => {
      console.log(data)
      refetchChatData()
      setIsEditing(false)
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
  const handleEditMessage = async () => {
    try {
      await editMessageMutation.mutateAsync(newContent)
    } catch (error) {
      console.error('Error editing message:', error)
    }
  }

  const handleEmojiSelect = async (emoji: string) => {
    setEmojiMessageInConversationMutation.mutateAsync(emoji)
  }
  const handleDeleteMessage = async () => {
    deleteMessageInConversationMutation.mutateAsync()
  }
  const emojiList = Object.values(Event_Message_Status).map((emoji) => ({
    icon: emoji.split('.')[0],
    number: emoji.split('.')[1]
  }))

  const groupedEmojis = []
  for (let i = 0; i < emojiList.length; i += 10) {
    groupedEmojis.push(emojiList.slice(i, i + 10))
  }

  if (isEditing) {
    return (
      <div className='flex items-center gap-2'>
        <input
          type='text'
          defaultValue={content}
          onChange={(e) => {
            const value = e.target.value
            setNewContent(value)
          }}
          className='flex-1 p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button
          onClick={() => {
            setIsEditing(false)
            setNewContent(content)
          }}
          className='px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'
        >
          Cancel
        </button>
        <button
          onClick={handleEditMessage}
          className='px-3 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600'
        >
          Save
        </button>
      </div>
    )
  }

  return (
    <div className='relative flex'>
      <DropdownMenu>
        <DropdownMenuTrigger className='p-1 hover:bg-gray-100 rounded-full transition-colors'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-5 h-5 text-gray-600'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z'
            />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-[100px] rounded-xl shadow-xl flex p-1'>
          <DropdownMenuItem
            className='flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-lg'
            onClick={() => setIsEditing(true)}
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
                d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125'
              />
            </svg>
          </DropdownMenuItem>
          <DropdownMenuItem className='p-2'>
            <HoverCard>
              <HoverCardTrigger>
                {' '}
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='size-6'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z'
                  />
                </svg>
              </HoverCardTrigger>
              <HoverCardContent className='z-50'>
                <div className='max-h-64 overflow-y-auto w-72 rounded-xl shadow-lg bg-white'>
                  {groupedEmojis.map((row, rowIndex) => (
                    <div key={rowIndex} className='flex'>
                      {row.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiSelect(emoji.number)}
                          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                        >
                          {emoji.icon}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          </DropdownMenuItem>
          <DropdownMenuItem className='flex items-center z-10 gap-2 px-3 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-50 rounded-lg'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-4 h-4'
              onClick={handleDeleteMessage}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'
              />
            </svg>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
