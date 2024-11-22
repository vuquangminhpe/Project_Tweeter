import apiUser from '@/apis/user.api'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
export default function Profile() {
  const { data, isLoading } = useQuery({
    queryKey: ['dataProfile'],
    queryFn: () => apiUser.getProfile()
  })
  const dataProfile = data?.data.result
  console.log(dataProfile)
  // if (dataProfile?.verify === 0) {
  //   return (
  //     <div className='flex flex-col w-full'>
  //       <Link to={`/${path.verifyEmail}`}>Verify Email</Link>
  //     </div>
  //   )
  // }
  const getJoined = (date: string) => {
    const parts = String(new Date(date)).split(' ')
    console.log(parts)

    const month = parts[1]
    const year = parts[3]
    const dateAll = `${month} ${year}`
    return dateAll
  }
  if (isLoading) {
    return (
      <div role='status'>
        <svg
          aria-hidden='true'
          className='w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600'
          viewBox='0 0 100 101'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
            fill='currentColor'
          />
          <path
            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
            fill='currentFill'
          />
        </svg>
        <span className='sr-only'>Loading...</span>
      </div>
    )
  }
  return (
    <div className='w-full flex-col gap-2 flex relative'>
      <div className='flex items-center sticky start-0'>
        <div>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='#fff'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='#fff'
            className='size-8'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18' />
          </svg>
        </div>
        <div className='flex flex-col text-2xl ml-5'>
          <div className='text-white font-bold'>{dataProfile?.name}</div>
          <div className='text-gray-500'>0 posts</div>
        </div>
      </div>
      <div className='mt-4 h-auto relative w-full'>
        <div className='w-full bg-gray-400/30 h-52'></div>
        <div className='flex justify-between'>
          <img
            src={`${dataProfile?.avatar}`}
            alt=''
            className='-translate-y-14 translate-x-3 size-32 rounded-full border-[3px] border-white'
          />
          <div className='text-white h-10 -translate-x-3 items-center text-center leading-8 mt-4 p-1 block text-sm font-bold border-[1px] rounded-3xl border-white'>
            Edit profile
          </div>
        </div>
        <div className='mt-5 w-full'>
          <div className='flex items-center'>
            <div className='text-3xl font-bold text-white mr-7'>{dataProfile?.name}</div>
            {dataProfile?.verify === 0 && (
              <div className='text-white h-10 -translate-x-3 items-center text-center leading-8 mt-4 p-1 block text-sm font-bold border-[1px] rounded-3xl border-white'>
                Get verified
              </div>
            )}
          </div>
          <div className='text-2xl mt-5'>{dataProfile?.username ? `@${dataProfile?.username}` : 'No username'}</div>
          <div className='mt-5 flex'>
            <svg
              className='size-5 text-gray-800 dark:text-white'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 20 20'
            >
              <path
                stroke='currentColor'
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M5 1v3m5-3v3m5-3v3M1 7h18M5 11h10M2 3h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z'
              />
            </svg>
            <div className='ml-4 '>Joined {getJoined(dataProfile?.created_at as string)}</div>
          </div>
          <div className='flex mt-5 gap-5 text-xl'>
            <div>{0} Following</div>
            <div>{0} Followers</div>
          </div>
          <div className='mt-5 w-full'>
            <Tabs defaultValue='Posts' className='w-full'>
              <TabsList className='w-full'>
                <TabsTrigger value='Posts'>Posts</TabsTrigger>
                <TabsTrigger value='Replies'>Replies</TabsTrigger>
                <TabsTrigger value='Highlights'>Highlights</TabsTrigger>
                <TabsTrigger value='Articles'>Articles</TabsTrigger>
                <TabsTrigger value='Media'>Media</TabsTrigger>
                <TabsTrigger value='Likes'>Likes</TabsTrigger>
              </TabsList>
              <TabsContent value='Posts'>Make changes to your account here.</TabsContent>
              <TabsContent value='Replies'>Change your password here.</TabsContent>
              <TabsContent value='Highlights'>Change your password here.</TabsContent>
              <TabsContent value='Articles'>Change your password here.</TabsContent>
              <TabsContent value='Media'>Change your password here.</TabsContent>
              <TabsContent value='Likes'>Change your password here.</TabsContent>
            </Tabs>
          </div>
          <div className='mt-5 border-t-[1px] border-gray-500'></div>
          <div className='mt-5 max-w-full'>
            <div className='text-white font-bold text-2xl'>Let’s get you set up</div>
            <Carousel className='mt-4'>
              <CarouselContent>
                <CarouselItem className='md:basis-1/2 lg:basis-1/3'>
                  <img src='https://ton.twimg.com/onboarding/persistent_nux/follow_2x.png' alt='' />
                  <div className='text-white'>Follow 5 accounts</div>
                </CarouselItem>
                <CarouselItem className='md:basis-1/2 lg:basis-1/3'>
                  <img src='https://ton.twimg.com/onboarding/persistent_nux/topics_2x.png' alt='' />
                  <div className='capitalize text-white'>follow 3 topics</div>
                </CarouselItem>
                <CarouselItem className='md:basis-1/2 lg:basis-1/3 relative'>
                  <img src='https://ton.twimg.com/onboarding/persistent_nux/profile_2x.png' alt='' />
                  <div className='capitalize text-white'>Complete your profile</div>
                  <div className='p-2 text-white font-bold -translate-y-8 translate-x-3 bg-emerald-500 absolute bottom-0 rounded-3xl'>
                    done
                  </div>
                </CarouselItem>
                <CarouselItem className='md:basis-1/2 lg:basis-1/3'>
                  <img src='https://ton.twimg.com/onboarding/persistent_nux/notifs_2x.png' alt='' />
                  <div className=' text-white'>Turn on notifications</div>
                  <div className='p-2 text-white font-bold -translate-y-8 translate-x-3 bg-emerald-500 absolute bottom-0 rounded-3xl'>
                    done
                  </div>
                </CarouselItem>
                <CarouselItem className='md:basis-1/2 lg:basis-1/3'>...</CarouselItem>
                <CarouselItem className='md:basis-1/2 lg:basis-1/3'>...</CarouselItem>
                <CarouselItem className='md:basis-1/2 lg:basis-1/3'>...</CarouselItem>
                <CarouselItem className='md:basis-1/2 lg:basis-1/3'>...</CarouselItem>
              </CarouselContent>
              <CarouselPrevious className='dark:bg-white' />
              <CarouselNext className='dark:bg-white' />
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  )
}
