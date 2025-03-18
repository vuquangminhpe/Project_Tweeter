import React, { useState, useEffect, useRef } from 'react'
import storiesApi, { NewsFeedStory, StoryCommentRequest, StoryReactionRequest } from '@/apis/stories.api'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StoryDetailProps {
  stories: NewsFeedStory[];
  initialStoryIndex: number;
  onClose: () => void;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}

const CustomButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyle = "px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    ghost: "bg-transparent hover:bg-gray-700 text-gray-200"
  }
  
  return (
    <button 
      className={`${baseStyle} ${variantStyles[variant]} ${className || ''}`} 
      {...props}
    >
      {children}
    </button>
  )
}

const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "😡"]

const StoryDetail: React.FC<StoryDetailProps> = ({ 
  stories, 
  initialStoryIndex, 
  onClose,
  hasNextPage,
  fetchNextPage
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(initialStoryIndex)
  const [comment, setComment] = useState<string>('')
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reactions, setReactions] = useState<{ [storyId: string]: string[] }>({})
  const [comments, setComments] = useState<{ [storyId: string]: Array<{ username: string, content: string, user_avatar?: string }> }>({})

  // Get current story
  const currentStory = stories[currentStoryIndex]

  // Auto-fetch next page if needed
  useEffect(() => {
    const checkAndFetchNextPage = async () => {
      if (stories.length > 0 && currentStoryIndex >= stories.length - 2 && hasNextPage) {
        await fetchNextPage()
      }
    }
    
    checkAndFetchNextPage()
  }, [currentStoryIndex, stories.length, fetchNextPage, hasNextPage])

  // Handle navigation between stories
  const goToNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1)
    }
  }

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1)
    }
  }

  // Handlers for interaction
  const handleEmojiSelect = async (emoji: string) => {
    try {
      if (currentStory) {
        // Add to local state immediately for UI feedback
        setReactions(prev => {
          const storyReactions = [...(prev[currentStory._id] || []), emoji];
          return { ...prev, [currentStory._id]: storyReactions };
        });

        // Prepare API request
        const reactionRequest: StoryReactionRequest = {
          story_id: currentStory._id,
          reaction: emoji
        };

        // Call API
        await storiesApi.addStoryReaction(reactionRequest);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
    setShowEmojiPicker(false);
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim() !== '' && currentStory) {
      try {
        // Get user data from localStorage (similar to Chat component)
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');
        
        // Add to local state immediately for UI feedback
        const newComment = {
          username: profile?.name || 'User',
          content: comment,
          user_avatar: profile?.avatar
        };
        
        setComments(prev => {
          const storyComments = [...(prev[currentStory._id] || []), newComment];
          return { ...prev, [currentStory._id]: storyComments };
        });

        // Prepare API request
        const commentRequest: StoryCommentRequest = {
          story_id: currentStory._id,
          content: comment
        };

        // Call API
        await storiesApi.addStoryComment(commentRequest);
        
        // Clear input
        setComment('');
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  }

  const handleStoryClick = (index: number) => {
    setCurrentStoryIndex(index)
  }

  if (!currentStory) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div>Story not found</div>
      <button 
        className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        onClick={onClose}
      >
        Back to Stories
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 p-2 rounded-full"
        aria-label="Close story"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Sidebar with story list */}
      <div className="w-64 border-r border-gray-800 overflow-y-auto">
        <h2 className="text-xl font-bold p-4">Stories</h2>
        <div className="space-y-4 p-2">
          {stories.map((story, index) => (
            <div 
              key={story._id} 
              className={`flex items-center p-2 rounded-lg cursor-pointer ${index === currentStoryIndex ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              onClick={() => handleStoryClick(index)}
            >
              <Avatar className="h-10 w-10 mr-2">
                <AvatarImage src={story.user.avatar} alt={story.user.username} />
                <AvatarFallback className="bg-gray-700">
                  {(story.user.name || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-medium truncate">{story.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{story.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main story display area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col relative">
          {/* Story content */}
          <div className="flex-1 flex items-center justify-center bg-black">
            {currentStory.media_type === 'video' ? (
              <video 
                ref={videoRef}
                className="max-h-full max-w-full object-contain"
                src={currentStory.media_url} 
                controls 
                autoPlay 
              />
            ) : (
              <img 
                className="max-h-full max-w-full object-contain"
                src={currentStory.media_url} 
                alt={currentStory.caption || 'Story image'} 
              />
            )}
          </div>

          {/* User info and caption */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-2 border-2 border-blue-500">
                <AvatarImage src={currentStory.user.avatar} alt={currentStory.user.username} />
                <AvatarFallback className="bg-gray-700">
                  {(currentStory.user.name || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{currentStory.user.name}</p>
              </div>
            </div>
            {currentStory.caption && (
              <p className="mt-2 text-sm">{currentStory.caption}</p>
            )}
          </div>

          {/* Navigation buttons */}
          {currentStoryIndex > 0 && (
            <button
              onClick={goToPreviousStory}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 transition-colors p-2 rounded-full"
              aria-label="Previous story"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {currentStoryIndex < stories.length - 1 && (
            <button
              onClick={goToNextStory}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 transition-colors p-2 rounded-full"
              aria-label="Next story"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Interaction area */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            {/* Emoji reaction area */}
            <div className="flex items-center mb-4">
              <div className="relative">
                <button
                  className="text-xl p-2 bg-transparent hover:bg-gray-700 rounded transition-colors"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  😀
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 bg-gray-700 p-2 rounded-lg flex shadow-lg z-10">
                    {emojiOptions.map(emoji => (
                      <button
                        key={emoji}
                        className="p-2 text-xl hover:bg-gray-600 rounded"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="ml-2 flex">
                {/* Display reactions from API */}
                {currentStory.viewer?.map((viewer, idx) => 
                  viewer.view_status ? (
                    <span key={`api-${idx}`} className="mr-1">{viewer.view_status}</span>
                  ) : null
                )}
                {/* Display reactions added during this session */}
                {reactions[currentStory._id]?.map((reaction, idx) => (
                  <span key={`local-${idx}`} className="mr-1">{reaction}</span>
                ))}
              </div>
            </div>

            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} className="flex">
              <input
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <CustomButton type="submit" className="rounded-l-none">
                Send
              </CustomButton>
            </form>

            {/* Display comments */}
            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
              {/* Display comments from API */}
              {currentStory.viewer?.map((viewer, idx) => 
                viewer.content ? (
                  <div key={`api-${idx}`} className="flex items-start">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={viewer.user_avatar} />
                      <AvatarFallback>{viewer.username?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium text-sm">{viewer.username}</span>
                      <span className="block text-sm">{viewer.content}</span>
                    </div>
                  </div>
                ) : null
              )}
              
              {/* Display comments added during this session */}
              {comments[currentStory._id]?.map((comment, idx) => (
                <div key={`local-${idx}`} className="flex items-start">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={comment.user_avatar} />
                    <AvatarFallback>{comment.username?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium text-sm">{comment.username}</span>
                    <span className="block text-sm">{comment.content}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryDetail