import { ObjectId } from 'mongodb'
import { getDynamicCollection, validateCollection } from '../common.js'

/**
 * Insert a document into a collection
 * @param collectionName The name of the collection to insert into
 * @param document The document to insert
 * @returns Promise resolving to the inserted document
 */
export async function insertIntoCollection(
  collectionName: string,
  document: Record<string, unknown>
): Promise<ObjectId> {
  await validateCollection(collectionName)
  const collection = await getDynamicCollection(collectionName)
  const result = await collection.insertOne(document)
  return result.insertedId
}
