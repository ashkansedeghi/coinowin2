import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTrading } from '@context/TradingContext';
import { formatNumber } from '@lib/utils';

interface PortfolioProps {
  withActions?: boolean;
  onAction?: (type: 'deposit' | 'withdraw', symbol: string) => void;
}

const Portfolio = ({ withActions = false, onAction }: PortfolioProps) => {
  const { wallet, refreshWallet } = useTrading();
  const { t } = useTranslation();

  useEffect(() => {
    if (!wallet.length) {
      refreshWallet();
    }
  }, []);

  const totalValue = wallet.reduce((sum, asset) => sum + asset.balance, 0);

  return (
    <div className="panel">
      <div className="card-title">
        <span>{t('portfolioValue')}</span>
        <span className="badge">${formatNumber(totalValue, 2)}</span>
      </div>
      <div className="wallet-grid">
        {wallet.map(asset => (
          <motion.div
            key={asset.symbol}
            className="wallet-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="28" height="28">
                <use href={`#coin-${asset.icon}`} />
              </svg>
              <div>
                <strong>{asset.symbol}</strong>
                <div style={{ color: 'var(--subtext)', fontSize: 12 }}>{asset.name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <span>{t('balance')}</span>
              <span>{formatNumber(asset.balance)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--subtext)' }}>
              <span>{t('available')}</span>
              <span>{formatNumber(asset.available)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--subtext)' }}>
              <span>{t('locked')}</span>
              <span>{formatNumber(asset.locked)}</span>
            </div>
            {withActions && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button className="btn btn-buy" type="button" onClick={() => onAction?.('deposit', asset.symbol)}>
                  {t('deposit')}
                </button>
                <button className="btn btn-sell" type="button" onClick={() => onAction?.('withdraw', asset.symbol)}>
                  {t('withdraw')}
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
