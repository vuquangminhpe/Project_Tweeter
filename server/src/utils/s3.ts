import { S3 } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
import { Upload } from '@aws-sdk/lib-storage'
import fs from 'fs'
import { Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { envConfig } from '~/constants/config'

config()
const s3 = new S3({
  region: envConfig.region,
  credentials: {
    secretAccessKey: envConfig.secretAccessKey as string,
    accessKeyId: envConfig.accessKeyId as string
  }
})
export const uploadFileS3 = async ({
  filename,
  filePath,
  contentType
}: {
  filename: string
  filePath: string
  contentType: string
}) => {
  console.log(filePath, '////', filename, '//////', contentType)

  const parallelUploads3 = await new Upload({
    client: s3,
    params: {
      Bucket: envConfig.Bucket_Name as string,
      Key: filename,
      Body: fs.readFileSync(filePath),
      ContentType: contentType
    },

    // optional tags
    tags: [
      /*...*/
    ],

    // additional optional fields show default values below:

    // (optional) concurrency configuration
    queueSize: 4,

    // (optional) size of each part, in bytes, at least 5MB
    partSize: 1024 * 1024 * 5,

    // (optional) when true, do not automatically call AbortMultipartUpload when
    // a multipart upload fails to complete. You should then manually handle
    // the leftover parts.
    leavePartsOnError: false
  })

  return parallelUploads3.done()
}

export const sendFileFromS3 = async (res: Response, filepath: string) => {
  try {
    console.log('filepath', filepath)

    const data = await s3.getObject({
      Bucket: envConfig.Bucket_Name as string,
      Key: filepath
    })
    res.setHeader('Content-Type', data.ContentType as string)
    res.setHeader('Content-Length', data.ContentLength as number)
    ;(data.Body as any)?.pipe(res)
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).send('Not Found')
  }
}
export const deleteFileFromS3 = async (s3Url: string): Promise<void> => {
  try {
    const bucketName = envConfig.Bucket_Name as string
    const urlPattern = `https://${bucketName}.s3.${envConfig.region}.amazonaws.com/`
    const fileKey = s3Url.replace(urlPattern, '')

    await s3.deleteObject({
      Bucket: bucketName,
      Key: fileKey
    })

    console.log(`File ${fileKey} đã được xóa khỏi S3`)
  } catch (error) {
    console.error('Lỗi khi xóa file từ S3:', error)
    throw new Error('Không thể xóa file trên S3')
  }
}

export const deleteFolder = async (s3Url: string): Promise<void> => {
  try {
    const bucketName = envConfig.Bucket_Name as string
    const urlPattern = `https://${bucketName}.s3.${envConfig.region}.amazonaws.com/`
    const folderKey = s3Url.replace(urlPattern, '')

    const objects = await s3.listObjects({
      Bucket: bucketName,
      Prefix: folderKey
    })

    await s3.deleteObjects({
      Bucket: bucketName,
      Delete: {
        Objects: objects.Contents?.map((obj) => ({ Key: obj.Key })) || []
      }
    })

    console.log(`Folder ${folderKey} đã được xóa khỏi S3`)
  } catch (error) {
    console.error('Lỗi khi xóa folder từ S3:', error)
    throw new Error('Không thể xóa folder trên S3')
  }
}
