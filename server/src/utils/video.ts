import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs-extra'

const BITRATE_CONFIGS = {
  v0: { height: 720, bitrate: '1000k' },
  v1: { height: 1080, bitrate: '2000k' }
}

const getVideoInfo = async (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err)
      const videoStream = metadata.streams.find((stream: any) => stream.codec_type === 'video')
      const hasAudio = metadata.streams.some((stream: any) => stream.codec_type === 'audio')

      resolve({
        resolution: {
          width: Number(videoStream?.width || 0),
          height: Number(videoStream?.height || 0)
        },
        hasAudio
      })
    })
  })
}

const getWidth = (targetHeight: number, originalWidth: number, originalHeight: number): number => {
  const width = Math.round((targetHeight * originalWidth) / originalHeight)
  return width % 2 === 0 ? width : width + 1
}

const encodeStream = async (
  inputPath: string,
  outputFolder: string,
  width: number,
  height: number,
  bitrate: string,
  hasAudio: boolean
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .videoCodec('libx264')
      .addOption('-preset', 'veryfast')
      .addOption('-tune', 'fastdecode')
      .addOption('-profile:v', 'baseline')
      .addOption('-level', '3.0')
      .addOption('-movflags', '+faststart')
      .addOption('-x264opts', 'no-scenecut')
      .addOption('-g', '30')
      .addOption('-keyint_min', '30')
      .addOptions(['-hls_playlist_type', 'vod'])
      .addOption('-hls_time', '2')
      .addOption('-hls_flags', 'single_file')
      .addOption('-hls_segment_type', 'fmp4')
      .size(`${width}x${height}`)
      .videoBitrate(bitrate)

    if (hasAudio) {
      command.audioCodec('aac').audioBitrate('64k')
    } else {
      command.noAudio()
    }

    command
      .output(path.join(outputFolder, 'prog_index.m3u8'))
      .on('progress', (progress) => {
        process.stdout.write(`\rProcessing ${height}p: ${Math.round(progress.percent as number)}%`)
      })
      .on('end', () => {
        process.stdout.write('\n')
        resolve(true)
      })
      .on('error', reject)
      .run()
  })
}

export const encodeHLSWithMultipleVideoStreams = async (
  inputPath: string,
  maxFileSize = 50,
  maxStreams = 2
): Promise<boolean> => {
  const parentFolder = path.dirname(inputPath)
  const { resolution, hasAudio } = await getVideoInfo(inputPath)

  // Create output folders
  const streamConfigs = Object.entries(BITRATE_CONFIGS)
    .slice(0, maxStreams)
    .map(([version, config]) => ({
      folder: version,
      ...config
    }))

  for (const config of streamConfigs) {
    await fs.ensureDir(path.join(parentFolder, config.folder))
  }

  // Generate master playlist
  const masterPlaylist = ['#EXTM3U', '#EXT-X-VERSION:3']

  // Process each stream
  for (const config of streamConfigs) {
    const width = getWidth(config.height, resolution.width, resolution.height)
    masterPlaylist.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(config.bitrate) * 1000},RESOLUTION=${width}x${config.height}`,
      `${config.folder}/prog_index.m3u8`
    )

    await encodeStream(
      inputPath,
      path.join(parentFolder, config.folder),
      width,
      config.height,
      config.bitrate,
      hasAudio
    )
  }

  await fs.writeFile(path.join(parentFolder, 'master.m3u8'), masterPlaylist.join('\n'))
  return true
}
