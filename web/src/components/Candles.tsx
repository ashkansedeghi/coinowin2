import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getCandles } from '@api';
import { useTrading } from '@context/TradingContext';
import type { Candle, Timeframe } from '@lib/types';

const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

const Candles = () => {
  const { selectedMarket, timeframe, setTimeframe } = useTrading();
  const { t } = useTranslation();
  const [candles, setCandles] = useState<Candle[]>([]);

  useEffect(() => {
    if (!selectedMarket) return;
    getCandles(selectedMarket.symbol, timeframe).then(setCandles);
  }, [selectedMarket?.symbol, timeframe]);

  const [minPrice, maxPrice] = useMemo(() => {
    if (!candles.length) return [0, 0];
    const lows = candles.map(c => c.low);
    const highs = candles.map(c => c.high);
    return [Math.min(...lows), Math.max(...highs)];
  }, [candles]);

  const height = 280;
  const width = Math.max(600, candles.length * 18);

  const scaleY = (price: number) => {
    if (maxPrice === minPrice) return height / 2;
    return height - ((price - minPrice) / (maxPrice - minPrice)) * height;
  };

  return (
    <div className="panel chart-panel">
      <div className="card-title">
        <span>{selectedMarket?.symbol}</span>
        <div className="tab-bar">
          {timeframes.map(tf => (
            <button key={tf} className={timeframe === tf ? 'active' : ''} onClick={() => setTimeframe(tf)}>
              {tf}
            </button>
          ))}
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad-line" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(234, 179, 8, 0.2)" />
              <stop offset="100%" stopColor="rgba(6, 78, 59, 0.05)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={width} height={height} fill="url(#grad-line)" />
          {candles.map((candle, index) => {
            const x = index * 18 + 6;
            const openY = scaleY(candle.open);
            const closeY = scaleY(candle.close);
            const highY = scaleY(candle.high);
            const lowY = scaleY(candle.low);
            const bullish = candle.close >= candle.open;
            const color = bullish ? 'var(--green)' : 'var(--red)';
            const bodyTop = bullish ? closeY : openY;
            const bodyBottom = bullish ? openY : closeY;
            return (
              <g key={`${candle.ts}-${index}`}>
                <line x1={x + 3} x2={x + 3} y1={highY} y2={lowY} stroke={color} strokeWidth={1.5} />
                <rect
                  x={x}
                  width={6}
                  y={bodyTop}
                  height={Math.max(4, bodyBottom - bodyTop)}
                  fill={color}
                  rx={2}
                />
              </g>
            );
          })}
        </svg>
      </motion.div>
    </div>
  );
};

export default Candles;
