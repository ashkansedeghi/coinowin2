import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@context/SettingsContext';
import { useTrading } from '@context/TradingContext';
import { formatPrice, formatPercent } from '@lib/utils';

const Header = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage, currency, setCurrency } = useSettings();
  const { selectedMarket } = useTrading();
  const navigate = useNavigate();

  return (
    <header className="main-header">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>CoinoWin</h1>
          <span className="badge-offline">{t('offline')}</span>
        </div>
        {selectedMarket && (
          <div className="header-meta">
            <strong>{selectedMarket.symbol}</strong>
            <span>
              {t('lastPrice')}: <strong style={{ color: 'var(--brand-2)' }}>
                {formatPrice(selectedMarket.last, selectedMarket.last > 100 ? 2 : 4)}
              </strong>
            </span>
            <span style={{ color: selectedMarket.chgPct >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
              {selectedMarket.chgPct >= 0 ? '↑' : '↓'} {formatPercent(selectedMarket.chgPct)}
            </span>
          </div>
        )}
      </div>
      <div className="header-actions">
        <button className="btn" type="button" onClick={toggleTheme}>
          {theme === 'dark' ? t('light') : t('dark')}
        </button>
        <select
          className="select"
          value={language}
          onChange={event => setLanguage(event.target.value as 'en' | 'fa')}
        >
          <option value="en">{t('english')}</option>
          <option value="fa">{t('persian')}</option>
        </select>
        <select
          className="select"
          value={currency}
          onChange={event => setCurrency(event.target.value as 'USD' | 'IRR')}
        >
          <option value="USD">USD</option>
          <option value="IRR">IRR</option>
        </select>
        <button className="btn btn-cta" type="button" onClick={() => navigate('/support')}>
          {t('support')}
        </button>
      </div>
    </header>
  );
};

export default Header;
