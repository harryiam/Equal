import axios from 'axios';
import { Cryptocurrency } from '../types';

const BINANCE_API_BASE_URL = 'https://api.binance.com/api/v3';

export const searchCryptocurrencies = async (query: string): Promise<Cryptocurrency[]> => {
  try {
    const response = await axios.get(`${BINANCE_API_BASE_URL}/ticker/24hr`);
    const data = response.data;
    
    // Filter symbols that contain USDT and match the query
    return data
      .filter((coin: any) => 
        coin.symbol.toLowerCase().includes('usdt') &&
        coin.symbol.toLowerCase().includes(query.toLowerCase())
      )
      .map((coin: any) => ({
        symbol: coin.symbol.replace('USDT', ''),  // Remove USDT from display
        price: coin.lastPrice,
        priceChange: coin.priceChange,
        priceChangePercent: coin.priceChangePercent
      }))
      .slice(0, 10);  // Limit to top 10 results
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    return [];
  }
};

export const initializeWebSocket = (symbols: string[], onMessage: (data: any) => void) => {
  const ws = new WebSocket('wss://stream.binance.com:9443/ws');

  const subscribeMessage = {
    method: 'SUBSCRIBE',
    params: symbols.map(symbol => `${symbol.toLowerCase()}usdt@ticker`),
    id: 1
  };

  ws.onopen = () => {
    ws.send(JSON.stringify(subscribeMessage));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  return ws;
};