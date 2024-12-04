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
import { useQuery } from '@tanstack/react-query'
import likesApi from '@/apis/likes.api'
import { Likes } from '@/types/Likes.type'
import commentApi from '@/apis/comments.api'
interface Props {
  profile: User | null
  data: Tweets
}
const LIMIT = 1
const PAGE = 1
const TwitterCard = ({ profile, data }: Props) => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [liked, setLiked] = useState(false)

  const { data: dataTweetComments } = useQuery({
    queryKey: ['dataTweetComments', data._id],
    queryFn: () => commentApi.getTweetComments(data?._id as string, LIMIT, PAGE)
  })
  const { data: dataLikes } = useQuery({
    queryKey: ['dataLikes', data._id],
    queryFn: () => likesApi.getLikesTweet(data._id as string)
  })
  console.log(data._id)

  const dataLike = useMemo(() => dataLikes?.data.data, [dataLikes])
  const dataComments = useMemo(() => dataTweetComments?.data?.data, [dataTweetComments])

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

  const handleViewAnalytics = () => {
    console.log('View Analytics')
  }

  return (
    <div>
      <div className='p-4 relative border-b border-gray-700'>
        <div className='flex space-x-5'>
          <div
            className='w-12 h-12 rounded-full overflow-hidden cursor-pointer'
            onClick={() => navigate(`/user/profile/${profile?._id}`)}
          ></div>
          <div className='w-full'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-2'>
                <span className='text-base font-semibold'>{profile?.name}</span>
                <span className='opacity-70 text-sm'>
                  @{profile?.username ? profile?.username : 'no user name'} · 2m
                </span>
                <GoVerified className='text-blue-500' />
              </div>
              <FaEllipsisH
                className='ml-2 text-gray-500 text-lg cursor-pointer hover:text-gray-400'
                onClick={toggleModal}
              />
            </div>

            {isModalOpen && (
              <div className='absolute top-10 right-0 bg-black border border-gray-700 shadow-lg rounded-lg w-48 py-2 z-50'>
                <ul className='space-y-1'>
                  <li
                    className='text-sm text-white px-4 py-2 cursor-pointer hover:bg-gray-800 rounded-md transition'
                    onClick={handleDeleteTweet}
                  >
                    Delete
                  </li>
                  <li
                    className='text-sm text-white px-4 py-2 cursor-pointer hover:bg-gray-800 rounded-md transition'
                    onClick={handleEditTweet}
                  >
                    Edit
                  </li>
                </ul>
              </div>
            )}

            <div className='mt-2'>
              <div className='cursor-pointer'>
                <p className='mb-2'>{data?.content}</p>
                <img
                  className='max-w-md h-auto rounded-xl'
                  src='https://anhtoc.vn/wp-content/uploads/2024/09/avatar-vo-tri-meo-2.webp'
                  alt='image-twitter'
                />
              </div>

              <div className='py-3 flex justify-between items-center text-gray-400'>
                <div className='flex items-center space-x-2'>
                  <BsChat className='cursor-pointer hover:text-blue-500' onClick={handleOpenReplyModal} />
                  <p>{(dataComments as any)?.tweets.length}</p>
                </div>

                <div className='flex items-center space-x-2'>
                  {liked ? (
                    <MdFavorite className='cursor-pointer text-red-500 hover:text-red-600' onClick={handleLikeTweet} />
                  ) : (
                    <MdFavoriteBorder className='cursor-pointer hover:text-red-500' onClick={handleLikeTweet} />
                  )}
                  <p>{(dataLike as unknown as Likes[])?.length}</p>
                </div>

                <div className='flex items-center space-x-2'>
                  <RiBarChartGroupedLine className='cursor-pointer hover:text-blue-500' onClick={handleViewAnalytics} />{' '}
                  <p>54</p>
                </div>

                <div className='flex items-center space-x-4'>
                  <CiBookmark
                    className='cursor-pointer hover:text-blue-500'
                    onClick={() => console.log('Bookmark Tweet')}
                  />
                  <RiShare2Fill className='cursor-pointer hover:text-blue-500' onClick={handleShareTweet} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwitterCard
