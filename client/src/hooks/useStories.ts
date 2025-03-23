import { useState, useEffect, useCallback, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AppContext } from '@/Contexts/app.context'
import storiesApi, { NewsFeedStory } from '@/apis/stories.api'
import { ViewerType } from '@/types/Stories.types'

interface UseStoriesOptions {
  limit?: number
  autoRefresh?: boolean
}

const useStories = (options: UseStoriesOptions = {}) => {
  const { limit = 10, autoRefresh = true } = options
  const { profile } = useContext(AppContext)
  const queryClient = useQueryClient()
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null)

  const {
    data: storiesData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['news-feed-stories', limit],
    queryFn: () => storiesApi.getNewsFeedStories(limit, 1),
    enabled: !!profile?._id,
    staleTime: 1000 * 60 * 2
  })

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(
      () => {
        refetch()
      },
      1000 * 60 * 2
    )

    return () => clearInterval(interval)
  }, [autoRefresh, refetch])

  const stories = storiesData?.data?.result.result
  const totalPages = storiesData?.data?.total_pages || 0

  const isStoryViewed = useCallback(
    (story: NewsFeedStory) => {
      if (!profile?._id || !story.viewer) return false

      return story.viewer.some((view: ViewerType) => view.viewer_id.includes(profile?._id as string))
    },
    [profile?._id]
  )

  const viewStoryMutation = useMutation({
    mutationFn: (data: { story_id: string; view_status: string; content: string }) => storiesApi.viewStory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feed-stories'] })
    }
  })

  const reactStoryMutation = useMutation({
    mutationFn: (data: { story_id: string; reaction: string }) => storiesApi.addStoryReaction(data),
    onSuccess: () => {
      toast.success('Reaction sent!')
      queryClient.invalidateQueries({ queryKey: ['news-feed-stories'] })
    },
    onError: () => {
      toast.error('Failed to send reaction')
    }
  })

  const commentStoryMutation = useMutation({
    mutationFn: (data: { story_id: string; content: string }) => storiesApi.addStoryComment(data),
    onSuccess: () => {
      toast.success('Comment sent!')
      queryClient.invalidateQueries({ queryKey: ['news-feed-stories'] })
    },
    onError: () => {
      toast.error('Failed to send comment')
    }
  })

  const deleteStoryMutation = useMutation({
    mutationFn: (storyId: string) => storiesApi.deleteStory(storyId),
    onSuccess: () => {
      toast.success('Story deleted')
      queryClient.invalidateQueries({ queryKey: ['news-feed-stories'] })
    },
    onError: () => {
      toast.error('Failed to delete story')
    }
  })

  const viewStory = useCallback(
    (storyId: string) => {
      if (!profile?._id) return

      viewStoryMutation.mutate({
        story_id: storyId,
        view_status: 'seen',
        content: ''
      })
    },
    [profile?._id, viewStoryMutation]
  )

  const reactToStory = useCallback(
    (storyId: string, reaction: string) => {
      if (!profile?._id) return

      reactStoryMutation.mutate({
        story_id: storyId,
        reaction
      })
    },
    [profile?._id, reactStoryMutation]
  )

  const commentOnStory = useCallback(
    (storyId: string, content: string) => {
      if (!profile?._id || !content.trim()) return

      commentStoryMutation.mutate({
        story_id: storyId,
        content: content.trim()
      })
    },
    [profile?._id, commentStoryMutation]
  )

  const deleteStory = useCallback(
    (storyId: string) => {
      if (!profile?._id) return

      deleteStoryMutation.mutate(storyId)
    },
    [profile?._id, deleteStoryMutation]
  )

  const viewNext = useCallback(() => {
    if (activeStoryIndex === null || !Number(stories?.length)) return

    if (activeStoryIndex < Number(stories?.length) - 1) {
      setActiveStoryIndex(activeStoryIndex + 1)
    } else {
      setActiveStoryIndex(null)
    }
  }, [activeStoryIndex, Number(stories?.length)])

  const viewPrevious = useCallback(() => {
    if (activeStoryIndex === null || !Number(stories?.length)) return

    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1)
    }
  }, [activeStoryIndex])

  const openViewer = useCallback(
    (index: number) => {
      if (index >= 0 && index < Number(Number(stories?.length))) {
        setActiveStoryIndex(index)
      }
    },
    [Number(stories?.length)]
  )

  const closeViewer = useCallback(() => {
    setActiveStoryIndex(null)
  }, [])

  const hasUnviewedStories = stories?.some((story) => !isStoryViewed(story))

  return {
    stories,
    isLoading,
    isError,
    error,
    refetch,
    totalPages,
    activeStoryIndex,
    hasUnviewedStories,
    isStoryViewed,
    viewStory,
    reactToStory,
    commentOnStory,
    deleteStory,
    viewNext,
    viewPrevious,
    openViewer,
    closeViewer
  }
}

export default useStories
