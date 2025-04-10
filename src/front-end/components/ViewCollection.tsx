import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import ReactMarkdown from 'react-markdown'
import { useCollectionEntries } from '../hooks/useCollectionEntries.js'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { useEffect, useState } from 'react'

interface ViewCollectionProps {
  collectionName: string
  expanded: boolean
  schema?: {
    type: string
    properties: {
      [key: string]: {
        type: string
        description?: string
      }
    }
    required?: string[]
  }
}

export const ViewCollection = ({ collectionName, expanded, schema }: ViewCollectionProps) => {
  const { entries, isLoading, error } = useCollectionEntries(collectionName)
  const [expandedPanels, setExpandedPanels] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // Update all panels when the expanded prop changes
    const newExpandedState = entries.reduce((acc, entry, index) => {
      const panelId = entry._id || `panel-${index}`
      acc[panelId] = expanded
      return acc
    }, {} as { [key: string]: boolean })
    setExpandedPanels(newExpandedState)
  }, [expanded, entries])

  const handleAccordionChange = (panelId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels((prev) => ({
      ...prev,
      [panelId]: isExpanded
    }))
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getEntryTitle = (entry: Record<string, any>): string => {
    // Common title field names to check
    const titleFields = ['title', 'name', 'id', 'summary', 'description']

    // Try to find a title field
    for (const field of titleFields) {
      if (entry[field] && typeof entry[field] === 'string') {
        return entry[field]
      }
    }

    // If no title field found, use the first available string field
    const firstField = Object.entries(entry).find(
      ([key, value]) => key !== '_id' && typeof value === 'string'
    )

    if (firstField) {
      const [_key, value] = firstField
      return String(value).substring(0, 40) + (String(value).length > 40 ? '...' : '')
    }

    // Fallback to entry ID or index
    return entry._id ? `Entry ${entry._id}` : 'Untitled Entry'
  }

  const renderValue = (value: any) => {
    if (value === null || value === undefined) {
      return <Typography color="text.secondary">null</Typography>
    }

    if (typeof value === 'object') {
      return (
        <Typography
          sx={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            maxWidth: '100%'
          }}
        >
          {JSON.stringify(value, null, 2)}
        </Typography>
      )
    }

    const stringValue = String(value)
    if (stringValue.length > 50) {
      return (
        <Box
          sx={{
            maxWidth: '100%',
            '& p': {
              m: 0,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              maxWidth: '100%'
            },
            '& p:not(:last-child)': { mb: 1 },
            '& pre': {
              whiteSpace: 'pre-wrap !important',
              wordWrap: 'break-word !important',
              overflowX: 'auto',
              maxWidth: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              padding: '8px',
              borderRadius: '4px',
              '& code': {
                whiteSpace: 'pre-wrap !important',
                wordBreak: 'break-all',
                overflowWrap: 'break-word'
              }
            },
            '& code': {
              whiteSpace: 'pre-wrap !important',
              wordBreak: 'break-all',
              overflowWrap: 'break-word',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              padding: '2px 4px',
              borderRadius: '4px'
            }
          }}
        >
          <ReactMarkdown>{stringValue}</ReactMarkdown>
        </Box>
      )
    }

    return (
      <Typography
        sx={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          maxWidth: '100%'
        }}
      >
        {stringValue}
      </Typography>
    )
  }

  const renderPropertyName = (key: string) => {
    if (key === '_id') return null
    const isRequired = schema?.required?.includes(key)

    return (
      <Typography
        sx={{
          textDecoration: 'underline',
          fontWeight: isRequired ? 'bold' : 'medium'
        }}
      >
        {key}
      </Typography>
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading entries: {error.message}
      </Alert>
    )
  }

  if (entries.length === 0) {
    return <Typography color="text.secondary">No entries found in this collection</Typography>
  }

  return (
    <Box>
      {entries.map((entry, entryIndex) => {
        const panelId = entry._id || `panel-${entryIndex}`
        return (
          <Accordion
            key={panelId}
            sx={{ mb: 1 }}
            expanded={expandedPanels[panelId] ?? false}
            onChange={handleAccordionChange(panelId)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="bold" sx={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                {getEntryTitle(entry)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
              {Object.entries(entry).map(([key, value]) => {
                const propertyName = renderPropertyName(key)
                if (!propertyName) return null // Skip _id field
                return (
                  <Box key={key} sx={{ mb: 2, width: '100%', maxWidth: '100%' }}>
                    {propertyName}
                    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>{renderValue(value)}</Box>
                  </Box>
                )
              })}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                <IconButton
                  onClick={scrollToTop}
                  size="small"
                  aria-label="scroll to top"
                  title="Scroll to top"
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    const accordionEl = e.currentTarget.closest('.MuiAccordion-root') as HTMLElement
                    if (accordionEl) {
                      const summary = accordionEl.querySelector('.MuiAccordionSummary-root') as HTMLElement
                      if (summary) summary.click()
                    }
                  }}
                  size="small"
                  aria-label="close entry"
                  title="Close entry"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </Box>
  )
}
