/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom'
import { GoVerified } from 'react-icons/go'
import { useContext, useEffect, useMemo, useState } from 'react'
import { FaEllipsisH } from 'react-icons/fa'
import { BsChat } from 'react-icons/bs'
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md'
import { RiShare2Fill } from 'react-icons/ri'
import { RiBarChartGroupedLine } from 'react-icons/ri'
import { FaBookmark } from 'react-icons/fa'
import { Profile, User } from '@/types/User.type'
import { Tweets } from '@/types/Tweet.type'
import { keepPreviousData, QueryObserverResult, RefetchOptions, useMutation, useQuery } from '@tanstack/react-query'
import likesApi from '@/apis/likes.api'
import { Likes } from '@/types/Likes.type'
import commentApi from '@/apis/comments.api'
import { Comment, CommentRequest } from '@/types/Comments.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import tweetsApi from '@/apis/tweets.api'
import { AxiosResponse } from 'axios'
import { SuccessResponse } from '@/types/Utils.type'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import bookmarksApi from '@/apis/bookmarks.api'
import { Bookmark } from '@/types/Bookmarks.type'
import { Media } from '@/types/Medias.type'
import VideoHLSPlayer from '@/components/Customs/VideoHLSPlayer'
import EditTweet from '../EditTweet'
import { CiTrash } from 'react-icons/ci'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import ImageViewerTweet from '../ImageViewer'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { AppContext } from '@/Contexts/app.context'
import apiUser from '@/apis/users.api'
import useNotifications from '@/components/Customs/Notification/useNotifications/useNotifications'
import { ActionType } from '@/types/Notifications.types'

interface Props {
  data_length: number
  data: Tweets
  refetchAllDataTweet: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<AxiosResponse<SuccessResponse<Tweets[]>, any>, Error>>
}
// định nghĩa các hằng số
// đọc các comment ở dưới để hiểu rõ hơn (cấm viết khác để debug code dễ hơn )
const LIMIT = 5
const PAGE = 1
const TwitterCard = ({ data, refetchAllDataTweet, data_length }: Props) => {
  const navigate = useNavigate()
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [loadingComment, setLoadingComment] = useState(false)
  const [loadingPage, setLoadingPage] = useState(PAGE)
  const [allComments, setAllComments] = useState<CommentRequest[]>([])
  const [edit, setEdit] = useState(false)
  const { profile } = useContext(AppContext)
  const { createNotification } = useNotifications({ userId: profile?._id || '' })

  // khu vực data Query => chỉ viết data Query ở đây
  const { data: dataBookmark, refetch: refetchDataBookmark } = useQuery({
    queryKey: ['dataBookmark'],
    queryFn: () => bookmarksApi.getBookmarks()
  })
  const { data: dataTweetComments, refetch: refetchDataComment } = useQuery({
    queryKey: ['dataTweetComments', data._id, loadingPage],
    queryFn: () => commentApi.getTweetComments(data?._id as string, LIMIT, loadingPage),
    placeholderData: keepPreviousData
  })
  const { data: dataLikes, refetch: refetchDataLikes } = useQuery({
    queryKey: ['dataLikes', data._id],
    queryFn: () => likesApi.getLikesTweet(data._id as string)
  })

  const { data: dataUser } = useQuery({
    queryKey: ['dataUser', data.user_id],
    queryFn: () => apiUser.getProfileById(data.user_id)
  })

  // console.log(dataUser?.data?.name);

  // khu vực action bằng mutation => chi viết action ở đây
  const handleDeletedMutation = useMutation({
    mutationFn: (tweet_id: string) => tweetsApi.deleteTweet(tweet_id)
  })
  const handleLikeTweetMutation = useMutation({
    mutationFn: (tweet_id: string) => likesApi.likeTweet(tweet_id)
  })
  const handleUnlikeTweetMutation = useMutation({
    mutationFn: (tweet_id: string) => likesApi.unlikeTweet(tweet_id)
  })
  const createCommentMutation = useMutation({
    mutationFn: (idTweetComment: string) =>
      commentApi.createComment({ tweet_id: idTweetComment, commentContent: comment, commentLink: [] })
  })
  const bookmarksTweetMutation = useMutation({
    mutationFn: (tweet_id: string) => bookmarksApi.bookmarkTweet(tweet_id)
  })
  const unBookmarksTweetMutation = useMutation({
    mutationFn: (tweet_id: string) => bookmarksApi.unBookmarkTweet(tweet_id)
  })
  const deleteCommentMutation = useMutation({
    mutationFn: (tweet_id: string) => commentApi.deleteComment(tweet_id)
  })
  // khu vực data Query => chỉ viết data Query ở đây (mặc định dùng useMemo để ko bị tính toán lại data)
  const dataBookmarks = useMemo(() => dataBookmark?.data?.data, [dataBookmark])
  const dataLike = useMemo(() => dataLikes?.data.result, [dataLikes])
  const dataComments = useMemo(() => dataTweetComments?.data?.results, [dataTweetComments])
  useEffect(() => {
    if (loadingComment) {
      setLoadingComment(false)
    }
  }, [loadingComment])
  useEffect(() => {
    if (dataComments) {
      const newComments = (dataComments as unknown as Comment).comments

      setAllComments((prev) => {
        if (loadingPage === null || loadingPage === (dataComments as unknown as Comment).total_pages) {
          return [...newComments]
        }
        return [...prev, ...newComments]
      })
      setLoadingPage((dataComments as unknown as Comment).page)
    }
  }, [dataComments, loadingPage])
  // khu vực handle action => chỉ viết handle action ở đây
  const handleDeleteTweet = async (tweet_id: string) => {
    handleDeletedMutation.mutateAsync(tweet_id, {
      onSuccess: (res) => {
        console.log(res)
        refetchAllDataTweet()
      },
      onError: () => {
        toast.error('Delete Tweet Fail')
      }
    })
  }
  const handleUnLikesTweet = async (tweet_id: string) => {
    handleUnlikeTweetMutation.mutateAsync(tweet_id, {
      onSuccess: () => {
        refetchDataLikes()
        refetchAllDataTweet()
        createNotification({
          recipientId: dataUser?.data?._id as unknown as string,
          actionType: ActionType.UNLIKE,
          targetId: [profile?._id as string],
          content: `${profile?.name} unliked your tweet`
        })
      },
      onError: () => {
        toast.error('Delete Tweet Fail')
      }
    })
  }

  const handleLikeTweet = async (tweet_id: string) => {
    handleLikeTweetMutation.mutateAsync(tweet_id, {
      onSuccess: () => {
        refetchDataComment()
        refetchDataLikes()
      },
      onError: () => {
        console.log('Error')
      }
    })
  }

  const handleShareTweet = () => {
    console.log('Share Tweet')
  }
  const handleCreateComment = (idTweetComment: string) => {
    createCommentMutation.mutate(idTweetComment, {
      onSuccess: () => {
        setComment('')
        refetchDataComment()
        createNotification({
          recipientId: dataUser?.data?._id as unknown as string,
          actionType: ActionType.COMMENT,
          targetId: [profile?._id as string],
          content: `${profile?.name} comment your tweet`
        })
      },
      onError: () => {
        console.log('Error')
      }
    })
    refetchDataComment()
  }
  const handleBookmarksTweet = async (tweet_id: string) => {
    bookmarksTweetMutation.mutateAsync(tweet_id, {
      onSuccess: () => {
        refetchDataBookmark()
        createNotification({
          recipientId: dataUser?.data?._id as unknown as string,
          actionType: ActionType.BOOKMARK,
          targetId: [profile?._id as string],
          content: `${profile?.name} bookmark your tweet`
        })
      },
      onError: () => {
        toast.error('Bookmarks Tweet Fail')
      }
    })
  }
  const handleUnBookmarksTweet = async (tweet_id: string) => {
    unBookmarksTweetMutation.mutateAsync(tweet_id, {
      onSuccess: () => {
        refetchDataBookmark()
        createNotification({
          recipientId: dataUser?.data?._id as unknown as string,
          actionType: ActionType.UNBOOKMARK,
          targetId: [profile?._id as string],
          content: `${profile?.name} un bookmark your tweet`
        })
      },
      onError: () => {
        toast.error('UnBookmarks Tweet Fail')
      }
    })
  }

  const handleDeleteComment = async (comment_id: string) => {
    deleteCommentMutation.mutateAsync(comment_id, {
      onSuccess: () => {
        toast.success('Delete Comment Success')
        refetchDataComment()
        createNotification({
          recipientId: dataUser?.data?._id as unknown as string,
          actionType: ActionType.COMMENT,
          targetId: [profile?._id as string],
          content: `${profile?.name} delete comments your tweet`
        })
      },
      onError: () => {
        toast.error('Delete Comment Fail')
      }
    })
  }
  const dataCustomTweet = (a?: number, b?: number) => {
    return (
      <div className='cursor-pointer w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-full'>
        {data?.medias?.slice(a, b).map((media: Media) => (
          <div key={media.url} className='w-full flex justify-center'>
            {!media.url.endsWith('master.m3u8') && (
              <img
                className='w-full max-w-full mb-2 h-auto max-h-56 object-cover rounded-xl 
                  transition-transform duration-300 hover:scale-105'
                src={media.url}
                alt='image-twitter'
              />
            )}
            {media.url.endsWith('master.m3u8') && (
              <div className='relative w-full max-h-64'>
                <VideoHLSPlayer
                  src={media.url}
                  classNames='w-full h-full rounded-xl object-cover 
                    transition-transform duration-300 hover:scale-105'
                />
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }
  // khu vực custom data => chỉ viết custom data ở đây
  const userLike = dataLike?.filter((like) => like.user_info.username === profile?.username)
  const filterBookmark = dataBookmarks?.filter((bookmark) => bookmark.tweet_id === data._id)

  // khu vực custom function => chỉ viết custom function ở đây
  const commentTime = (date: Date) => {
    const currentDate = new Date()
    const tweetDate = new Date(date)
    const diffTime = Math.abs(currentDate.getTime() - tweetDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffDays > 0) {
      return `${diffDays}d`
    } else if (diffHours > 0) {
      return `${diffHours}h`
    } else {
      return `${diffMinutes}m`
    }
  }

  return (
    <div className='p-3 flex cursor-pointer border-b border-gray-700'>
      <div className='flex flex-col space-y-2 w-full'>
        <div className='flex space-x-4'>
          <Avatar className='mx-4 h-11 w-11 rounded-full cursor-pointer'>
            <AvatarImage src={dataUser?.data?.avatar as any} alt={dataUser?.data?.name as any} />
            <AvatarFallback className='bg-gradient-to-r from-violet-200 to-indigo-200 text-indigo-600'>
              {(dataUser?.data?.name as any)?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className='w-full'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-2'>
                <span className='font-bold text-[15px] sm:text-base text-[#d9d9d9] group-hover:underline'>
                  {dataUser?.data?.name as any}
                </span>
                <span className='text-sm text-gray-500'>
                  @{dataUser?.data?.username || ('no user name' as any)} · {commentTime(data?.updated_at as Date)}
                </span>
                <GoVerified className='text-blue-500' />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  {data?.user_id === profile?._id && (
                    <div>
                      ...
                    </div>
                  )}
                </PopoverTrigger>
                <PopoverContent className='flex gap-5 justify-around max-w-44 bg-gray-800 text-white rounded-xl shadow-xl'>
                  <div
                    onClick={() => setEdit(true)}
                    className='cursor-pointer font-semibold hover:bg-gray-700 transition-all px-3 py-1 rounded-xl'
                  >
                    Edit
                  </div>
                  <div
                    onClick={() => handleDeleteTweet(data?._id as string)}
                    className='cursor-pointer font-semibold hover:bg-gray-700 px-3 py-1 rounded-xl'
                  >
                    Delete
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {edit ? (
              <EditTweet setEdit={setEdit} profile={profile} data={data} refetchAllDataTweet={refetchAllDataTweet} />
            ) : (
              <div className='mt-3'>
                <p className='text-gray-300 mb-3 w-full'>{data?.content}</p>
                <p className='text-gray-300 mb-3 w-full'>
                  {data?.hashtag_info?.map((nameHashtag: any, index: number) => (
                    <div className='text-blue-500 cursor-pointer' key={index}>
                      {'#' + nameHashtag.name + ' '}
                    </div>
                  ))}
                </p>

                {data_length <= 4 ? (
                  dataCustomTweet(0, 4)
                ) : (
                  <AlertDialog>
                    {dataCustomTweet(0, 4)}
                    <div className='relative'>
                      {dataCustomTweet(4, 5)}

                      <div className='absolute inset-0 flex items-center justify-center'>
                        <AlertDialogTrigger className='absolute inset-0 z-10 flex items-center justify-center bg-black/50 cursor-pointer hover:bg-black/60 transition-all duration-300'>
                          <span className='text-white text-2xl font-bold'>+{data.medias.length - 4}</span>
                        </AlertDialogTrigger>
                      </div>

                      <AlertDialogContent className='container rounded-lg shadow-xl'>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Media Gallery</AlertDialogTitle>
                          <div className='w-full p-4'>
                            <ImageViewerTweet data={data} />
                          </div>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </div>
                  </AlertDialog>
                )}

                <div className='py-4 flex justify-between items-center text-gray-500'>
                  <div
                    className='flex items-center space-x-2 hover:text-blue-500 transition group cursor-pointer'
                    onClick={() => {
                      setCommentModalOpen(!commentModalOpen)
                    }}
                  >
                    <BsChat className='group-hover:text-blue-500' />
                    <p>{(dataComments as any)?.comments?.length}</p>
                  </div>
                  <ContextMenu>
                    <ContextMenuTrigger>
                      {' '}
                      <div className='flex items-center space-x-2 hover:text-red-500 transition group cursor-pointer'>
                        {Number(userLike?.length) > 0 ? (
                          <MdFavorite
                            className='text-red-500 group-hover:text-red-600'
                            onClick={() => handleUnLikesTweet(data?._id as string)}
                          />
                        ) : (
                          <MdFavoriteBorder
                            className='group-hover:text-red-500'
                            onClick={() => handleLikeTweet(data?._id as string)}
                          />
                        )}
                        <p>{(dataLike as unknown as Likes[])?.length}</p>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className='max-w-44 translate-x-2 -translate-y-12 overflow-y-auto rounded-xl bg bg-slate-300 shadow-xl'>
                      <ContextMenuItem>
                        <ScrollArea>
                          <h4 className='mb-4 text-sm font-semibold text-gray-700'>Likes</h4>
                          {(dataLike as Likes[])?.map((like: Likes) => (
                            <div key={like._id} className='mb-2 pb-2 border-b last:border-b-0'>
                              <div className='flex items-center space-x-2'>
                                <Avatar className='w-8 h-8 bg-gray-400'>
                                  <AvatarImage src={like.user_info.avatar} alt={like.user_info.username} />
                                  <AvatarFallback>{like.user_info.username.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className='text-sm text-gray-700'>{like.user_info.username}</span>
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>

                  <div className='flex items-center space-x-2 hover:text-blue-500 transition group cursor-pointer'>
                    <RiBarChartGroupedLine />
                    <p>{Number(data?.guest_views) + Number(data?.user_views)}</p>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <FaBookmark
                      className={`cursor-pointer hover:text-blue-500 transition ${
                        (filterBookmark as Bookmark[])?.length > 0 ? 'text-blue-500' : 'text-gray-500'
                      }`}
                      onClick={() =>
                        (filterBookmark as Bookmark[])?.length === 0
                          ? handleBookmarksTweet(data?._id as string)
                          : handleUnBookmarksTweet(data?._id as string)
                      }
                    />

                    <RiShare2Fill
                      className='cursor-pointer hover:text-blue-500 transition'
                      onClick={handleShareTweet}
                    />
                  </div>
                </div>

                {commentModalOpen && (
                  <div className='mt-4 space-y-3 border-t border-gray-700'>
                    {(allComments as unknown as CommentRequest[])?.map((comment: CommentRequest) => (
                      <div key={comment?._id} className='p-3 flex cursor-pointer border-b border-gray-700'>
                        <Avatar className='w-8 h-8 bg-gray-300'>
                          <AvatarImage src={comment.user_info.avatar} alt={comment.user_info.username} />
                          <AvatarFallback>{comment.user_info.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        <div className='w-full'>
                          <div className='flex justify-between'>
                            <div className='flex items-center relative space-x-2 mx-2' style={{ marginBottom: '10px' }}>
                              <span className='font-semibold text-sm text-gray-500'>{comment.user_info.username}</span>
                              <span className='text-xs text-gray-500'>{commentTime(comment.updatedAt)}</span>
                              <span className='right-0 absolute'>
                                {Number(new Date(comment.updatedAt).getTime()) -
                                  Number(new Date(comment.createdAt).getTime()) <=
                                0
                                  ? ''
                                  : 'đã chỉnh sửa'}
                              </span>
                            </div>
                            <Popover>
                              <PopoverTrigger asChild>
                                {data?.user_id === profile?._id && (
                                  <DotsHorizontalIcon
                                    role='button'
                                    tabIndex={0}
                                    className='h-5 text-[#6e7677] group-hover:text-[#1d9bf0] cursor-pointer hoverAnimation'
                                  />
                                )}
                              </PopoverTrigger>
                              <PopoverContent className='flex gap-5 justify-around max-w-44 bg-slate-100 rounded-xl shadow-xl'>
                                {/* <div className='cursor-pointer font-semibold hover:bg-gray-600 transition-all px-3 py-1 rounded-xl'>
                                  Edit
                                </div> */}
                                <div
                                  onClick={() => handleDeleteComment(comment?._id as string)}
                                  className='cursor-pointer font-semibold hover:bg-gray-600 px-3 py-1 rounded-xl'
                                >
                                  Delete
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <p className='text-gray-300 mb-3 w-full'>{comment?.commentContent}</p>
                        </div>
                      </div>
                    ))}
                    {loadingPage < (dataComments as any)?.total_pages ? (
                      <div
                        className='text-blue-500 font-semibold py-2 cursor-pointer'
                        onClick={() => {
                          setLoadingComment(true)

                          if (loadingPage <= (dataComments as any)?.total_pages) {
                            return setLoadingPage((prev) => prev + 1)
                          }
                          refetchDataComment()
                        }}
                      >
                        Load more comment....
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className='flex gap-4 items-center'>
                      <div className='w-full pt-2 '>
                        <textarea
                          className='bg-transparent outline-none 
            text-[#d9d9d9] text-lg placeholder-gray-500 tracking-wide w-full min-h-[50px] overflow-hidden'
                          placeholder='Comment tweet .....'
                          onChange={(e) => setComment(e.currentTarget.value)}
                        />
                      </div>
                      <div
                        onClick={() => handleCreateComment(data?._id as string)}
                        className='mx-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2 rounded-lg
                  font-medium hover:from-violet-700 hover:to-indigo-700 transition-colors duration-200 
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-70'
                      >
                        Send
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwitterCard
