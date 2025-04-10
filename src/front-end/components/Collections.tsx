import { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ExpandMore from '@mui/icons-material/SwapVerticalCircle'
import ExpandLess from '@mui/icons-material/SwapVerticalCircleOutlined'
import { useCollectionTypes } from '../hooks/useCollectionTypes.js'
import { useCollectionExport } from '../hooks/useCollectionExport.js'
import { ViewCollection } from './ViewCollection.js'

export const CollectionsPage = () => {
  const { collectionTypes, isLoading: typesLoading, error: typesError, refetch } = useCollectionTypes()
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  const [expandCollection, setExpandCollection] = useState<boolean>(false)

  const selectedType = collectionTypes.find((ct) => ct.collection_name === selectedCollection)

  const toggleCollectionDataView = () => {
    setExpandCollection(!expandCollection)
  }

  const { exportToPdf, isExporting } = useCollectionExport({
    collectionId: selectedType?.id || ''
  })

  if (typesLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (typesError) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">Error loading collections: {typesError.message}</Alert>
        </Box>
      </Container>
    )
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h1">
            Collections
          </Typography>
          <Tooltip title="Reload collections">
            <IconButton onClick={() => refetch()} disabled={typesLoading} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Available Collections
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {collectionTypes.map((collection) => (
              <Chip
                key={collection.id}
                label={collection.name}
                onClick={() => setSelectedCollection(collection.collection_name)}
                color={selectedCollection === collection.collection_name ? 'primary' : 'default'}
                clickable
              />
            ))}
          </Box>
        </Paper>

        {selectedCollection && (
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" gutterBottom>
                Collection Data
              </Typography>
              <Tooltip title="Export to PDF" placement={'top'}>
                <IconButton onClick={() => exportToPdf()} disabled={isExporting} size="small">
                  <PictureAsPdfIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={expandCollection ? 'Close All' : 'Open All'} placement={'top'}>
                <IconButton onClick={toggleCollectionDataView} size="small">
                  {expandCollection ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Tooltip>
            </Box>

            <ViewCollection
              collectionName={selectedCollection}
              schema={selectedType?.schema}
              expanded={expandCollection}
            />
          </Box>
        )}
      </Box>
    </Container>
  )
}
