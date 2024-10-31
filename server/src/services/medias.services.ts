import { Request } from 'express'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Orther'
class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_VIDEO_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newPath = path.resolve(UPLOAD_VIDEO_DIR, `${file.newFilename}.mp4`)

        await fs.promises.copyFile(file.filepath, newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video/${file.newFilename}.mp4`
            : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}.mp4`,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

const mediaService = new MediaService()
export default mediaService
