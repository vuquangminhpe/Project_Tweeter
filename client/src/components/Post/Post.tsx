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
      {/* <img
        className='h-11 w-11 rounded-full mr-4'
        src='https://yt3.ggpht.com/yti/ANjgQV_PS6nh-jE1ckvLMMhwg-P2yP8rzh7X3zLOavPLADaEGdI=s88-c-k-c0x00ffffff-no-rj'
        alt=''
      /> */}

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
          src='https://scontent.fhan15-2.fna.fbcdn.net/v/t39.30808-6/481223404_574787885608960_396293595374777721_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGAc6WiFEY44g-mZQQxwDN5UevGYgU6TIVR68ZiBTpMhXy0EeZxEj9D6o37JtJ5c3gPjzsO9vRjMYMJ5CHgpW7A&_nc_ohc=7UBIix14KZEQ7kNvgHGYp6I&_nc_oc=AdgzxSdJMJLqqB5U74BBXmyf4FTSZiFxilNhe8a9x1MxqD3QolZkVoGT8eYRIAeU6DIfa6jKXWfGIiZtawZKSzjw&_nc_zt=23&_nc_ht=scontent.fhan15-2.fna&_nc_gid=IpaGzkbgdsgfKjlqv5ysdg&oh=00_AYElD4gMXhpm9oLAUm7kVtmy-xuAvM8uU-fFE8EjZPQ2bg&oe=67DE24B7'
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
