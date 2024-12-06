import { Media } from '@/types/Medias.type'
import { SuccessResponse } from '@/types/Utils.type'
import http from '@/utils/http'

const mediasApi = {
  uploadImages: (images: File[]) => {
    const formData = new FormData()
    images.forEach((image) => formData.append('image', image))

    return http.post<SuccessResponse<Media[]>>('/medias/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
export default mediasApi
