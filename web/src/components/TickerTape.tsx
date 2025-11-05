import { useMemo } from 'react';
import { useTrading } from '@context/TradingContext';
import { formatNumber, formatPercent } from '@lib/utils';

const TickerTape = () => {
  const { markets } = useTrading();

  const items = useMemo(() => {
    if (!markets.length) {
      return [];
    }
    const highlight = markets.slice(0, 12);
    return [...highlight, ...highlight];
  }, [markets]);

  if (!markets.length) {
    return null;
  }

  return (
    <div className="ticker-tape" aria-hidden="false">
      <div className="ticker-track">
        {items.map((market, index) => {
          const trend = market.chgPct >= 0 ? 'up' : 'down';
          return (
            <span key={`${market.symbol}-${index}`} className="ticker-item" data-trend={trend}>
              <strong>{market.symbol}</strong>
              <span>{formatNumber(market.last, market.last > 100 ? 2 : 4)}</span>
              <span>{trend === 'up' ? '↑' : '↓'} {formatPercent(market.chgPct)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default TickerTape;
