import { useEffect, useState } from 'react';
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
        <small>{t('soundOff', { defaultValue: 'tick sound off' })}</small>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
        <span>{t('time')}</span>
        <span>{t('price')}</span>
        <span>{t('amount')}</span>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, maxHeight: 320 }}>
        <div className="trade-feed" aria-live="polite">
          {trades.map(trade => (
            <div key={`${trade.ts}-${trade.price}-${trade.qty}`} className="trade-row" data-side={trade.side}>
              <span style={{ color: 'var(--muted)' }}>{formatTimestamp(trade.ts)}</span>
              <span>{formatNumber(trade.price)}</span>
              <span style={{ color: 'var(--text)' }}>{formatNumber(trade.qty, 4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradesTape;
