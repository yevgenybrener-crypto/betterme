// Proxy cover images from Steimatzky CDN to bypass hotlink protection
// Usage: /api/cover-proxy?url=https://www.steimatzky.co.il/pub/media/...

export default async function handler(req, res) {
  const { url } = req.query
  if (!url || !url.includes('steimatzky.co.il')) {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  try {
    const imgRes = await fetch(url, {
      headers: {
        'Referer': 'https://www.steimatzky.co.il/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    })

    if (!imgRes.ok) return res.status(404).end()

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    const buffer = await imgRes.arrayBuffer()

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=604800') // 1 week
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.end(Buffer.from(buffer))
  } catch (err) {
    res.status(500).end()
  }
}
