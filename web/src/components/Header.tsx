import { useTranslation } from 'react-i18next';
import { useSettings } from '@context/SettingsContext';
import { useTrading } from '@context/TradingContext';
import { formatPrice, formatPercent } from '@lib/utils';

const Header = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage, currency, setCurrency } = useSettings();
  const { selectedMarket } = useTrading();

  return (
    <header className="main-header">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>CoinoWin</h1>
          <span className="badge-offline">{t('offline')}</span>
        </div>
        {selectedMarket && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--subtext)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{selectedMarket.symbol}</span>
            <span>{t('lastPrice')}: <strong style={{ color: 'var(--brand)' }}>
              {formatPrice(selectedMarket.last, selectedMarket.last > 100 ? 2 : 4)}
            </strong></span>
            <span style={{ color: selectedMarket.chgPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {formatPercent(selectedMarket.chgPct)}
            </span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn" style={{ background: 'rgba(234, 179, 8, 0.12)', color: 'var(--brand)' }} onClick={toggleTheme}>
          {theme === 'dark' ? t('light') : t('dark')}
        </button>
        <select
          className="select"
          style={{ width: 120 }}
          value={language}
          onChange={event => setLanguage(event.target.value as 'en' | 'fa')}
        >
          <option value="en">{t('english')}</option>
          <option value="fa">{t('persian')}</option>
        </select>
        <select
          className="select"
          style={{ width: 120 }}
          value={currency}
          onChange={event => setCurrency(event.target.value as 'USD' | 'IRR')}
        >
          <option value="USD">USD</option>
          <option value="IRR">IRR</option>
        </select>
      </div>
    </header>
  );
};

export default Header;
