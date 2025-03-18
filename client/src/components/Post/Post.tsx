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

export default function Post() {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  return (
    <div className='p-3 flex cursor-pointer border-b border-gray-700'>
      <div className='flex flex-col space-y-2 w-full'>
        <div className='flex'>
          <img
            src='https://yt3.ggpht.com/yti/ANjgQV_PS6nh-jE1ckvLMMhwg-P2yP8rzh7X3zLOavPLADaEGdI=s88-c-k-c0x00ffffff-no-rj'
            alt=''
            className='h-11 w-11 rounded-full mr-4'
          />

          <div className='text-[#6e767d]'>
            <div className='inline-block group justify-center items-center gap-1'>
              <div className='flex justify-center gap-1 items-center'>
                <h4 className='font-bold text-[15px] sm:text-base text-[#d9d9d9] group-hover:underline'>SonPham</h4>
                <span className='text-sm sm:text-[13px]'>@2k3sonpham@gmail.com</span>
              </div>

              <p className='text-[#d9d9d9] text-[15px] sm:text-base mt-0.5'>Ronaldo: Suiiiiiii !!!</p>
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
