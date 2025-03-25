/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User } from '@/types/User.type'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiUser from '@/apis/users.api'
import mediasApi from '@/apis/medias.api'

interface EditProfileDialogProps {
  profile: User | null
}

export default function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const [name, setName] = useState(profile?.name || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || '')
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()
  const uploadMutation = useMutation({
    mutationFn: mediasApi.uploadImages
  })
  const updateMyMutation = useMutation({
    mutationFn: apiUser.updateMe
  })
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError('')
    setIsLoading(true)

    if (avatar) {
      try {
        uploadMutation.mutateAsync(avatar, {
          onSuccess: (data) => {
            setAvatarPreview(data?.data?.result[0].url)
          }
        })
      } catch (error) {
        console.error('Error uploading avatar:', error)
      }
    }

    const updateData = {
      name,
      username,
      bio,
      avatar: avatarPreview,
      date_of_birth: new Date(profile?.date_of_birth as Date).toISOString(),
      location: profile?.location,
      website: profile?.website,
      cover_photo: profile?.cover_photo
    }

    updateMyMutation.mutateAsync(updateData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['dataProfile'] })
      },
      onError: (error) => {
        console.log('Error updating profile:', error)
      }
    })

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className='text-white h-10 -translate-x-3 items-center text-center leading-8 mt-4 p-1 block text-sm font-bold border-[1px] rounded-3xl border-white hover:bg-white/10'>
        Edit profile
      </DialogTrigger>
      <DialogContent className='bg-black text-white border-gray-800 max-w-xl'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>Edit profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <div className='text-red-500 text-sm'>{error}</div>}
          <div>
            <label className='block text-sm font-medium mb-2'>Name</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full p-2 bg-transparent border border-gray-800 rounded-md focus:outline-none focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Username</label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full p-2 bg-transparent border border-gray-800 rounded-md focus:outline-none focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className='w-full p-2 bg-transparent border border-gray-800 rounded-md focus:outline-none focus:border-blue-500'
              rows={3}
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Profile photo</label>
            {avatarPreview && <img src={avatarPreview} className='w-20 h-20 rounded-full mb-2 object-cover' />}
            <input
              type='file'
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setAvatar(file)
                  const previewUrl = URL.createObjectURL(file)
                  setAvatarPreview(previewUrl)
                }
              }}
              className='w-full p-2 bg-transparent border border-gray-800 rounded-md focus:outline-none focus:border-blue-500'
            />
          </div>
          <div className='flex justify-end gap-3'>
            <button
              type='button'
              className='px-4 py-2 border border-gray-800 rounded-full hover:bg-gray-900'
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-white text-black rounded-full font-bold hover:bg-white/90 disabled:opacity-50'
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
