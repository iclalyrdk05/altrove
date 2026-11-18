// Converts the raw .mov footage (listed in footage-map.json) into web-ready
// .mp4 files in ../../videos-converted/. Originals are never touched or moved.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_DIR = path.dirname(SCRIPT_DIR)
const VIDEOS_DIR = path.resolve(PROJECT_DIR, '../videos')
const OUT_DIR = path.resolve(PROJECT_DIR, '../videos-converted')
const FFMPEG = process.env.FFMPEG_BIN || '/opt/homebrew/bin/ffmpeg'

const map = JSON.parse(readFileSync(path.join(SCRIPT_DIR, 'footage-map.json'), 'utf8'))

mkdirSync(OUT_DIR, { recursive: true })

for (const { source, slug, codec } of map) {
  const inPath = path.join(VIDEOS_DIR, source)
  const outPath = path.join(OUT_DIR, `${slug}.mp4`)

  if (!existsSync(inPath)) {
    console.log(`MISSING SOURCE: ${inPath}`)
    continue
  }
  if (existsSync(outPath)) {
    console.log(`skip (already converted): ${slug}.mp4`)
    continue
  }

  if (codec === 'h264') {
    console.log(`remux (lossless): ${source} -> ${slug}.mp4`)
    execFileSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-i', inPath, '-c', 'copy', '-movflags', '+faststart', outPath])
  } else {
    console.log(`re-encode (HEVC->H.264): ${source} -> ${slug}.mp4`)
    execFileSync(FFMPEG, [
      '-y', '-hide_banner', '-loglevel', 'error', '-i', inPath,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', outPath,
    ])
  }
}

console.log(`Done. Converted files are in: ${OUT_DIR}`)
