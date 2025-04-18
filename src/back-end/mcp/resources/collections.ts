import { ReadResourceResult, Resource } from '@modelcontextprotocol/sdk/types.js'
import { getAllCollectionTypes, deleteCollectionType } from '../../persistence/collection-types.js'
import { getDynamicCollection } from '../../persistence/index.js'
import { RESOURCE_NAME } from '../../models/enums.js'
import { useLogger } from '../../lib/logger.js'

/**
 * Retrieves the contents of the collections resource
 */
export async function readCollectionsResource(): Promise<ReadResourceResult> {
  const log = useLogger()

  // Get all resource collections
  const collections = await getAllCollectionTypes()

  // Filter out collections that don't exist in MongoDB and clean up their metadata
  const existingCollections = await Promise.all(
    collections.map(async (collection) => {
      try {
        const mongoCollection = await getDynamicCollection(collection.collection_name)

        // Check if collection exists by trying to list its indexes
        const hasIndexes = await mongoCollection.listIndexes().hasNext()

        if (!hasIndexes) {
          throw new Error('Collection has no indexes')
        }
        return collection
      } catch (error) {
        log.error(
          `Collection ${collection.collection_name} does not exist in MongoDB, removing its type record`
        )
        // Delete the collection type record since the actual collection doesn't exist
        await deleteCollectionType(collection.id)
        return null
      }
    })
  )

  // Remove null entries and sort by created_at in descending order
  const sortedCollections = existingCollections
    .filter((collection): collection is NonNullable<typeof collection> => collection !== null)
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, 20)

  return {
    contents: [
      {
        uri: `data://${RESOURCE_NAME.COLLECTIONS}`,
        mimeType: 'text/plain',
        name: 'Available Collections',
        text: JSON.stringify(sortedCollections)
      }
    ]
  }
}
