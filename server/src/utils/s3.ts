import { S3 } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
import { Upload } from '@aws-sdk/lib-storage'
import fs from 'fs'
import { Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
config()
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})
// s3.listBuckets({}).then((data) => console.log(data))
export const uploadFileS3 = async ({
  filename,
  filePath,
  contentType
}: {
  filename: string
  filePath: string
  contentType: string
}) => {
  const parallelUploads3 = await new Upload({
    client: s3,
    params: {
      Bucket: process.env.S3_BUCKET_NAME as string,
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
    const data = await s3.getObject({
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: filepath
    })
    ;(data.Body as any).pipe(res)
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).send('Not Found')
  }
}
