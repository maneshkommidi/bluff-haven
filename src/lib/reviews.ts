import 'server-only'
import fs from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

export interface Review {
  id: number
  guestName: string
  rating: number
  date: string
  text: string
  source: string
}

function loadReviewsFromExcel(): Review[] {
  const filePath = path.join(process.cwd(), 'public', 'data', 'review-export.xlsx')

  // Read as a Buffer and pass to XLSX.read — avoids webpack intercepting XLSX.readFile
  const buffer = fs.readFileSync(filePath)
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  return rows
    .filter((row) => String(row['Shown'] ?? '').trim().toLowerCase() === 'yes')
    .map((row, index) => {
      const guestName = String(
        row['GuestFirstName'] ?? String(row['Name'] ?? '').split(' ')[0]
      ).trim()

      const rawStars = row['Stars Out Of 5']
      const rating = rawStars != null ? Number(rawStars) : 5.0

      const rawDate = row['Written']
      let date = ''
      if (rawDate instanceof Date) {
        date = rawDate.toISOString().slice(0, 10)
      } else if (typeof rawDate === 'number') {
        // Fallback: Excel serial date
        date = new Date(Math.round((rawDate - 25569) * 86400 * 1000)).toISOString().slice(0, 10)
      } else {
        date = String(rawDate ?? '').slice(0, 10)
      }

      const text = String(row['Body'] ?? '').trim()
      const source = String(row['Listing Site'] ?? 'Airbnb').trim()

      return { id: index + 1, guestName, rating, date, text, source }
    })
}

export const reviews: Review[] = loadReviewsFromExcel()
