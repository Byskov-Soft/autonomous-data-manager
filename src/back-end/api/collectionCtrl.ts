import { Request, Response, RequestHandler } from 'express'
import { getDataFromCollection } from '../persistence/CollectionDataPersistence.js'
import { getCollectionTypeByCollectionName } from '../persistence/CollectionTypePersistence.js'

/**
 * Retrieves all entries from a specific collection
 * @param req Request with collection_name as query parameter
 * @param res Response object
 * @param next Next function
 */
export const getCollectionEntries: RequestHandler = async (req, res, next) => {
  try {
    const collectionName = req.params.collectionName

    if (!collectionName) {
      res.status(400).json({
        error: 'Collection name is required'
      })
      return
    }

    // Verify collection exists
    const collectionType = await getCollectionTypeByCollectionName(collectionName)
    if (!collectionType) {
      res.status(404).json({
        error: `Collection '${collectionName}' does not exist`
      })
      return
    }

    // Get all entries from the collection
    const result = await getDataFromCollection({
      collectionName,
      queryType: 'range',
      limit: 100 // Set a reasonable limit for initial implementation
    })

    res.json({
      collection_name: collectionName,
      entries: result.records || []
    })
  } catch (error) {
    next(error)
  }
}
