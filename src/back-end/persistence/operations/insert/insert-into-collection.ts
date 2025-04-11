import { ObjectId } from 'mongodb'
import { getDynamicCollection, validateCollection, getNextOrderNumber } from '../common.js'

// Cache to store the last used order number for each collection
const orderCache: Record<string, number> = {}

/**
 * Gets the expected next order number, using cache when possible
 * @param collectionName The name of the collection
 * @returns Promise resolving to the expected next order number
 */
async function getExpectedNextOrder(collectionName: string): Promise<number> {
  if (!(collectionName in orderCache)) {
    orderCache[collectionName] = await getNextOrderNumber(collectionName)
  }
  return orderCache[collectionName]
}

/**
 * Insert a document into a collection
 * @param collectionName The name of the collection to insert into
 * @param document The document to insert
 * @returns Promise resolving to the inserted document
 * @throws Error if order is missing or not the expected next value
 */
export async function insertIntoCollection(
  collectionName: string,
  document: Record<string, unknown>
): Promise<ObjectId> {
  await validateCollection(collectionName)

  // Validate order number
  if (typeof document.order !== 'number') {
    throw new Error('Document must include an "order" field of type number')
  }

  const expectedOrder = await getExpectedNextOrder(collectionName)
  if (document.order !== expectedOrder) {
    throw new Error(`Invalid order number. Expected ${expectedOrder}, got ${document.order}`)
  }

  // Update cache with the used order number
  orderCache[collectionName] = document.order + 1

  const collection = await getDynamicCollection(collectionName)
  const result = await collection.insertOne(document)
  return result.insertedId
}
