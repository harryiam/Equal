export interface Cryptocurrency {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
}

export interface Watchlist {
  id: string;
  name: string;
  coins: string[];
}

export interface WatchlistState {
  watchlists: Watchlist[];
  selectedWatchlist: string | null;
}