import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Candles from '@components/Candles';
import OrderBook from '@components/OrderBook';
import TradesTape from '@components/TradesTape';
import TradeForm from '@components/TradeForm';
import EmptyState from '@components/EmptyState';
import { useTrading } from '@context/TradingContext';
import { formatDate, formatNumber } from '@lib/utils';

const SpotOrdersPanel = () => {
  const { orders, selectedMarket } = useTrading();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'open' | 'order' | 'trade'>('open');

  const filtered = orders.filter(order => {
    if (!selectedMarket) return true;
    return order.symbol === selectedMarket.symbol;
  });

  const view = filtered.filter(order => {
    if (tab === 'open') return order.status === 'open';
    if (tab === 'trade') return order.status === 'filled';
    return true;
  });

  return (
    <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="tab-bar">
        <button className={tab === 'open' ? 'active' : ''} onClick={() => setTab('open')}>
          {t('openOrders')}
        </button>
        <button className={tab === 'order' ? 'active' : ''} onClick={() => setTab('order')}>
          {t('orderHistory')}
        </button>
        <button className={tab === 'trade' ? 'active' : ''} onClick={() => setTab('trade')}>
          {t('tradeHistory')}
        </button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <table className="table">
          <thead>
            <tr>
              <th>{t('markets')}</th>
              <th>{t('type')}</th>
              <th>{t('price')}</th>
              <th>{t('amount')}</th>
              <th>{t('status')}</th>
              <th>{t('date')}</th>
            </tr>
          </thead>
          <tbody>
            {view.map(order => (
              <tr key={order.id}>
                <td>{order.symbol}</td>
                <td>{order.side.toUpperCase()} {order.type.toUpperCase()}</td>
                <td>{order.price ? formatNumber(order.price) : '—'}</td>
                <td>{formatNumber(order.qty, 4)}</td>
                <td>{order.status}</td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SpotPage = () => {
  const { symbol } = useParams();
  const { selectedMarket, selectMarket } = useTrading();

  useEffect(() => {
    if (symbol) {
      selectMarket(symbol);
    }
  }, [symbol]);

  if (!selectedMarket) {
    return <EmptyState />;
  }

  return (
    <div className="spot-layout">
      <div className="chart-panel">
        <Candles />
        <TradeForm />
      </div>
      <OrderBook />
      <div className="trade-panel">
        <TradesTape />
        <SpotOrdersPanel />
      </div>
    </div>
  );
};

export default SpotPage;
