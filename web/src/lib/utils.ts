import { Order, Trade } from './types';

export const formatNumber = (value: number, digits = 2): string =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

export const formatPrice = (value: number, digits = 2) => formatNumber(value, digits);

export const formatQty = (value: number) => formatNumber(value, 4);

export const formatPercent = (value: number) =>
  `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

export const formatTimestamp = (ts: number) =>
  new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const formatDate = (ts: number) =>
  new Date(ts).toLocaleString();

export const sumOrdersValue = (orders: Order[]) =>
  orders.reduce((total, order) => total + order.qty * (order.price ?? 0), 0);

export const tradesToCSV = (orders: Order[]) => {
  const header = 'id,symbol,type,side,price,qty,status,createdAt\n';
  const rows = orders
    .map(order => [
      order.id,
      order.symbol,
      order.type,
      order.side,
      order.price ?? '',
      order.qty,
      order.status,
      new Date(order.createdAt).toISOString()
    ].join(','))
    .join('\n');
  return header + rows;
};

export const downloadCSV = (filename: string, data: string) => {
  const url = `data:text/csv;charset=utf-8,${encodeURIComponent(data)}`;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
};

export const nextOrderStatus = (): Order['status'] => {
  const statuses: Order['status'][] = ['open', 'filled'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

export const decorateTrades = (trades: Trade[]) =>
  trades.map(trade => ({ ...trade, key: `${trade.ts}-${trade.price}` }));
