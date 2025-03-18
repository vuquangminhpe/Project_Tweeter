import { IoSparkles } from 'react-icons/io5'
import Input from './Input'
import { useState } from 'react'
import Post from '../Post'
function Feed() {
  const [activeTab, setActiveTab] = useState('For you')
  return (
    <div className='text-white flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[370px]'>
      <div
        className='text-[#d9d9d9] flex items-center sm:justify-between py-2 px-3 sticky top-0 z-50 
      bg-black border-b border-gray-700'
      >
        <h2 className='text-lg sm:text-xl font-bold'>Home</h2>
        <div className='hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0 ml-auto'>
          <IoSparkles />
        </div>
      </div>

      {/* Tabs */}
      <div className='flex items-center justify-center sticky top-0 z-50 bg-black border-b border-gray-700'>
        <div
          className={`relative flex-1 text-center py-3 cursor-pointer transition duration-300 ${
            activeTab === 'For you' ? 'text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-white'
          }`}
          onClick={() => setActiveTab('For you')}
        >
          For you
          {activeTab === 'For you' && (
            <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80px] border-b-4 border-[#1D9BF0]'></div>
          )}
        </div>
        <div
          className={`relative flex-1 text-center py-3 cursor-pointer transition duration-300 ${
            activeTab === 'Following' ? 'text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-white'
          }`}
          onClick={() => setActiveTab('Following')}
        >
          Following
          {activeTab === 'Following' && (
            <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80px] border-b-4 border-[#1D9BF0]'></div>
          )}
        </div>
      </div>

      <Input />
      <div className='pb-72'>
        <Post/>
        <Post/>
      </div>
    </div>
  )
}

export default Feed
