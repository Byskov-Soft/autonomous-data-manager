import { Collection, ObjectId } from "mongodb";
import { useDatabase } from "../service/database.js";
import { getCollectionTypeByCollectionName } from "./persistCollectionType.js";

/**
 * Get a dynamic collection by its name
 * @param collectionName The name of the collection to retrieve
 * @returns Promise resolving to the MongoDB collection
 */
export async function getDynamicCollection(
  collectionName: string
): Promise<Collection> {
  const db = await useDatabase();
  return db.collection(collectionName);
}

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
  // Ensure collection exists in our registry
  const collectionType = await getCollectionTypeByCollectionName(
    collectionName
  );
  if (!collectionType) {
    throw new Error(
      `Collection '${collectionName}' does not exist in registry`
    );
  }

  // Get the collection and insert document
  const collection = await getDynamicCollection(collectionName);
  const result = await collection.insertOne(document);
  return result.insertedId;
}

/**
 * Find documents in a collection
 * @param collectionName The name of the collection to query
 * @param query The MongoDB query
 * @returns Promise resolving to an array of documents
 */
export async function findInCollection(
  collectionName: string,
  query: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  const collection = await getDynamicCollection(collectionName);
  // Add deleted:false to query to exclude deleted records
  const finalQuery = {
    ...query,
    $or: [{ deleted: { $ne: true } }, { deleted: { $exists: false } }],
  };
  return await collection.find(finalQuery).toArray();
}

/**
 * Update documents in a collection
 * @param collectionName The name of the collection to update
 * @param query The MongoDB query to select documents
 * @param update The MongoDB update operation
 * @returns Promise resolving to the number of documents updated
 */
export async function updateInCollection(
  collectionName: string,
  query: Record<string, unknown>,
  update: Record<string, unknown>
): Promise<number> {
  const collection = await getDynamicCollection(collectionName);
  const result = await collection.updateMany(query, { $set: update });
  return result.modifiedCount;
}

/**
 * Delete documents in a collection
 * @param collectionName The name of the collection to delete from
 * @param query The MongoDB query to select documents to delete
 * @returns Promise resolving to the number of documents deleted
 */
export async function deleteInCollection(
  collectionName: string,
  query: Record<string, unknown>
): Promise<number> {
  const collection = await getDynamicCollection(collectionName);
  const result = await collection.deleteMany(query);
  return result.deletedCount;
}

/**
 * Retrieves data from a collection based on query parameters
 * @param options Query options for retrieving collection data
 * @returns Object containing records or count depending on query type
 */
export async function getDataFromCollection({
  collectionName,
  queryType,
  attribute,
  value,
  limit,
}: {
  collectionName: string;
  queryType: string;
  attribute?: string;
  value?: any;
  limit?: number;
}): Promise<{ records?: any[]; count?: number }> {
  // Ensure collection exists in our registry
  const collectionType = await getCollectionTypeByCollectionName(
    collectionName
  );
  if (!collectionType) {
    throw new Error(
      `Collection '${collectionName}' does not exist in registry`
    );
  }

  const collection = await getDynamicCollection(collectionName);

  // Add deleted filter to all queries
  const deletedFilter = {
    $or: [{ deleted: { $ne: true } }, { deleted: { $exists: false } }],
  };

  // Handle different query types
  switch (queryType) {
    case "count":
      const count = await collection.countDocuments(deletedFilter);
      return { count };

    case "range":
      // Get latest records, limited by the provided limit or default
      const rangeRecords = await collection
        .find(deletedFilter)
        .sort({ _id: -1 }) // Sort by _id descending to get latest records
        .limit(limit || 30)
        .toArray();
      return { records: rangeRecords };

    case "value":
      // Case-insensitive partial match
      const valueQuery: Record<string, any> = {
        ...deletedFilter,
        [attribute as string]: { $regex: value, $options: "i" },
      };
      const valueRecords = await collection
        .find(valueQuery)
        .limit(limit || 30)
        .toArray();
      return { records: valueRecords };

    case "value_exact":
      // Exact match
      const exactQuery: Record<string, any> = {
        ...deletedFilter,
        [attribute as string]: value,
      };
      const exactRecords = await collection
        .find(exactQuery)
        .limit(limit || 30)
        .toArray();
      return { records: exactRecords };

    default:
      throw new Error(`Invalid query type: ${queryType}`);
  }
}
