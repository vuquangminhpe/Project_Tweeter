import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { IoChatbox } from 'react-icons/io5'
import { GoTrash } from 'react-icons/go'
import { IoIosHeartEmpty } from 'react-icons/io'
import { IoIosHeart } from 'react-icons/io'
import { useState } from 'react'
import { IoMdShareAlt } from 'react-icons/io'
import { FaRegChartBar } from 'react-icons/fa'
import { GoBookmark } from 'react-icons/go'
import { GoBookmarkFill } from 'react-icons/go'
import { User } from '@/types/User.type'
import { Tweets } from '@/types/Tweet.type'
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { SuccessResponse } from '@/types/Utils.type'
import { useNavigate } from 'react-router-dom'
import { CommentRequest } from '@/types/Comments.type'
import { Media } from '@/types/Medias.type'
import VideoHLSPlayer from '../Customs/VideoHLSPlayer'
import bookmarksApi from '@/apis/bookmarks.api'

interface Props {
  profile: User | null
  data_length: number
  data: Tweets
  refetchAllDataTweet: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<AxiosResponse<SuccessResponse<Tweets[]>, any>, Error>>
}

const LIMIT = 5
const PAGE = 1

export default function Post({ profile, data, refetchAllDataTweet, data_length }: Props) {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const navigate = useNavigate()
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [loadingComment, setLoadingComment] = useState(false)
  const [loadingPage, setLoadingPage] = useState(PAGE)
  const [allComments, setAllComments] = useState<CommentRequest[]>([])
  const [edit, setEdit] = useState(false)

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
        <div className='flex'>
          <img
            onClick={() => navigate(`/user/profile/${profile?._id}`)}
            src={profile?.avatar}
            alt=''
            className='h-11 w-11 rounded-full mr-4'
          />

          <div className='text-[#6e767d]'>
            <div className='inline-block group justify-center items-center gap-1'>
              <div className='flex justify-center gap-1 items-center'>
                <h4 className='font-bold text-[15px] sm:text-base text-[#d9d9d9] group-hover:underline'>
                  {profile?.name}
                </h4>
                <span className='text-sm sm:text-[13px]'>{profile?.email}</span>
              </div>

              <p className='text-[#d9d9d9] text-[15px] sm:text-base mt-0.5'>{dataCustomTweet(0, 4)}</p>
            </div>
          </div>
          <div className='icon group flex-shrink-0 ml-auto'>
            <DotsHorizontalIcon className='h-5 text-[#6e7677d] group-hover:text-[#1d9bf0]' />
          </div>
        </div>

        <img
          className='rounded-2xl max-h-[700px] object-cover mr-2'
          src='https://scontent.fhan2-5.fna.fbcdn.net/v/t39.30808-6/484148525_122192061512252867_3726314799013185370_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFrxIeB7EJpjh9fTVFEvfjcV3pSSzvRdWFXelJLO9F1YZrbaiF-9RDajRKCOn_Q6yzlJ8IrYFmcjQmLdQvtx2xW&_nc_ohc=esQxRkhr-t0Q7kNvgE6932j&_nc_oc=Adh0H_dOw4rTC4iyz84S2fAd8-k4wm9o-Yw31QrjVeJ0y4uUC18RlPrRY9luSkWsI7s&_nc_zt=23&_nc_ht=scontent.fhan2-5.fna&_nc_gid=l70-Eu7z7STUiV-qCpol9A&oh=00_AYGZHN-nUBR9qjwvM-xqsjBhn2WlTh-MhIXsAMtyojE7rw&oe=67DE814B'
          alt=''
        />
        <div className='text-[#6e767d] flex justify-between w-10/12 mx-auto'>
          <div
            className='flex items-center space-x-1 group'
            onClick={(e) => {
              e.stopPropagation()
              setPostId(id)
              setIsOpen(true)
            }}
          >
            <div className='icon group-hover:bg-[#1d9bf0] group-hover:bg-opacity-10'>
              <IoChatbox className='h-5 group-hover:text-[#1d9bf0]' />
            </div>
            <span className='group-hover:text-[#1d9bf0] text-sm'>4</span>
          </div>
          <div
            className='flex items-center space-x-1 group'
            onClick={(e) => {
              e.stopPropagation()
              deleteDoc(doc(db, 'posts', id))
              router.push('/')
            }}
          >
            <div className='icon group-hover:bg-red-600/10'>
              <GoTrash className='h-5 group-hover:text-red-600' />
            </div>
          </div>

          <div className='flex items-center space-x-1 group' onClick={() => setLiked(!liked)}>
            <div className='icon group-hover:bg-pink-600/10'>
              {liked ? (
                <IoIosHeart className='h-5 text-pink-600' />
              ) : (
                <IoIosHeartEmpty className='h-5 group-hover:text-pink-600' />
              )}
            </div>
          </div>

          <div className='icon group' onClick={() => setBookmarked(!bookmarked)}>
            {bookmarked ? (
              <GoBookmark className='h-5 group-hover:text-[#1d9bf0]' />
            ) : (
              <GoBookmarkFill className='h-5 text-[#1d9bf0]' />
            )}
          </div>

          <div className='icon group'>
            <IoMdShareAlt className='h-5 group-hover:text-[#1d9bf0]' />
          </div>
          <div className='icon group'>
            <FaRegChartBar className='h-5 group-hover:text-[#1d9bf0]' />
          </div>
        </div>
      </div>
    </div>
  )
}
