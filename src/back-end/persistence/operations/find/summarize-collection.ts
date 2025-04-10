import { getCollectionTypeByCollectionName } from '../../collection-types.js'
import { getDynamicCollection } from '../common.js'

interface SummaryRecord {
  _id: string
  summary: string
}

/**
 * Retrieves a summarized view of all records in a collection
 * Returns an array of objects containing just the id and summary fields
 *
 * @param collectionName The name of the collection to summarize
 * @returns Promise resolving to an array of {id, summary} objects
 * @throws Error if collection doesn't exist or records don't match required schema
 */
export async function summarizeCollection(collectionName: string): Promise<SummaryRecord[]> {
  // Verify collection exists and has required schema
  const collectionType = await getCollectionTypeByCollectionName(collectionName)

  if (!collectionType) {
    throw new Error(`Collection '${collectionName}' does not exist in registry`)
  }

  // Verify schema requires id and summary fields
  const schema = collectionType.schema
  if (!schema.required?.includes('summary')) {
    throw new Error(`Collection '${collectionName}' schema must include a 'summary' property`)
  }

  // Get the collection
  const collection = await getDynamicCollection(collectionName)

  // Fetch only id and summary fields for all non-deleted documents
  const deletedFilter = {
    $or: [{ deleted: { $ne: true } }, { deleted: { $exists: false } }]
  }
  const summaries = (await collection
    .find(deletedFilter, { projection: { summary: 1, _id: 1 } })
    .toArray()) as unknown as SummaryRecord[]

  return summaries
}

/**
 * Gets a formatted string representation of all summaries in a collection
 * Useful for providing a quick overview to AI models
 *
 * @param collectionName The name of the collection to summarize
 * @returns Promise resolving to a formatted string of all summaries
 */
export async function getFormattedCollectionSummary(collectionName: string): Promise<string> {
  const summaries = await summarizeCollection(collectionName)

  if (summaries.length === 0) {
    return `Collection '${collectionName}' is empty.`
  }

  const summaryLines = summaries.map((record) => `[${record._id}]: ${record.summary}`)

  return [`Collection '${collectionName}' contains ${summaries.length} records:`, ...summaryLines].join('\n')
}
