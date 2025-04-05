import { Express } from 'express'
import { getCollectionTypes } from './collectionTypesCtrl.js'
import { getCollectionEntries } from './collectionCtrl.js'
import { exportCollection } from './exportCtrl.js'

export const applyApi = (app: Express) => {
  app.get('/api/collection-types', getCollectionTypes)
  app.get('/api/collections/:collectionName/entries', getCollectionEntries)
  app.get('/api/collections/:collectionTypeId/export', exportCollection)
}
