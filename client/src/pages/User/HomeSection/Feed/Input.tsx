import { XIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { IoMdPhotos } from 'react-icons/io'
import { HiChartBar } from 'react-icons/hi'
import { BsEmojiKissFill } from 'react-icons/bs'
import { FaRegCalendarCheck } from 'react-icons/fa6'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { FaUserTag } from "react-icons/fa";

function Input() {
  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState()
  const filePickerRef = useRef(null)
  const [showEmoji, setShowEmoji] = useState(false)

  const addEmoji = (e: { unified: string }) => {
    const sym = e.unified.split('-')
    const codesArray = sym.map((el) => `0x${el}`)
    const emoji = String.fromCodePoint(...codesArray)
    setInput(input + emoji)
  }

  const addImageToPost = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setSelectedFile(imageUrl)
    }
  }

  return (
    <div className={`border-b border-gray-700 p-3 flex space-x-3`}>
      <img
        src='https://yt3.ggpht.com/yti/ANjgQV_PS6nh-jE1ckvLMMhwg-P2yP8rzh7X3zLOavPLADaEGdI=s88-c-k-c0x00ffffff-no-rj'
        alt=''
        className='h-11 w-11 rounded-full cursor-pointer'
      />
      <div className='w-full divide-y divide-gray-700'>
        <div className={``}>
          <textarea
            onChange={(e) => setInput(e.target.value)}
            placeholder="What's happening?"
            value={input}
            rows={2}
            className='bg-transparent outline-none 
            text-[#d9d9d9] text-lg placeholder-gray-500 tracking-wide w-full min-h-[50px] overflow-hidden'
          />
          {selectedFile && (
            <div className='relative'>
              <div
                className='absolute w-8 h-8 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer'
                onClick={() => setSelectedFile(null)}
              >
                <XIcon className='text-white h-5' />
              </div>
              <img src={selectedFile} alt='' className='rounded-2xl max-h-80 object-contain my-4' />
            </div>
          )}
        </div>

        <div className='flex items-center justify-between pt-2.5'>
          <div className='flex items-center'>
            <div className='icon cursor-pointer' onClick={() => filePickerRef.current?.click()}>
              <IoMdPhotos className='h-[22px] text-[#1d9bf0]' />
              <input type='file' onChange={addImageToPost} ref={filePickerRef} hidden />
            </div>
            <div className='icon rotate-90'>
              <HiChartBar className='h-[22px] text-[#1d9bf0]' />
            </div>
            <div className='icon'>
              <FaUserTag className='h-[22px] text-[#1d9bf0]' />
            </div>
            <div className='icon'>
              <BsEmojiKissFill onClick={() => setShowEmoji(!showEmoji)} className='h-[22px] text-[#1d9bf0]' />
            </div>
            <div className='icon'>
              <FaRegCalendarCheck className='h-[22px] text-[#1d9bf0]' />
            </div>
          </div>
          <button
            className='bg-[#1d9bf0] text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-[#1a8cd8]
           disabled:hover:bg-[1d9bf0] disabled:opacity-50 disabled:cursor-default'
            disabled={!input.trim() && !selectedFile}
          >
            Tweet
          </button>
        </div>
        {showEmoji && (
          <div className='relative'>
            <Picker
              theme='auto'
              data={data}
              onEmojiSelect={addEmoji}
              style={{
                position: 'absolute',
                bottom: '50px',
                left: '0px',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                width: '300px'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Input
