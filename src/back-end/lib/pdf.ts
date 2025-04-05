import PDFDocument from 'pdfkit'
import { Response } from 'express'
import { CollectionType } from '../../shared/models/entities.js'
import { marked, Token } from 'marked'

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
    return String(value)
  }

  // Fallback to Untitled Entry
  return 'Untitled Entry'
}

/**
 * Renders markdown content to a PDFKit document
 */
const renderMarkdown = (doc: PDFKit.PDFDocument, markdown: string): void => {
  const tokens = marked.lexer(markdown)
  const listIndent = 30 // Base indentation for first level lists

  const renderList = (items: Token[], level: number = 0, isOrdered: boolean = false) => {
    items.forEach((item: Token, index: number) => {
      if ('text' in item) {
        const currentIndent = listIndent + level * 20 // Increase indent by 20 for each level

        // Reset x position to the left margin for each new line
        doc.x = doc.page.margins.left

        // Position bullet point or number
        const markerX = doc.x + currentIndent - 10 // 10 pixels left of the text
        const markerY = doc.y + 5

        if (isOrdered) {
          // For ordered lists, use numbers
          doc
            .font('Helvetica')
            .fontSize(10)
            .text(`${index + 1}.`, markerX - 15, markerY - 5, { continued: false })

          // Reset position for the actual text
          doc.x = doc.page.margins.left
        } else {
          // For unordered lists, use bullet points
          doc.circle(markerX, markerY, 2).fill()
        }

        // Split the text to handle potential sublists indicated by indentation
        const lines = item.text.split('\n')
        const mainText = lines[0]

        // Add the main text with proper indentation and inline markdown support
        doc.font('Helvetica').fontSize(10)
        renderInlineMarkdown(doc, mainText, currentIndent)

        // Handle any indented lines as a new sublist
        if (lines.length > 1) {
          doc.moveDown(0.5)
          const sublistItems = lines
            .slice(1)
            .filter((line: string) => line.trim())
            .map((line: string) => ({
              type: 'list_item',
              text: line.trim().replace(/^[-*]\s*/, '') // Remove bullet if present
            }))

          if (sublistItems.length > 0) {
            doc.x = doc.page.margins.left // Reset x position before rendering sublist
            renderList(sublistItems as Token[], level + 1, false)
          }
        }

        // Handle nested lists if they exist in the token structure
        if ('items' in item && Array.isArray(item.items)) {
          doc.moveDown(0.5)
          doc.x = doc.page.margins.left // Reset x position before rendering nested list
          renderList(item.items, level + 1, false)
        }
      }
    })
  }

  tokens.forEach((token) => {
    switch (token.type) {
      case 'heading':
        doc
          .fontSize(16 - (token.depth || 0) * 2)
          .font('Helvetica-Bold')
          .text(token.text)
          .moveDown(0.5)
        break

      case 'paragraph':
        doc.font('Helvetica').fontSize(10)
        renderInlineMarkdown(doc, token.text, 0) // No indent for paragraphs
        doc.moveDown(0.5)
        break

      case 'list':
        if ('items' in token) {
          renderList(token.items, 0, token.ordered || false)
        }
        doc.moveDown(0.5)
        break

      case 'code':
        doc.font('Courier').fontSize(10).fillColor('gray').text(token.text).fillColor('black').moveDown(0.5)
        break

      case 'blockquote':
        doc
          .font('Helvetica-Oblique')
          .fillColor('gray')
          .text(token.text, { indent: 10 }) // Small indent for blockquotes
          .fillColor('black')
          .moveDown(0.5)
        break

      default:
        // Handle default case with plain text
        if ('text' in token) {
          doc.font('Helvetica').fontSize(10).text(token.text).moveDown(0.5)
        }
        break
    }
  })
}

/**
 * Renders inline markdown (bold, italic) within text
 */
const renderInlineMarkdown = (doc: PDFKit.PDFDocument, text: string, indent: number): void => {
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g
  let lastIndex = 0
  let match
  let isFirstSegment = true

  while ((match = regex.exec(text)) !== null) {
    const [full, bold1, boldText, italic1, italicText] = match
    const index = match.index

    // Normal text before this match
    if (index > lastIndex) {
      doc.font('Helvetica').text(text.slice(lastIndex, index), {
        continued: true,
        indent: isFirstSegment ? indent : 0
      })
    }

    // Bold
    if (boldText) {
      doc.font('Helvetica-Bold').text(boldText, {
        continued: true,
        indent: isFirstSegment ? indent : 0
      })
    }

    // Italic
    if (italicText) {
      doc.font('Helvetica-Oblique').text(italicText, {
        continued: true,
        indent: isFirstSegment ? indent : 0
      })
    }

    lastIndex = regex.lastIndex
    isFirstSegment = false
  }

  // Remaining normal text
  if (lastIndex < text.length) {
    doc.font('Helvetica').text(text.slice(lastIndex), {
      continued: false,
      indent: isFirstSegment ? indent : 0
    })
  } else {
    doc.text('', { continued: false })
  }
}

interface GeneratePdfOptions {
  collectionType: CollectionType
  records: Record<string, any>[]
  res: Response
}

export const generateCollectionPdf = ({ collectionType, records, res }: GeneratePdfOptions): void => {
  // Create PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `${collectionType.name} Export`,
      Author: 'Collection Manager'
    }
  })

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${collectionType.name}-export.pdf"`)

  // Pipe the PDF to the response
  doc.pipe(res)

  // Add title
  doc.fontSize(24).text(collectionType.name, { align: 'center' }).moveDown()

  // Add description
  if (collectionType.description) {
    doc.fontSize(12).text(collectionType.description).moveDown()
  }

  records.forEach((record) => {
    // Only remove MongoDB's _id field, keep schema's id field if it exists
    const { _id, ...cleanRecord } = record

    // Add record title
    doc.fontSize(14).text(getEntryTitle(cleanRecord), { underline: true }).moveDown()

    // Add each field with improved formatting
    Object.entries(cleanRecord).forEach(([key, value]) => {
      // Add field name (underlined)
      doc.fontSize(10).text(key, { underline: true }).moveDown(0.5)

      // Add field value
      const stringValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)

      // Use markdown rendering for longer text values
      if (stringValue.length > 50) {
        renderMarkdown(doc, stringValue)
      } else {
        doc.text(stringValue).moveDown()
      }
    })

    // Check if we're near the bottom of the page
    if (doc.y > doc.page.height - 100) {
      doc.addPage()
    }
  })

  // Finalize the PDF
  doc.end()
}
