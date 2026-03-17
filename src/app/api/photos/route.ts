import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const photosDir = path.join(process.cwd(), 'public', 'photos')

    if (!fs.existsSync(photosDir)) {
      return NextResponse.json([])
    }

    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']

    const files = fs.readdirSync(photosDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase()
        // Skip hidden files, duplicates patterns, and non-image files
        if (file.startsWith('.')) return false
        if (file.startsWith('_')) return false
        if (!validExtensions.includes(ext)) return false
        return true
      })
      .sort((a, b) => {
        // Sort numerically if filenames contain numbers, else alphabetically
        const numA = parseInt(a.match(/\d+/)?.[0] ?? '0')
        const numB = parseInt(b.match(/\d+/)?.[0] ?? '0')
        return numA !== numB ? numA - numB : a.localeCompare(b)
      })

    // Deduplicate by base name (catches "photo.jpg" and "photo (1).jpg" etc.)
    const seen = new Set<string>()
    const deduped = files.filter(file => {
      // Normalize: strip trailing spaces, numbers in parens like " (1)", " copy"
      const base = path.basename(file, path.extname(file))
        .replace(/\s*\(\d+\)\s*$/, '')
        .replace(/\s*copy\s*$/i, '')
        .trim()
        .toLowerCase()
      if (seen.has(base)) return false
      seen.add(base)
      return true
    })

    const photos = deduped.map((file, i) => ({
      id: i + 1,
      url: `/photos/${file}`,
      caption: path.basename(file, path.extname(file))
        .replace(/[-_]/g, ' ')
        .replace(/\s*\(\d+\)\s*$/, '')
        .replace(/^\d+\s*/, '') // strip leading numbers
        .trim(),
    }))

    return NextResponse.json(photos)
  } catch (err: any) {
    console.error('Photos route error:', err?.message ?? err)
    return NextResponse.json({ error: 'Failed to load photos' }, { status: 500 })
  }
}
