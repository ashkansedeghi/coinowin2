import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getTrades } from '@api';
import { useTrading } from '@context/TradingContext';
import type { Trade } from '@lib/types';
import { formatNumber, formatTimestamp } from '@lib/utils';

const TradesTape = () => {
  const { selectedMarket } = useTrading();
  const { t } = useTranslation();
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (!selectedMarket) return;
    getTrades(selectedMarket.symbol).then(setTrades);
    const interval = setInterval(() => {
      getTrades(selectedMarket.symbol).then(setTrades);
    }, 3500);
    return () => clearInterval(interval);
  }, [selectedMarket?.symbol]);

  return (
    <div className="panel trade-panel">
      <div className="card-title">
        <span>{t('recentTrades')}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--subtext)', marginBottom: 6 }}>
        <span>{t('time')}</span>
        <span>{t('price')}</span>
        <span>{t('amount')}</span>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, maxHeight: 320 }}>
        <AnimatePresence initial={false}>
          {trades.map(trade => (
            <motion.div
              key={`${trade.ts}-${trade.price}-${trade.qty}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 4px',
                borderBottom: '1px solid rgba(255,255,255,0.04)'
              }}
            >
              <span style={{ color: 'var(--subtext)' }}>{formatTimestamp(trade.ts)}</span>
              <span style={{ color: trade.side === 'buy' ? 'var(--green)' : 'var(--red)' }}>{formatNumber(trade.price)}</span>
              <span>{formatNumber(trade.qty, 4)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TradesTape;
