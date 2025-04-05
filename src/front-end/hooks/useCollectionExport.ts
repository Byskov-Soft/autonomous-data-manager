import { useState } from 'react'

interface UseCollectionExportProps {
  collectionId: string
}

export const useCollectionExport = ({ collectionId }: UseCollectionExportProps) => {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPdf = async () => {
    if (!collectionId) return

    try {
      setIsExporting(true)

      const response = await fetch(`/api/collections/${collectionId}/export`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf'
        }
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement('a')
      link.href = url
      link.download = `collection-export.pdf` // The actual filename will come from Content-Disposition

      // Append to document, click, and cleanup
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      // You might want to add error handling UI here
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportToPdf,
    isExporting
  }
}
