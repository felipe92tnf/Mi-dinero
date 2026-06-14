import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const svg = readFileSync(join(publicDir, 'icon.svg'))

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
]

for (const { name, size } of sizes) {
  const buffer = await sharp(svg).resize(size, size).png().toBuffer()
  writeFileSync(join(publicDir, name), buffer)
}

const favicon = await sharp(svg).resize(32, 32).png().toBuffer()
writeFileSync(join(publicDir, 'favicon.ico'), favicon)

console.log('Iconos PWA generados en public/')
