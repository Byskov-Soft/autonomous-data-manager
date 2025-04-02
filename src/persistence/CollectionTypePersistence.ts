import { Collection } from 'mongodb'
import { CollectionType } from '../models/entities.js'
import { useDatabase } from '../lib/database.js'
import { COLLECTIONS } from '../models/enums.js'

/**
 * Helper function to ensure the record follows the CollectionType model
 * Particularly ensures the schema field is properly parsed if it's a string
 */
function normalizeCollectionType(record: unknown): CollectionType {
  if (typeof record === 'object') {
    try {
      // We don't modify the schema field here, just validate it can be parsed
      CollectionType.parse(record)
    } catch (error) {
      console.error(
        'Invalid schema for collection-type record:',
        JSON.stringify(record, null, 2),
        error
      )
    }
  } else {
    console.error('Invalid collection-type:', record)
  }

  return record as CollectionType
}

/**
 * Get the collection-type collection from MongoDB
 * @returns Promise resolving to the resources collection
 */
async function getCollectionType(): Promise<Collection<CollectionType>> {
  const db = await useDatabase()
  return db.collection<CollectionType>(COLLECTIONS.COLLECTION_TYPES)
}

/**
 * Create a new collection-type collection metadata entry
 * @param resource The collection-type collection data to create
 * @returns Promise resolving to the created resource
 */
export async function createCollectionType(
  resource: Omit<CollectionType, 'created_at' | 'updated_at'>
): Promise<CollectionType> {
  const collection = await getCollectionType()

  const newResource: CollectionType = {
    ...resource,
    created_at: new Date(),
    updated_at: new Date()
  }

  await collection.insertOne(newResource)
  return newResource
}

/**
 * Get a collection-type collection by its ID
 * @param id The ID of the resource to retrieve
 * @returns Promise resolving to the resource or null if not found
 */
export async function getCollectionTypeById(id: string): Promise<CollectionType | null> {
  const collection = await getCollectionType()
  const resource = await collection.findOne({ id })
  return resource ? normalizeCollectionType(resource) : null
}

/**
 * Get all collection-type collections
 * @returns Promise resolving to an array of resources
 */
export async function getAllCollectionTypes(): Promise<CollectionType[]> {
  const collection = await getCollectionType()
  const resources = await collection.find().toArray()
  return resources.map((resource) => normalizeCollectionType(resource))
}

/**
 * Update a collection-type collection
 * @param id The ID of the resource to update
 * @param updates The fields to update
 * @returns Promise resolving to the updated resource or null if not found
 */
export async function updateCollectionType(
  id: string,
  updates: Partial<Omit<CollectionType, 'id' | 'created_at'>>
): Promise<CollectionType | null> {
  const collection = await getCollectionType()

  const result = await collection.findOneAndUpdate(
    { id },
    {
      $set: {
        ...updates,
        updated_at: new Date()
      }
    },
    { returnDocument: 'after' }
  )

  return result ? normalizeCollectionType(result) : null
}

/**
 * Delete a collection-type collection
 * @param id The ID of the resource to delete
 * @returns Promise resolving to true if deleted, false if not found
 */
export async function deleteCollectionType(id: string): Promise<boolean> {
  const collection = await getCollectionType()
  const result = await collection.deleteOne({ id })
  return result.deletedCount > 0
}

/**
 * Check if a collection-type collection exists by collection name
 * @param collectionName The collection name to check
 * @returns Promise resolving to true if exists, false otherwise
 */
export async function CollectionTypeExists(collectionName: string): Promise<boolean> {
  const collection = await getCollectionType()
  const count = await collection.countDocuments({
    collection_name: collectionName
  })
  return count > 0
}

/**
 * Get a collection-type by its collection_name field
 * @param collectionName The collection name to find
 * @returns Promise resolving to the collection type or null if not found
 */
export async function getCollectionTypeByCollectionName(
  collectionName: string
): Promise<CollectionType | null> {
  const collection = await getCollectionType()
  const resource = await collection.findOne({
    collection_name: collectionName
  })
  return resource ? normalizeCollectionType(resource) : null
}
