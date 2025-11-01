import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Market, Order, OrderInput, Timeframe, WalletAsset } from '@lib/types';
import { getWallet, listMarkets, listOrders, placeOrder as placeOrderApi } from '@api';

interface TradingContextProps {
  markets: Market[];
  selectedMarket?: Market;
  selectMarket: (symbol: string) => void;
  orders: Order[];
  placeOrder: (order: OrderInput) => Promise<Order>;
  refreshOrders: () => Promise<void>;
  wallet: WalletAsset[];
  refreshWallet: () => Promise<void>;
  timeframe: Timeframe;
  setTimeframe: (timeframe: Timeframe) => void;
}

const TradingContext = createContext<TradingContextProps | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wallet, setWallet] = useState<WalletAsset[]>([]);
  const [timeframe, setTimeframeState] = useState<Timeframe>('1h');

  useEffect(() => {
    listMarkets().then(data => {
      setMarkets(data);
      if (!selectedSymbol && data.length) {
        setSelectedSymbol(data[0].symbol);
      }
    });
    refreshOrders();
    refreshWallet();
  }, []);

  const selectMarket = (symbol: string) => setSelectedSymbol(symbol);

  const placeOrder = async (orderInput: OrderInput) => {
    const order = await placeOrderApi(orderInput);
    setOrders(prev => [order, ...prev]);
    return order;
  };

  const refreshOrders = async () => {
    const data = await listOrders();
    setOrders(data);
  };

  const refreshWallet = async () => {
    const data = await getWallet();
    setWallet(data);
  };

  const value = useMemo(
    () => ({
      markets,
      selectedMarket: markets.find(market => market.symbol === selectedSymbol),
      selectMarket,
      orders,
      placeOrder,
      refreshOrders,
      wallet,
      refreshWallet,
      timeframe,
      setTimeframe: setTimeframeState
    }),
    [markets, selectedSymbol, orders, wallet, timeframe]
  );

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within TradingProvider');
  }
  return context;
};
