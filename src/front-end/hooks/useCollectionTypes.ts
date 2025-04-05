import { useState, useEffect, useCallback } from 'react'

interface CollectionType {
  id: string
  name: string
  collection_name: string
  description: string
  schema: {
    type: 'object'
    properties: {
      summary: {
        type: string
      }
      [key: string]: any
    }
    required: string[]
  }
  _id?: string
}

export interface UseCollectionTypesReturn {
  collectionTypes: CollectionType[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useCollectionTypes = (): UseCollectionTypesReturn => {
  const [collectionTypes, setCollectionTypes] = useState<CollectionType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchCollectionTypes = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/collection-types')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setCollectionTypes(data.collection_types)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch collection types'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCollectionTypes()
  }, [fetchCollectionTypes])

  return {
    collectionTypes,
    isLoading,
    error,
    refetch: fetchCollectionTypes
  }
}
