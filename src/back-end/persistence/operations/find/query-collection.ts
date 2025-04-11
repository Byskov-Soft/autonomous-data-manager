import { createBaseQuery, getDynamicCollection, validateCollection } from '../common.js'

/**
 * Retrieves data from a collection based on query parameters
 * @param options Query options for retrieving collection data
 * @returns Object containing records or count depending on query type
 */
export async function queryCollection({
  collectionName,
  queryType,
  attribute,
  value,
  limit
}: {
  collectionName: string
  queryType: string
  attribute?: string
  value?: any
  limit?: number
}): Promise<{ records?: any[]; count?: number }> {
  await validateCollection(collectionName)
  const collection = await getDynamicCollection(collectionName)
  const baseFilter = createBaseQuery()

  // Todo: Sort by order field

  switch (queryType) {
    case 'count':
      const count = await collection.countDocuments(baseFilter)
      return { count }

    case 'range':
      const rangeRecords = await collection
        .find(baseFilter)
        .sort({ order: 1, _id: -1 }) // Sort by order ascending, then _id desc
        .limit(limit || 30)
        .toArray()
      return { records: rangeRecords }

    case 'value':
      const valueQuery = {
        ...baseFilter,
        [attribute as string]: { $regex: value, $options: 'i' }
      }
      const valueRecords = await collection
        .find(valueQuery)
        .sort({ order: 1 }) // Sort by order ascending
        .limit(limit || 30)
        .toArray()
      return { records: valueRecords }

    case 'value_exact':
      const exactQuery = {
        ...baseFilter,
        [attribute as string]: value
      }
      const exactRecords = await collection
        .find(exactQuery)
        .sort({ order: 1 }) // Sort by order ascending
        .limit(limit || 30)
        .toArray()
      return { records: exactRecords }

    default:
      throw new Error(`Invalid query type: ${queryType}`)
  }
}
