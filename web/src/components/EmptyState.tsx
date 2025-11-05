import { useTranslation } from 'react-i18next';

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <svg width="80" height="80" style={{ marginBottom: 16 }}>
        <use href="#coin-btc" />
      </svg>
      <h2 style={{ margin: 0 }}>{t('chooseMarket')}</h2>
      <p style={{ color: 'var(--muted)' }}>{t('networkNotice')}</p>
    </div>
  );
};

export default EmptyState;
