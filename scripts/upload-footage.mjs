// Uploads the converted .mp4 footage to the Cloudflare R2 bucket named in
// .env.local. Reads credentials from .env.local only — never logs them.
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_DIR = path.dirname(SCRIPT_DIR)
const OUT_DIR = path.resolve(PROJECT_DIR, '../videos-converted')

function loadEnvLocal() {
  const envPath = path.join(PROJECT_DIR, '.env.local')
  const lines = readFileSync(envPath, 'utf8').split('\n')
  const env = {}
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

const env = loadEnvLocal()
const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']
for (const key of required) {
  if (!env[key]) {
    console.error(`Missing ${key} in .env.local`)
    process.exit(1)
  }
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

const map = JSON.parse(readFileSync(path.join(SCRIPT_DIR, 'footage-map.json'), 'utf8'))

async function alreadyUploaded(key, size) {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }))
    return head.ContentLength === size
  } catch {
    return false
  }
}

for (const { slug } of map) {
  const key = `${slug}.mp4`
  const filePath = path.join(OUT_DIR, key)
  if (!existsSync(filePath)) {
    console.log(`SKIP (not converted): ${key}`)
    continue
  }
  const size = statSync(filePath).size
  if (await alreadyUploaded(key, size)) {
    console.log(`skip (already uploaded): ${key}`)
    continue
  }
  console.log(`uploading: ${key} (${(size / 1024 / 1024).toFixed(1)} MB)`)
  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: createReadStream(filePath),
      ContentType: 'video/mp4',
      ContentLength: size,
    }),
  )
}

console.log('Upload complete.')
