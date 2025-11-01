import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrading } from '@context/TradingContext';
import type { OrderSide, OrderType } from '@lib/types';

const TradeForm = () => {
  const { t } = useTranslation();
  const { selectedMarket, placeOrder } = useTrading();
  const [type, setType] = useState<OrderType>('limit');
  const [side, setSide] = useState<OrderSide>('buy');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('0.01');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (selectedMarket) {
      const decimals = selectedMarket.last > 100 ? 2 : 4;
      setPrice(selectedMarket.last.toFixed(decimals));
    }
  }, [selectedMarket?.symbol]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedMarket) return;
    const numericQty = Number(qty);
    if (!numericQty || numericQty <= 0) {
      setFeedback(t('invalidQty'));
      return;
    }
    const order = await placeOrder({
      symbol: selectedMarket.symbol,
      type,
      side,
      price: type === 'limit' ? Number(price) : undefined,
      qty: numericQty
    });
    setFeedback(`${order.side.toUpperCase()} ${order.symbol} • ${order.status.toUpperCase()}`);
  };

  return (
    <motion.form
      className="panel"
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="card-title">
        <span>{t('spot')}</span>
        <div className="tab-bar">
          <button type="button" className={type === 'market' ? 'active' : ''} onClick={() => setType('market')}>
            {t('market')}
          </button>
          <button type="button" className={type === 'limit' ? 'active' : ''} onClick={() => setType('limit')}>
            {t('limit')}
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
        <button
          type="button"
          className={`btn btn-buy ${side === 'buy' ? '' : 'muted'}`}
          onClick={() => setSide('buy')}
        >
          {t('buy')}
        </button>
        <button
          type="button"
          className={`btn btn-sell ${side === 'sell' ? '' : 'muted'}`}
          onClick={() => setSide('sell')}
        >
          {t('sell')}
        </button>
      </div>
      <label style={{ display: 'block', marginBottom: 12 }}>
        <span style={{ display: 'block', marginBottom: 6, color: 'var(--subtext)' }}>{t('price')}</span>
        <input
          className="input"
          value={price}
          onChange={event => setPrice(event.target.value)}
          disabled={type === 'market'}
        />
      </label>
      <label style={{ display: 'block', marginBottom: 12 }}>
        <span style={{ display: 'block', marginBottom: 6, color: 'var(--subtext)' }}>{t('amount')}</span>
        <input className="input" value={qty} onChange={event => setQty(event.target.value)} />
      </label>
      <button type="submit" className={side === 'buy' ? 'btn btn-buy' : 'btn btn-sell'}>
        {t('submit')}
      </button>
      {feedback && (
        <p style={{ marginTop: 12, color: 'var(--brand)' }}>{feedback}</p>
      )}
    </motion.form>
  );
};

export default TradeForm;
