import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getOrderbook } from '@api';
import { useTrading } from '@context/TradingContext';
import type { Orderbook } from '@lib/types';
import { formatNumber } from '@lib/utils';

const OrderBook = () => {
  const { selectedMarket } = useTrading();
  const { t } = useTranslation();
  const [orderbook, setOrderbook] = useState<Orderbook>();
  const [flashes, setFlashes] = useState<Record<string, { trend: 'up' | 'down'; stamp: number }>>({});
  const previousRef = useRef<Orderbook>();

  useEffect(() => {
    if (!selectedMarket) return;
    getOrderbook(selectedMarket.symbol).then(setOrderbook);
    const interval = setInterval(() => {
      getOrderbook(selectedMarket.symbol).then(setOrderbook);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedMarket?.symbol]);

  const triggerFlash = useCallback((key: string, trend: 'up' | 'down') => {
    const stamp = Date.now();
    setFlashes(prev => ({ ...prev, [key]: { trend, stamp } }));
    const clear = () => {
      setFlashes(prev => {
        const next = { ...prev };
        if (next[key]?.stamp === stamp) {
          delete next[key];
        }
        return next;
      });
    };
    if (typeof window !== 'undefined') {
      window.setTimeout(clear, 420);
    } else {
      setTimeout(clear, 420);
    }
  }, []);

  useEffect(() => {
    if (!orderbook) return;
    const previous = previousRef.current;
    if (previous) {
      (['asks', 'bids'] as const).forEach(side => {
        orderbook[side].forEach(level => {
          const key = `${side}-${level.price}`;
          const prevLevel = previous[side].find(item => item.price === level.price);
          if (!prevLevel) {
            triggerFlash(key, 'up');
          } else if (level.qty !== prevLevel.qty) {
            triggerFlash(key, level.qty > prevLevel.qty ? 'up' : 'down');
          }
        });
      });
    }
    previousRef.current = orderbook;
  }, [orderbook, triggerFlash]);

  const maxQty = useMemo(() => {
    if (!orderbook) return 1;
    const all = [...orderbook.bids, ...orderbook.asks].map(level => level.qty);
    return Math.max(...all, 1);
  }, [orderbook]);

  return (
    <div className="panel orderbook-panel">
      <div className="card-title">
        <span>{t('orderBook')}</span>
        <small>{t('depthView', { defaultValue: 'Depth 25 levels' })}</small>
      </div>
      <div className="orderbook-header">
        <span>{t('price')}</span>
        <span>{t('amount')}</span>
      </div>
      <div className="orderbook-levels" aria-live="polite">
        {orderbook?.asks.map(level => {
          const key = `asks-${level.price}`;
          const flash = flashes[key];
          const style: CSSProperties & { '--intensity': string } = {
            '--intensity': Math.min(level.qty / maxQty, 1).toFixed(2)
          } as CSSProperties & { '--intensity': string };
          if (flash) {
            style.animation = `${flash.trend === 'up' ? 'up' : 'down'} 420ms var(--ease)`;
          }
          return (
            <div key={key} className="orderbook-row" data-side="ask" style={style}>
              <span>{formatNumber(level.price)}</span>
              <span>{formatNumber(level.qty, 4)}</span>
            </div>
          );
        })}
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
      <div className="orderbook-levels" aria-live="polite">
        {orderbook?.bids.map(level => {
          const key = `bids-${level.price}`;
          const flash = flashes[key];
          const style: CSSProperties & { '--intensity': string } = {
            '--intensity': Math.min(level.qty / maxQty, 1).toFixed(2)
          } as CSSProperties & { '--intensity': string };
          if (flash) {
            style.animation = `${flash.trend === 'up' ? 'up' : 'down'} 420ms var(--ease)`;
          }
          return (
            <div key={key} className="orderbook-row" data-side="bid" style={style}>
              <span>{formatNumber(level.price)}</span>
              <span>{formatNumber(level.qty, 4)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderBook;
