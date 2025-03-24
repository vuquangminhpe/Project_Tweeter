import { useState, useEffect, useCallback, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import storiesApi, { NewsFeedStory } from '@/apis/stories.api'
import { AppContext } from '@/Contexts/app.context'

interface UseStoriesOptions {
  limit?: number
  page?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

const useStories = (options: UseStoriesOptions = {}) => {
  const {
    limit = 10,
    page = 1,
    autoRefresh = false,
    refreshInterval = 60000 // 1 minute by default
  } = options

  const queryClient = useQueryClient()
  const { profile } = useContext(AppContext)

  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null)
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set())

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['news-feed-stories', limit, page],
    queryFn: () => storiesApi.getNewsFeedStories(limit, page),
    refetchOnWindowFocus: true,
    refetchInterval: autoRefresh ? refreshInterval : undefined,
    enabled: !!profile?._id // Only fetch if user is logged in
  })
  console.log(data?.data)

  const stories = data?.data?.result || []

  const viewStoryMutation = useMutation({
    mutationFn: storiesApi.viewStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feed-stories'] })
      refetch()
    }
  })

  const reactStoryMutation = useMutation({
    mutationFn: storiesApi.addStoryReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feed-stories'] })
      refetch()
    }
  })

  const createStoryMutation = useMutation({
    mutationFn: storiesApi.createStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feed-stories'] })
      refetch()
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

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return

    const intervalId = setInterval(() => {
      refetch()
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [autoRefresh, refreshInterval, refetch])

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
