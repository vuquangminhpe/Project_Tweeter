import { Response, Request, NextFunction } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import mediaService from '~/services/medias.services'
import path from 'path'
import mime from 'mime'
import fs from 'fs'
import { UPLOAD_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
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

export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

    if (!fs.existsSync(videoPath)) {
      res.status(404).send('Video not found')
    }

    const videoSize = fs.statSync(videoPath).size
    const range = req.headers.range

    console.log('Video Path:', videoPath)
    console.log('Video Size:', videoSize)
    console.log('Range Header:', range)

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1

      const chunksize = end - start + 1
      const file = fs.createReadStream(videoPath, { start, end })
      const head = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mime.getType(videoPath) || 'video/mp4'
      }

      res.writeHead(206, head)
      file.pipe(res)
    } else {
      const head = {
        'Content-Length': videoSize,
        'Content-Type': mime.getType(videoPath) || 'video/mp4'
      }
      res.writeHead(200, head)
      fs.createReadStream(videoPath).pipe(res)
    }
  } catch (error) {
    console.error('Video Streaming Error:', error)
    res.status(500).send('Internal Server Error')
  }
}
