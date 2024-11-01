import { Router } from 'express'
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController
} from '~/controllers/medias.controllers'
import { AccessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'
const mediasRouter = Router()

mediasRouter.post('/upload-image', AccessTokenValidator, verifiedUserValidator, wrapAsync(uploadImageController))
mediasRouter.post('/upload-video', AccessTokenValidator, verifiedUserValidator, wrapAsync(uploadVideoController))
mediasRouter.post('/upload-video-hls', AccessTokenValidator, verifiedUserValidator, wrapAsync(uploadVideoHLSController))

export default mediasRouter
