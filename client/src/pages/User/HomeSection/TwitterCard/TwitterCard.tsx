/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom'
import { GoVerified } from 'react-icons/go'
import { useMemo, useState } from 'react'
import { FaEllipsisH } from 'react-icons/fa'
import { BsChat } from 'react-icons/bs'
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md'
import { RiShare2Fill } from 'react-icons/ri'
import { RiBarChartGroupedLine } from 'react-icons/ri'
import { CiBookmark } from 'react-icons/ci'
import { User } from '@/types/User.type'
import { Tweets } from '@/types/Tweet.type'
import { useMutation, useQuery } from '@tanstack/react-query'
import likesApi from '@/apis/likes.api'
import { Likes } from '@/types/Likes.type'
import commentApi from '@/apis/comments.api'
import { Comment, CommentRequest } from '@/types/Comments.type'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  profile: User | null
  data: Tweets
}
const LIMIT = 10
const PAGE = 1
const TwitterCard = ({ profile, data }: Props) => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [likeModalOpen, setLikeModalOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const [idTweetComment, setIdTweetComment] = useState('')
  const [comment, setComment] = useState('')
  const createCommentMutation = useMutation({
    mutationFn: () => commentApi.createComment({ tweet_id: idTweetComment, commentContent: comment, commentLink: [] })
  })
  const { data: dataTweetComments, refetch } = useQuery({
    queryKey: ['dataTweetComments', data._id],
    queryFn: () => commentApi.getTweetComments(data?._id as string, LIMIT, PAGE)
  })
  const { data: dataLikes } = useQuery({
    queryKey: ['dataLikes', data._id],
    queryFn: () => likesApi.getLikesTweet(data._id as string)
  })

  const dataLike = useMemo(() => dataLikes?.data.result, [dataLikes])
  const dataComments = useMemo(() => dataTweetComments?.data?.results, [dataTweetComments])
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  const handleDeleteTweet = () => {
    console.log('Delete Tweet')
    toggleModal()
  }

  const handleEditTweet = () => {
    console.log('Edit Tweet')
    toggleModal()
  }

  const handleOpenReplyModal = () => {
    console.log('Open Reply Modal')
  }

  const handleLikeTweet = () => {
    setLiked(!liked)
    console.log(liked ? 'Unliked Tweet' : 'Liked Tweet')
  }

  const handleShareTweet = () => {
    console.log('Share Tweet')
  }
  const handleCreateComment = () => {
    createCommentMutation.mutate(undefined, {
      onSuccess: () => {
        refetch()
      },
      onError: () => {
        console.log('Error')
      }
    })
    refetch()
  }
  const handleViewAnalytics = () => {
    console.log('View Analytics')
  }
  const commentTime = (date: Date) => {
    const currentDate = new Date()
    const tweetDate = new Date(date)
    const diffTime = Math.abs(currentDate.getTime() - tweetDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.ceil(diffTime / (1000 * 60))
    if (diffDays > 0) {
      return `${diffDays}d`
    } else if (diffHours > 0) {
      return `${diffHours}h`
    } else {
      return `${diffMinutes}m`
    }
  }
  console.log(idTweetComment)

  return (
    <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden'>
      <div className='p-4 border-b border-gray-100'>
        <div className='flex space-x-4'>
          <div
            className='w-12 h-12 rounded-full overflow-hidden cursor-pointer ring-2 ring-blue-100 hover:ring-blue-300 transition'
            onClick={() => navigate(`/user/profile/${profile?._id}`)}
          >
            <Avatar className='w-full h-full'>
              <AvatarImage src={profile?.avatar} alt={profile?.name} className='object-cover' />
              <AvatarFallback className='bg-blue-100 text-blue-600'>
                {profile?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className='w-full'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-2'>
                <span className='text-base font-bold text-gray-800 hover:underline'>{profile?.name}</span>
                <span className='text-sm text-gray-500'>@{profile?.username || 'no user name'} · 2m</span>
                <GoVerified className='text-blue-500' />
              </div>
              <div className='relative'>
                {data?.user_id === profile?._id && (
                  <FaEllipsisH
                    className='text-gray-500 text-lg cursor-pointer hover:text-blue-500 transition'
                    onClick={toggleModal}
                  />
                )}
                {isModalOpen || (
                  <div className='absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-48 py-2 z-50'>
                    <ul>
                      <li
                        className='px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition'
                        onClick={handleDeleteTweet}
                      >
                        Delete
                      </li>
                      <li
                        className='px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition'
                        onClick={handleEditTweet}
                      >
                        Edit
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className='mt-3'>
              <div className='cursor-pointer'>
                <p className='text-gray-800 mb-3'>{data?.content}</p>
                <img
                  className='w-full max-h-96 object-cover rounded-xl'
                  src='https://anhtoc.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-2.webp'
                  alt='image-twitter'
                />
              </div>

              <div className='py-4 flex justify-between items-center text-gray-500'>
                <div
                  className='flex items-center space-x-2 hover:text-blue-500 transition group cursor-pointer'
                  onClick={() => {
                    setCommentModalOpen(!commentModalOpen)
                    setIdTweetComment(data._id as string)
                  }}
                >
                  <BsChat className='group-hover:text-blue-500' onClick={handleOpenReplyModal} />
                  <p>{(dataComments as any)?.comments.length}</p>
                </div>

                <div
                  className='flex items-center space-x-2 hover:text-red-500 transition group cursor-pointer'
                  onMouseEnter={() => setLikeModalOpen(true)}
                  onMouseLeave={() => setLikeModalOpen(false)}
                >
                  {liked ? (
                    <MdFavorite className='text-red-500 group-hover:text-red-600' onClick={handleLikeTweet} />
                  ) : (
                    <MdFavoriteBorder className='group-hover:text-red-500' onClick={handleLikeTweet} />
                  )}
                  <p>{(dataLike as unknown as Likes[])?.length}</p>

                  {likeModalOpen && (
                    <ScrollArea className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 max-h-64 bg-white rounded-lg shadow-lg border p-4 z-50 overflow-auto'>
                      <div>
                        <h4 className='mb-4 text-sm font-semibold text-gray-700'>Likes</h4>
                        {(dataLike as Likes[])?.map((like: Likes) => (
                          <div key={like._id} className='mb-2 pb-2 border-b last:border-b-0'>
                            <div className='flex items-center space-x-2'>
                              <Avatar className='w-8 h-8 bg-gray-400'>
                                <AvatarImage src={like.user_info.avatar} alt={like.user_info.username} />
                                <AvatarFallback>{like.user_info.username.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className='text-sm text-gray-800'>{like.user_info.username}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                <div className='flex items-center space-x-2 hover:text-blue-500 transition group cursor-pointer'>
                  <RiBarChartGroupedLine onClick={handleViewAnalytics} />
                  <p>54</p>
                </div>

                <div className='flex items-center space-x-4'>
                  <CiBookmark
                    className='cursor-pointer hover:text-blue-500 transition'
                    onClick={() => console.log('Bookmark Tweet')}
                  />
                  <RiShare2Fill className='cursor-pointer hover:text-blue-500 transition' onClick={handleShareTweet} />
                </div>
              </div>

              {commentModalOpen && (
                <div className='mt-4 space-y-3'>
                  {(dataComments as unknown as Comment)?.comments?.map((comment: CommentRequest) => (
                    <div key={comment?._id} className='flex items-start space-x-3 bg-gray-50 p-3 rounded-lg'>
                      <Avatar className='w-8 h-8 bg-gray-300'>
                        <AvatarImage src={comment.user_info.avatar} alt={comment.user_info.username} />
                        <AvatarFallback>{comment.user_info.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div className='w-full'>
                        <div className='flex items-center relative space-x-2'>
                          <span className='font-semibold text-sm text-gray-800'>{comment.user_info.username}</span>
                          <span className='text-xs text-gray-500'>{commentTime(comment.updatedAt)}</span>
                          <span className='right-0 absolute'>
                            {Number(new Date(comment.updatedAt).getTime()) -
                              Number(new Date(comment.createdAt).getTime()) <=
                            0
                              ? ''
                              : 'đã chỉnh sửa'}
                          </span>
                        </div>
                        <p className='text-sm text-gray-700 mt-1'>{comment?.commentContent}</p>
                      </div>
                    </div>
                  ))}
                  <div className='flex gap-4 items-center'>
                    <div className='w-full border-2 border-gray-400 focus:ring-2 rounded-2xl focus:ring-blue-200'>
                      <textarea
                        className='items-center p-1 w-full rounded-xl focus:outline-none'
                        placeholder='comment tweet .....'
                        onMouseEnter={(e) => {
                          setComment(e.currentTarget.value)
                          handleCreateComment()
                        }}
                        onChange={(e) => setComment(e.currentTarget.value)}
                      />
                    </div>
                    <div
                      onClick={handleCreateComment}
                      className='bg-blue-950 p-4 items-center text-center text-white rounded-xl cursor-pointer font-semibold'
                    >
                      Send
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwitterCard
