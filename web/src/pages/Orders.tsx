import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTrading } from '@context/TradingContext';
import { downloadCSV, tradesToCSV, formatNumber, formatDate } from '@lib/utils';

const OrdersPage = () => {
  const { orders } = useTrading();
  const { t } = useTranslation();

  const csv = useMemo(() => tradesToCSV(orders), [orders]);

  return (
    <div className="panel">
      <div className="card-title">
        <span>{t('orders')}</span>
        <button className="btn" style={{ background: 'var(--brand)', color: '#0b0f10' }} onClick={() => downloadCSV('coinoWin-orders.csv', csv)}>
          {t('exportCsv')}
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
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
            {orders.map(order => (
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

export default OrdersPage;
