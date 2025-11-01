export interface Market {
  symbol: string;
  base: string;
  quote: string;
  last: number;
  chgPct: number;
  vol: number;
}

export interface Candle {
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Trade {
  ts: number;
  price: number;
  qty: number;
  side: 'buy' | 'sell';
}

export interface OrderbookLevel {
  price: number;
  qty: number;
}

export interface Orderbook {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';

export interface OrderInput {
  symbol: string;
  type: OrderType;
  side: OrderSide;
  price?: number;
  qty: number;
}

export interface Order extends OrderInput {
  id: string;
  createdAt: number;
  status: 'open' | 'filled' | 'cancelled';
}

export interface WalletAsset {
  symbol: string;
  name: string;
  balance: number;
  available: number;
  locked: number;
  icon: string;
}

export interface UserProfile {
  name: string;
  email: string;
  tier: string;
  wallet: WalletAsset[];
  orders: Order[];
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
