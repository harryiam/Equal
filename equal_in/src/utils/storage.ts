import { Watchlist } from '../types';

const STORAGE_KEY = 'crypto_watchlists';

export const saveWatchlists = (watchlists: Watchlist[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists));
};

export const loadWatchlists = (): Watchlist[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};