import { Request, Response, RequestHandler } from 'express'
import { useDatabase } from '../lib/database.js'
import { z } from 'zod'
import { CollectionType } from '../../shared/models/entities.js'

/**
 * Schema for the projected collection type data
 */
const ProjectedCollectionType = CollectionType.pick({
  _id: true,
  id: true,
  name: true,
  collection_name: true,
  description: true,
  schema: true
})

type ProjectedCollectionType = z.infer<typeof ProjectedCollectionType>

/**
 * Retrieves all collection types from the database with selected fields
 * @returns Array of validated collection types with basic information
 */
export const getCollectionTypes: RequestHandler = async (_req, res, next) => {
  try {
    console.log('Getting collection types')
    const db = await useDatabase()

    // Get all collection types with projected fields
    const rawCollections = await db
      .collection<CollectionType>('collection_types')
      .find(
        {},
        {
          projection: {
            _id: 1,
            id: 1,
            name: 1,
            collection_name: 1,
            description: 1,
            schema: 1
          }
        }
      )
      .toArray()

    // Parse and validate the results using the Zod schema
    const validatedCollections = z.array(ProjectedCollectionType).parse(rawCollections)
    console.log('validatedCollections', validatedCollections)
    res.json({
      collection_types: validatedCollections
    })
  } catch (error) {
    next(error) // Pass any errors to Express error handler
  }
}
