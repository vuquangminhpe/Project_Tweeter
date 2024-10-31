import { Response, Request, NextFunction } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import mediaService from '~/services/medias.services'
import path from 'path'
import { UPLOAD_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.uploadImage(req)
  res.json({ message: USERS_MESSAGES.UPLOAD_SUCCESS, result: url })
}
export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.uploadVideo(req)
  res.json({ message: USERS_MESSAGES.UPLOAD_SUCCESS, result: url })
}
export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serveVideoController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
