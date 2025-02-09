import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Stack
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { WatchlistState, Cryptocurrency } from '../types';
import { saveWatchlists } from '../utils/storage';
import { initializeWebSocket } from '../services/api';

interface WatchlistManagerProps {
  watchlistState: WatchlistState;
  setWatchlistState: React.Dispatch<React.SetStateAction<WatchlistState>>;
}

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({ watchlistState, setWatchlistState }) => {
  const [newWatchlistName, setNewWatchlistName] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);
  const [prices, setPrices] = React.useState<Record<string, Cryptocurrency>>({});
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [selectedWatchlistForMenu, setSelectedWatchlistForMenu] = React.useState<string | null>(null);

  React.useEffect(() => {
    const allSymbols = watchlistState.watchlists.flatMap(w => w.coins);
    if (allSymbols.length === 0) return;

    const ws = initializeWebSocket(allSymbols, (data) => {
      if (data.s) {
        setPrices(prev => ({
          ...prev,
          [data.s.replace('USDT', '')]: {
            symbol: data.s.replace('USDT', ''),
            price: data.c,
            priceChange: data.p,
            priceChangePercent: data.P
          }
        }));
      }
    });

    return () => ws.close();
  }, [watchlistState.watchlists]);

  const handleCreateWatchlist = () => {
    if (!newWatchlistName.trim()) return;

    const newWatchlist = {
      id: uuidv4(),
      name: newWatchlistName,
      coins: []
    };

    const updatedWatchlists = [...watchlistState.watchlists, newWatchlist];
    setWatchlistState({
      watchlists: updatedWatchlists,
      selectedWatchlist: newWatchlist.id
    });
    saveWatchlists(updatedWatchlists);
    setNewWatchlistName('');
    setOpenDialog(false);
  };

  const handleDeleteWatchlist = (id: string) => {
    const updatedWatchlists = watchlistState.watchlists.filter(w => w.id !== id);
    setWatchlistState({
      watchlists: updatedWatchlists,
      selectedWatchlist: updatedWatchlists[0]?.id || null
    });
    saveWatchlists(updatedWatchlists);
    setMenuAnchor(null);
  };

  const handleRemoveCoin = (watchlistId: string, symbol: string) => {
    const updatedWatchlists = watchlistState.watchlists.map(watchlist => {
      if (watchlist.id === watchlistId) {
        return {
          ...watchlist,
          coins: watchlist.coins.filter(coin => coin !== symbol)
        };
      }
      return watchlist;
    });

    setWatchlistState({
      ...watchlistState,
      watchlists: updatedWatchlists
    });
    saveWatchlists(updatedWatchlists);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLDivElement>, watchlistId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedWatchlistForMenu(watchlistId);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedWatchlistForMenu(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Your Watchlists</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Watchlist
        </Button>
      </Box>

      {watchlistState.watchlists.length > 0 ? (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={watchlistState.selectedWatchlist}
              onChange={(_, value) => setWatchlistState({ ...watchlistState, selectedWatchlist: value })}
              variant="scrollable"
              scrollButtons="auto"
            >
              {watchlistState.watchlists.map((watchlist) => (
                <Tab
                  key={watchlist.id}
                  value={watchlist.id}
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>{watchlist.name}</span>
                      <Box
                        component="div"
                        onClick={(e) => handleOpenMenu(e, watchlist.id)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.7 }
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </Box>
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {watchlistState.selectedWatchlist && (
            <List>
              {watchlistState.watchlists
                .find(w => w.id === watchlistState.selectedWatchlist)
                ?.coins.map((symbol) => (
                  <ListItem
                    key={symbol}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveCoin(watchlistState.selectedWatchlist!, symbol)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={symbol}
                      secondary={
                        prices[symbol] ? (
                          <React.Fragment>
                            <Typography component="span" variant="body2">
                              ${parseFloat(prices[symbol].price).toFixed(2)}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{
                                ml: 2,
                                color: parseFloat(prices[symbol].priceChangePercent) >= 0
                                  ? 'success.main'
                                  : 'error.main'
                              }}
                            >
                              {parseFloat(prices[symbol].priceChangePercent).toFixed(2)}%
                            </Typography>
                          </React.Fragment>
                        ) : 'Loading...'
                      }
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          No watchlists yet. Create one to get started!
        </Typography>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Watchlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Watchlist Name"
            fullWidth
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateWatchlist} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem 
          onClick={() => {
            if (selectedWatchlistForMenu) {
              handleDeleteWatchlist(selectedWatchlistForMenu);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Watchlist
        </MenuItem>
      </Menu>
    </Box>
  );
};