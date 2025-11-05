import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrading } from '@context/TradingContext';
import type { OrderSide, OrderType } from '@lib/types';
import { useUI } from '@context/UIContext';

const TradeForm = () => {
  const { t } = useTranslation();
  const { selectedMarket, placeOrder } = useTrading();
  const { showToast } = useUI();
  const [type, setType] = useState<OrderType>('limit');
  const [side, setSide] = useState<OrderSide>('buy');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('0.01');

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
      showToast(t('invalidQty'), 'error');
      return;
    }
    const order = await placeOrder({
      symbol: selectedMarket.symbol,
      type,
      side,
      price: type === 'limit' ? Number(price) : undefined,
      qty: numericQty
    });
    showToast(`${order.side.toUpperCase()} ${order.symbol} • ${order.status.toUpperCase()}`, 'success');
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
        <div className="tab-bar" role="tablist">
          <button
            type="button"
            className={type === 'market' ? 'active' : ''}
            onClick={() => setType('market')}
            role="tab"
            aria-selected={type === 'market'}
          >
            {t('market')}
          </button>
          <button
            type="button"
            className={type === 'limit' ? 'active' : ''}
            onClick={() => setType('limit')}
            role="tab"
            aria-selected={type === 'limit'}
          >
            {t('limit')}
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          className={`btn btn-success ${side === 'buy' ? '' : 'btn-muted'}`}
          onClick={() => setSide('buy')}
        >
          {t('buy')}
        </button>
        <button
          type="button"
          className={`btn btn-danger ${side === 'sell' ? '' : 'btn-muted'}`}
          onClick={() => setSide('sell')}
        >
          {t('sell')}
        </button>
      </div>
      <label style={{ display: 'block', marginBottom: 12 }}>
        <span style={{ display: 'block', marginBottom: 6, color: 'var(--muted)' }}>{t('price')}</span>
        <input
          className="input"
          value={price}
          onChange={event => setPrice(event.target.value)}
          disabled={type === 'market'}
        />
      </label>
      <label style={{ display: 'block', marginBottom: 16 }}>
        <span style={{ display: 'block', marginBottom: 6, color: 'var(--muted)' }}>{t('amount')}</span>
        <input className="input" value={qty} onChange={event => setQty(event.target.value)} />
      </label>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, color: 'var(--muted)', fontSize: 12 }}>
        <span>{t('estTotal', { defaultValue: 'Est. total' })}</span>
        <strong style={{ color: 'var(--text)' }}>
          {selectedMarket ? `${formatEstimatedTotal(Number(price), Number(qty), selectedMarket.quote)}` : '—'}
        </strong>
      </div>
      <button type="submit" className="btn btn-cta">
        {t('submit')}
      </button>
    </motion.form>
  );
};

const formatEstimatedTotal = (price: number, qty: number, currency: string) => {
  if (!price || !qty) return '—';
  const total = price * qty;
  return `${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};

export default TradeForm;
