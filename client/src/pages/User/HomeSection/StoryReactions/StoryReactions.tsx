import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Send, Smile } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/Components/ui/button'

interface StoryReactionsProps {
  onReaction: (reaction: string) => void
  onComment: (comment: string) => void
  disabled?: boolean
}

const QUICK_REACTIONS = ['❤️', '👍', '👏', '😮', '😂', '😢']

const StoryReactions = ({ onReaction, onComment, disabled = false }: StoryReactionsProps) => {
  const [comment, setComment] = useState('')
  const [showReactions, setShowReactions] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)

  const handleQuickReaction = (reaction: string) => {
    onReaction(reaction)
    setShowReactions(false)
  }

  const handleSubmitComment = () => {
    if (comment.trim()) {
      onComment(comment)
      setComment('')
      setIsCommenting(false)
    }
  }

  return (
    <div className='relative z-[99999]'>
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0.6, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.6, y: 20 }}
            className='absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 z-10'
          >
            <div className='flex justify-around'>
              {QUICK_REACTIONS.map((reaction) => (
                <motion.button
                  key={reaction}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className='text-2xl cursor-pointer transition-transform'
                  onClick={() => handleQuickReaction(reaction)}
                >
                  {reaction}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCommenting && (
          <motion.div
            initial={{ opacity: 0.6, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.6, y: 20 }}
            className='absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 z-10'
          >
            <div className='flex items-center space-x-2'>
              <Avatar className='h-8 w-8 shrink-0'>
                <AvatarFallback className='bg-gradient-to-br from-indigo-400 to-purple-500 text-white'>
                  U
                </AvatarFallback>
              </Avatar>
              <input
                type='text'
                placeholder='Add a comment...'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className='flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                autoFocus
              />
              <Button
                size='sm'
                className='rounded-full'
                disabled={!comment.trim() || disabled}
                onClick={handleSubmitComment}
              >
                <Send className='h-4 w-4' />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='flex items-center justify-center space-x-4 p-2'>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className='p-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center'
          onClick={() => {
            setShowReactions(!showReactions)
            setIsCommenting(false)
          }}
          disabled={disabled}
        >
          <Heart className='h-6 w-6 text-white' />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className='p-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center'
          onClick={() => {
            setIsCommenting(!isCommenting)
            setShowReactions(false)
          }}
          disabled={disabled}
        >
          <MessageCircle className='h-6 w-6 text-white' />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className='p-2 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center'
          onClick={() => onReaction('👍')}
          disabled={disabled}
        >
          <Smile className='h-6 w-6 text-white' />
        </motion.button>
      </div>
    </div>
  )
}

export default StoryReactions
