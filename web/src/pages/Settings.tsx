import { useTranslation } from 'react-i18next';
import { useSettings } from '@context/SettingsContext';

const SettingsPage = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage, currency, setCurrency } = useSettings();

  return (
    <div className="panel">
      <div className="card-title">
        <span>{t('settings')}</span>
      </div>
      <div className="settings-grid">
        <div className="panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3>{t('theme')}</h3>
          <p style={{ color: 'var(--subtext)' }}>{theme === 'dark' ? t('dark') : t('light')}</p>
          <button className="btn" style={{ background: 'var(--brand)', color: '#0b0f10' }} onClick={toggleTheme}>
            {t('light')} / {t('dark')}
          </button>
        </div>
        <div className="panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3>{t('language')}</h3>
          <select className="select" value={language} onChange={event => setLanguage(event.target.value as 'en' | 'fa')}>
            <option value="en">{t('english')}</option>
            <option value="fa">{t('persian')}</option>
          </select>
        </div>
        <div className="panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3>{t('currency')}</h3>
          <select className="select" value={currency} onChange={event => setCurrency(event.target.value as 'USD' | 'IRR')}>
            <option value="USD">USD</option>
            <option value="IRR">IRR</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
