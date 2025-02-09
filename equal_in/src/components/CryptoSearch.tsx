import React from 'react';
import {
  TextField,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { searchCryptocurrencies } from '../services/api';
import { Cryptocurrency, WatchlistState } from '../types';
import { saveWatchlists } from '../utils/storage';

interface CryptoSearchProps {
  watchlistState: WatchlistState;
  setWatchlistState: React.Dispatch<React.SetStateAction<WatchlistState>>;
}

export const CryptoSearch: React.FC<CryptoSearchProps> = ({ watchlistState, setWatchlistState }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      const results = await searchCryptocurrencies(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching cryptocurrencies:', error);
      setSnackbar({
        open: true,
        message: 'Failed to search cryptocurrencies',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = (symbol: string) => {
    if (!watchlistState.selectedWatchlist) {
      setSnackbar({
        open: true,
        message: 'Please select or create a watchlist first',
        severity: 'error'
      });
      return;
    }

    const updatedWatchlists = watchlistState.watchlists.map(watchlist => {
      if (watchlist.id === watchlistState.selectedWatchlist) {
        // Check if coin already exists in the watchlist
        if (watchlist.coins.includes(symbol)) {
          setSnackbar({
            open: true,
            message: `${symbol} is already in the watchlist`,
            severity: 'error'
          });
          return watchlist;
        }
        
        return {
          ...watchlist,
          coins: [...watchlist.coins, symbol]
        };
      }
      return watchlist;
    });

    setWatchlistState({
      ...watchlistState,
      watchlists: updatedWatchlists
    });
    saveWatchlists(updatedWatchlists);
    
    setSnackbar({
      open: true,
      message: `Added ${symbol} to watchlist`,
      severity: 'success'
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Search Cryptocurrencies
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by symbol (e.g., BTC)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading || !searchQuery.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
      </Box>

      {searchResults.length > 0 ? (
        <List>
          {searchResults.map((crypto) => (
            <ListItem
              key={crypto.symbol}
              secondaryAction={
                <Button
                  variant="outlined"
                  onClick={() => addToWatchlist(crypto.symbol)}
                  disabled={!watchlistState.selectedWatchlist}
                >
                  Add to Watchlist
                </Button>
              }
            >
              <ListItemText
                primary={crypto.symbol}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2">
                      ${parseFloat(crypto.price).toFixed(2)}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{
                        ml: 2,
                        color: parseFloat(crypto.priceChangePercent) >= 0
                          ? 'success.main'
                          : 'error.main'
                      }}
                    >
                      {parseFloat(crypto.priceChangePercent).toFixed(2)}%
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        searchQuery && !loading && (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
            No results found
          </Typography>
        )
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};