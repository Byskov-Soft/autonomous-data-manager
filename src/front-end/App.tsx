import { ThemeProvider, CssBaseline, Container, Typography, Box, IconButton } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import { CollectionsPage } from './components/Collections'
import { useState, useMemo } from 'react'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2'
          },
          secondary: {
            main: '#dc004e'
          },
          background: {
            default: mode === 'light' ? '#f5f7fa' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e'
          }
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: 'background-color 0.3s ease'
              }
            }
          }
        }
      }),
    [mode]
  )

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h3" component="h1">
              AI Autonomous Data Manager
            </Typography>
            <IconButton onClick={toggleColorMode} color="inherit" sx={{ ml: 2 }}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
          <Typography variant="h6" color="text.secondary">
            Data View Interface aszdfasdfasfd
            <CollectionsPage />
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  )
}
