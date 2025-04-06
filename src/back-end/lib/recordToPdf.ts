import { Response } from 'express'
import { CollectionType } from '../../shared/models/entities.js'
import puppeteer from 'puppeteer'
import { writeFile } from 'fs/promises'
import { createReadStream } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { marked } from 'marked'

const getEntryTitle = (entry: Record<string, any>): string => {
  // Common title field names to check
  const titleFields = ['title', 'name', 'id', 'summary', 'description']

  // Try to find a title field
  for (const field of titleFields) {
    if (entry[field] && typeof entry[field] === 'string') {
      return entry[field]
    }
  }

  // If no title field found, use the first available string field
  const firstField = Object.entries(entry).find(([key, value]) => key !== '_id' && typeof value === 'string')

  if (firstField) {
    const [_key, value] = firstField
    return String(value.substring(0, 40))
  }

  // Fallback to Untitled Entry
  return 'Untitled Entry'
}

const getHtml = (record: Record<string, unknown>): string => {
  const items: string[] = []

  Object.entries(record).map(([key, value]) => {
    items.push(`<h3>${key}</h3>\n`)
    const toMarkdown = typeof value === 'object' ? false : true
    const contents = toMarkdown
      ? String(value).replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')
      : String(value)

    if (toMarkdown) {
      items.push(`<p>${marked.parse(contents, { async: false })}</p>`)
    } else {
      items.push(`<pre><code>${JSON.stringify(contents, null, 2)}</code></pre>`)
    }
  })

  return items.join(' ')
}

interface GeneratePdfOptions {
  collectionType: CollectionType
  records: Record<string, any>[]
  res: Response
}

export const generateCollectionPdf = async ({
  collectionType,
  records,
  res
}: GeneratePdfOptions): Promise<void> => {
  try {
    // Generate HTML content
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${collectionType.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
            }
            h1 { font-size: 2rem; margin-bottom: 2rem; }
            h2 { font-size: 1.5rem; margin-top: 2rem; color: #2c5282; }
            h3 { font-size: 1.2rem; color: #4a5568; margin-top: 1.5rem; }
            pre {
              background: #f7fafc;
              padding: 1rem;
              border-radius: 0.375rem;
              overflow-x: auto;
            }
            code {
              font-family: Menlo, Monaco, Consolas, "Liberation Mono", monospace;
              font-size: 0.875rem;
            }
          </style>
        </head>
        <body>
          <h1>${collectionType.name}</h1>
          ${collectionType.description ? `<p>${collectionType.description}</p>` : ''}
          ${records
            .map((record) => {
              const { _id, ...cleanRecord } = record
              return `
                <div class="record">
                  <h2>${getEntryTitle(cleanRecord)}</h2>
                  ${getHtml(cleanRecord)}
                </div>`
            })
            .join('')}
        </body>
      </html>
    `

    // Create temporary file paths
    const tempHtml = join(tmpdir(), `${collectionType.name}-${Date.now()}.html`)
    const tempPdf = join(tmpdir(), `${collectionType.name}-${Date.now()}.pdf`)

    // Write HTML to temp file
    await writeFile(tempHtml, html)

    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(`file://${tempHtml}`, { waitUntil: 'networkidle0' })

    await page.pdf({
      path: tempPdf,
      format: 'A4',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      printBackground: true
    })

    await browser.close()

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${collectionType.name}-export.pdf"`)

    // Stream the PDF to response
    createReadStream(tempPdf).pipe(res)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}
