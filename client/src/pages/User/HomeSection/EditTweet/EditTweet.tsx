/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tweets } from '@/types/Tweet.type'
import { User } from '@/types/User.type'
import { SuccessResponse } from '@/types/Utils.type'
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'

interface Props {
  profile: User | null
  data: Tweets
  refetchAllDataTweet: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<AxiosResponse<SuccessResponse<Tweets[]>, any>, Error>>
}

export default function EditTweet({ profile, data }: Props) {
  return <div>EditTweet</div>
}
