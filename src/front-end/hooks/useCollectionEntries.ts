import { useState, useEffect } from 'react'

export const useCollectionEntries = (collectionName: string | null) => {
  const [entries, setEntries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEntries = async () => {
      if (!collectionName) {
        setEntries([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/collections/${collectionName}/entries`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setEntries(data.entries)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch collection entries'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [collectionName])

  return { entries, isLoading, error }
}
