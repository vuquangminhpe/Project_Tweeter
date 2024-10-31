import { Request } from 'express'
import fs from 'fs'
import formidable, { Part } from 'formidable'
import { File } from 'formidable'
import { UPLOAD_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
export const initFolderImage = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true
    })
  }
}

export const initFolderVideo = () => {
  if (!fs.existsSync(UPLOAD_VIDEO_DIR)) {
    fs.mkdirSync(UPLOAD_VIDEO_DIR, {
      recursive: true
    })
  }
}

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300KB
    maxTotalFileSize: 300 * 1024 * 4, // 10MB
    filter: function ({ name, originalFilename, mimetype }: Part) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      console.log(files)

      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.image as File[])
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('')
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 300KB
    filter: function ({ name, originalFilename, mimetype }: Part) {
      console.log(name, mimetype)

      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      console.log(files)

      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.video as File[])
    })
  })
}
