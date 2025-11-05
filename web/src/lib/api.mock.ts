import marketsData from '@mock/markets.json';
import orderbooksData from '@mock/orderbooks.json';
import tradesData from '@mock/trades.json';
import candlesBTC1H from '@mock/candles_BTCUSDT_1h.json';
import candlesETH1H from '@mock/candles_ETHUSDT_1h.json';
import userData from '@mock/user.json';

import type {
  Candle,
  Market,
  Order,
  OrderInput,
  Orderbook,
  OrderbookLevel,
  Timeframe,
  Trade,
  WalletAsset
} from './types';
import { nextOrderStatus } from './utils';

const delay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

const candleMap: Record<string, Candle[]> = {
  BTCUSDT: (candlesBTC1H as number[][]).map(c => ({ ts: c[0], open: c[1], high: c[2], low: c[3], close: c[4] })),
  ETHUSDT: (candlesETH1H as number[][]).map(c => ({ ts: c[0], open: c[1], high: c[2], low: c[3], close: c[4] }))
};

const timeframeOffsets: Record<Timeframe, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '4h': 14400,
  '1d': 86400
};

const ensureCandles = (symbol: string, timeframe: Timeframe): Candle[] => {
  const base = candleMap[symbol] ?? candleMap.BTCUSDT;
  if (timeframe === '1h') {
    return base;
  }
  const step = timeframeOffsets[timeframe];
  return base.map((candle, idx) => {
    const variance = 1 + (Math.sin(idx) * 0.01 + Math.random() * 0.01);
    const spread = Math.max(1, (candle.high - candle.low) * (timeframe === '1d' ? 1.6 : 0.6));
    const open = candle.open * variance;
    const close = candle.close * (variance + (Math.random() - 0.5) * 0.02);
    const high = Math.max(open, close) + spread * 0.5;
    const low = Math.min(open, close) - spread * 0.5;
    return {
      ts: candle.ts + idx * (step - timeframeOffsets['1h']),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2))
    };
  });
};

const parseOrderbook = (symbol: string): Orderbook => {
  const bookMap = orderbooksData as Record<string, { bids: number[][]; asks: number[][] }>;
  const raw = bookMap[symbol] || bookMap[symbol.split('USDT')[0] + 'USDT'];
  const toLevel = (arr: number[][]): OrderbookLevel[] => arr.map(level => ({ price: level[0], qty: level[1] }));
  if (!raw) {
    const market = (marketsData as Market[]).find(m => m.symbol === symbol);
    const center = market?.last ?? 100;
    const generate = (dir: 'bids' | 'asks') =>
      Array.from({ length: 10 }).map((_, idx) => {
        const price = dir === 'bids' ? center - idx * 0.1 : center + idx * 0.1;
        return [Number(price.toFixed(2)), Number((Math.random() * 10).toFixed(2))];
      });
    return {
      bids: toLevel(generate('bids')),
      asks: toLevel(generate('asks'))
    };
  }
  return {
    bids: toLevel(raw.bids),
    asks: toLevel(raw.asks)
  };
};

const tradeMap: Record<string, Trade[]> = Object.entries(tradesData as Record<string, any[]>).reduce(
  (acc, [symbol, trades]) => {
    acc[symbol] = trades.map(trade => ({ ...trade }));
    return acc;
  },
  {} as Record<string, Trade[]>
);

let orders: Order[] = (userData.orders as Order[]).map(order => ({ ...order }));

export const listMarkets = async (): Promise<Market[]> => {
  await delay();
  return (marketsData as Market[]).map(market => ({ ...market }));
};

export const getOrderbook = async (symbol: string): Promise<Orderbook> => {
  await delay();
  return parseOrderbook(symbol);
};

export const getTrades = async (symbol: string): Promise<Trade[]> => {
  await delay();
  return tradeMap[symbol] ? [...tradeMap[symbol]] : [];
};

export const getCandles = async (symbol: string, timeframe: Timeframe): Promise<Candle[]> => {
  await delay();
  return ensureCandles(symbol, timeframe);
};

export const placeOrder = async (orderInput: OrderInput): Promise<Order> => {
  await delay(220);
  const order: Order = {
    ...orderInput,
    id: `ORD-${Date.now()}`,
    createdAt: Date.now(),
    status: nextOrderStatus()
  };
  orders = [order, ...orders];
  tradeMap[orderInput.symbol] = [
    {
      ts: Math.floor(order.createdAt / 1000),
      price: order.price ?? (marketsData as Market[]).find(m => m.symbol === order.symbol)?.last ?? 0,
      qty: order.qty,
      side: order.side
    },
    ...(tradeMap[orderInput.symbol] ?? [])
  ].slice(0, 50);
  return order;
};

export const listOrders = async (): Promise<Order[]> => {
  await delay();
  return [...orders];
};

export const getWallet = async (): Promise<WalletAsset[]> => {
  await delay();
  return (userData.wallet as WalletAsset[]).map(asset => ({ ...asset }));
};

export const listMarketsSync = (): Market[] => (marketsData as Market[]).map(m => ({ ...m }));
