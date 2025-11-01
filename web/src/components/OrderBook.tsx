import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getOrderbook } from '@api';
import { useTrading } from '@context/TradingContext';
import type { Orderbook } from '@lib/types';
import { formatNumber } from '@lib/utils';

const OrderBook = () => {
  const { selectedMarket } = useTrading();
  const { t } = useTranslation();
  const [orderbook, setOrderbook] = useState<Orderbook>();

  useEffect(() => {
    if (!selectedMarket) return;
    getOrderbook(selectedMarket.symbol).then(setOrderbook);
    const interval = setInterval(() => {
      getOrderbook(selectedMarket.symbol).then(setOrderbook);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedMarket?.symbol]);

  const maxQty = useMemo(() => {
    if (!orderbook) return 1;
    const all = [...orderbook.bids, ...orderbook.asks].map(level => level.qty);
    return Math.max(...all, 1);
  }, [orderbook]);

  return (
    <div className="panel orderbook-panel">
      <div className="card-title">
        <span>{t('orderBook')}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--subtext)', fontSize: 12 }}>
          <span>{t('price')}</span>
          <span>{t('amount')}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {orderbook?.asks.map(level => (
            <motion.div
              key={`ask-${level.price}`}
              layout
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 6px'
              }}
            >
              <span style={{ color: 'var(--red)' }}>{formatNumber(level.price)}</span>
              <span>{formatNumber(level.qty, 4)}</span>
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(90deg, rgba(239, 68, 68, 0.18) ${
                    (level.qty / maxQty) * 100
                  }%, transparent ${Math.min((level.qty / maxQty) * 100 + 20, 100)}%)`,
                  zIndex: -1,
                  borderRadius: 8
                }}
              />
            </motion.div>
          ))}
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {orderbook?.bids.map(level => (
            <motion.div
              key={`bid-${level.price}`}
              layout
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 6px'
              }}
            >
              <span style={{ color: 'var(--green)' }}>{formatNumber(level.price)}</span>
              <span>{formatNumber(level.qty, 4)}</span>
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(90deg, rgba(34, 197, 94, 0.18) ${
                    (level.qty / maxQty) * 100
                  }%, transparent ${Math.min((level.qty / maxQty) * 100 + 20, 100)}%)`,
                  zIndex: -1,
                  borderRadius: 8
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
