import { S3 } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
import { Upload } from '@aws-sdk/lib-storage'
import fs from 'fs'
import path from 'path'
config()
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})
// s3.listBuckets({}).then((data) => console.log(data))
const file = fs.readFileSync(path.resolve('/Users/84979/Desktop/Tweeter_Minh/server/uploads/Images/New2.png'))

const parallelUploads3 = new Upload({
  client: s3,
  params: { Bucket: 'twitter-clone-minh-ap-southeast-1', Key: 'New1.jpg', Body: file, ContentType: 'image/png' },

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

parallelUploads3.on('httpUploadProgress', (progress) => {
  console.log(progress)
})

parallelUploads3.done().then((res) => {
  console.log(res)
})
