import { RequestHandler } from 'express'
import { getCollectionTypeById } from '../persistence/CollectionTypePersistence.js'
import { getDataFromCollection } from '../persistence/CollectionDataPersistence.js'
import { generateCollectionPdf } from '../lib/recordToPdf.js'

interface ExportParams {
  collectionTypeId: string
}

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

export const exportCollection: RequestHandler<ExportParams> = async (req, res, next) => {
  try {
    const { collectionTypeId } = req.params

    if (!collectionTypeId) {
      res.status(400).json({ error: 'Collection ID is required' })
      return
    }

    // Get the collection type metadata
    const collectionType = await getCollectionTypeById(collectionTypeId)

    if (!collectionType) {
      res.status(404).json({ error: 'Collection type not found' })
      return
    }

    // Fetch all documents from the collection
    const result = await getDataFromCollection({
      collectionName: collectionType.collection_name,
      queryType: 'range',
      limit: 0 // 0 means no limit
    })

    const records = result.records || []

    await generateCollectionPdf({
      collectionType,
      records,
      res
    })
  } catch (error) {
    next(error)
  }
}
