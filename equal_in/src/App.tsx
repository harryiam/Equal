import React from 'react';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Container,
  Box,
  Typography,
  Paper
} from '@mui/material';
import { WatchlistManager } from './components/WatchlistManager';
import { CryptoSearch } from './components/CryptoSearch';
import { loadWatchlists } from './utils/storage';
import { WatchlistState } from './types';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C3AED',
    },
    secondary: {
      main: '#10B981',
    },
    background: {
      default: '#111827',
      paper: '#1F2937',
    },
  },
});

const App: React.FC = () => {
  const [watchlistState, setWatchlistState] = React.useState<WatchlistState>({
    watchlists: [],
    selectedWatchlist: null,
  });

  React.useEffect(() => {
    const savedWatchlists = loadWatchlists();
    setWatchlistState({
      watchlists: savedWatchlists,
      selectedWatchlist: savedWatchlists[0]?.id || null,
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #7C3AED 30%, #10B981 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Crypto Watchlist
          </Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <CryptoSearch watchlistState={watchlistState} setWatchlistState={setWatchlistState} />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <WatchlistManager watchlistState={watchlistState} setWatchlistState={setWatchlistState} />
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;