import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs-extra'

const MAXIMUM_BITRATE_720P = 5 * 10 ** 6 // 5Mbps
const MAXIMUM_BITRATE_1080P = 8 * 10 ** 6 // 8Mbps
const MAXIMUM_BITRATE_1440P = 16 * 10 ** 6 // 16Mbps

const checkVideoHasAudio = (filePath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }
      const audioStreams = metadata.streams.filter((stream) => stream.codec_type === 'audio')
      resolve(audioStreams.length > 0)
    })
  })
}

const getResolution = (filePath: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }
      const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video')
      resolve({
        width: Number(videoStream?.width || 0),
        height: Number(videoStream?.height || 0)
      })
    })
  })
}

const getWidth = (height: number, resolution: { width: number; height: number }): number => {
  const width = Math.round((height * resolution.width) / resolution.height)
  return width % 2 === 0 ? width : width + 1
}

export const encodeHLSWithMultipleVideoStreams = async (
  inputPath: string,
  maxFileSize = 50, // MB, ngưỡng để quyết định encode
  maxStreams = 2 // Số stream tối đa
): Promise<boolean> => {
  const fileStats = await fs.stat(inputPath)
  const fileSizeInMB = fileStats.size / (1024 * 1024)
  if (fileSizeInMB <= maxFileSize) {
    return encodeSmallFile(inputPath)
  }
  return encodeMultiStreams(inputPath, maxStreams)
}

const encodeSmallFile = async (inputPath: string): Promise<boolean> => {
  const parentFolder = path.dirname(inputPath)
  const outputDir = path.join(parentFolder, 'v0')
  await fs.ensureDir(outputDir)
  const [resolution, isHasAudio] = await Promise.all([getResolution(inputPath), checkVideoHasAudio(inputPath)])
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec(isHasAudio ? 'copy' : 'aac')
      .outputOptions([
        '-preset ultrafast', // Encode nhanh hơn
        '-g 48',
        '-crf 23',
        '-f hls',
        '-hls_time 10',
        '-hls_list_size 0',
        '-threads 4' // Increase thread utilization
      ])
      .output(path.join(outputDir, 'index.m3u8'))
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err))
      .run()
  })
}

const encodeMultiStreams = async (inputPath: string, maxStreams: number): Promise<boolean> => {
  const parentFolder = path.dirname(inputPath)
  const resolutions = ['v0', 'v1', 'v2'].slice(0, maxStreams)
  await Promise.all(resolutions.map((res) => fs.ensureDir(path.join(parentFolder, res))))
  const [resolution, isHasAudio] = await Promise.all([getResolution(inputPath), checkVideoHasAudio(inputPath)])
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec(isHasAudio ? 'copy' : 'aac')
      .outputOptions([
        '-preset ultrafast', // Encode nhanh hơn
        '-g 48',
        '-crf 23',
        '-sc_threshold 0',
        '-f hls',
        '-hls_time 10',
        '-hls_list_size 0',
        '-master_pl_name master.m3u8',
        '-threads 4' // Increase thread utilization
      ])

    const streamConfigs = [
      { height: 720, bitrate: MAXIMUM_BITRATE_720P },
      { height: 1080, bitrate: MAXIMUM_BITRATE_1080P },
      { height: 1440, bitrate: MAXIMUM_BITRATE_1440P }
    ].slice(0, maxStreams)

    streamConfigs.forEach((config, index) => {
      command
        .output(path.join(parentFolder, `v${index}`, 'prog_index.m3u8'))
        .outputOptions([
          `-filter:v:${index} scale=${getWidth(config.height, resolution)}:${config.height}`,
          `-maxrate:v:${index} ${config.bitrate}`,
          `-var_stream_map v:${index},a:${index}`
        ])
    })

    command
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err))
      .run()
  })
}
