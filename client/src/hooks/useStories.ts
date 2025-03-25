import { useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import storiesApi, { NewsFeedStory } from '@/apis/stories.api'
import { toast } from 'sonner'

interface UseStoriesOptions {
  limit?: number
  page?: number
}

const useStories = (options: UseStoriesOptions = {}) => {
  const { limit = 10, page = 1 } = options

  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null)
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set())

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['news-feed-stories', limit, page],
    queryFn: () => storiesApi.getNewsFeedStories(limit, page)
  })

  const stories = data?.data?.result || []

  const viewStoryMutation = useMutation({
    mutationFn: storiesApi.viewStory,
    onSuccess: () => {
      toast.success('Story viewed successfully')
      refetch()
    },
    onError: () => {
      toast.error('Error viewing story')
    }
  })

  const reactStoryMutation = useMutation({
    mutationFn: storiesApi.addStoryReaction,
    onSuccess: () => {
      toast.success('Story reacted successfully')
      refetch()
    },
    onError: () => {
      toast.error('Error reacted story')
    }
  })

  const createStoryMutation = useMutation({
    mutationFn: storiesApi.createStory,
    onSuccess: () => {
      toast.success('Story created successfully')
      refetch()
    },
    onError: () => {
      toast.error('Error created story')
    }
  })

  const isStoryViewed = useCallback(
    (story: NewsFeedStory) => {
      if (!story?._id) return false

      if (viewedStories.has(story._id)) return true

      return story.viewer?.some((view) => view.view_status === 'seen') || false
    },
    [viewedStories]
  )

  const openViewer = useCallback((index: number) => {
    setActiveStoryIndex(index)
  }, [])

  const closeViewer = useCallback(() => {
    setActiveStoryIndex(null)
  }, [])

  const markStoryAsViewed = useCallback(
    (storyId: string) => {
      if (!storyId) return

      setViewedStories((prev) => {
        const newSet = new Set(prev)
        newSet.add(storyId)
        return newSet
      })

      viewStoryMutation.mutate({
        story_id: storyId,
        view_status: 'seen',
        content: ''
      })
    },
    [viewStoryMutation]
  )

  const refreshStories = useCallback(() => {
    refetch()
  }, [refetch])

  return {
    stories,
    isLoading,
    error,
    refetch: refreshStories,
    isStoryViewed,
    openViewer,
    closeViewer,
    activeStoryIndex,
    markStoryAsViewed,
    viewStoryMutation,
    reactStoryMutation,
    createStoryMutation
  }
}

export default useStories
