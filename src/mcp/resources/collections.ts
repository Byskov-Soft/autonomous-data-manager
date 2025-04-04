import { ReadResourceResult, Resource } from '@modelcontextprotocol/sdk/types.js'
import { getAllCollectionTypes, deleteCollectionType } from '../../persistence/CollectionTypePersistence.js'
import { getDynamicCollection } from '../../persistence/CollectionDataPersistence.js'

/**
 * Collections resource info
 */
export const collectionsResourceSchema: Resource = {
  uri: 'data://collections',
  name: 'Available Collections',
  description: 'Metadata about available collections (see schema attribute)',
  mimeType: 'text/plain'
}

/**
 * Retrieves the contents of the collections resource
 */
export async function readCollectionsResource(): Promise<ReadResourceResult> {
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
        console.log(
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
        uri: 'data://collections',
        mimeType: 'text/plain',
        name: 'Available Collections',

        text: JSON.stringify(sortedCollections)
      }
    ]
  }
}
