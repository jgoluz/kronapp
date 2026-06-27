import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'fs'
import https from 'https'
import http from 'http'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, { headers: { 'User-Agent': 'KoffieIconGenerator/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    })
    req.on('error', reject)
  })
}

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#130F0A"/>
  <text x="256" y="358" font-family="Sansita" font-size="300" font-weight="900" font-style="italic" text-anchor="middle" fill="#A06840">K</text>
</svg>`

async function main() {
  // Download Sansita Black Italic from Google Fonts GitHub mirror
  const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/sansita/Sansita-BlackItalic.ttf'
  console.log('Downloading Sansita-BlackItalic.ttf...')
  const fontBuffer = await download(fontUrl)
  const fontPath = path.join(os.tmpdir(), 'Sansita-BlackItalic.ttf')
  writeFileSync(fontPath, fontBuffer)
  console.log(`Font saved: ${fontPath} (${fontBuffer.length} bytes)`)

  const fontOpts = {
    fontFiles: [fontPath],
    loadSystemFonts: false,
    defaultFontFamily: 'Sansita',
  }

  for (const size of [192, 512]) {
    const resvg = new Resvg(SVG, { fitTo: { mode: 'width', value: size }, font: fontOpts })
    const png = resvg.render().asPng()
    const out = path.join(__dirname, 'public', 'icons', `icon-${size}.png`)
    writeFileSync(out, png)
    console.log(`Generated ${out}`)
  }

  // Apple touch icon 180×180
  const resvg180 = new Resvg(SVG, { fitTo: { mode: 'width', value: 180 }, font: fontOpts })
  const png180 = resvg180.render().asPng()
  writeFileSync(path.join(__dirname, 'public', 'apple-touch-icon.png'), png180)
  console.log('Generated public/apple-touch-icon.png')

  console.log('All icons generated successfully.')
}

main().catch(err => {
  console.error('Icon generation failed:', err.message)
  process.exit(1)
})
