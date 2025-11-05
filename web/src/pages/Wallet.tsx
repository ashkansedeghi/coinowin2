import { useTranslation } from 'react-i18next';
import Portfolio from '@components/Portfolio';
import { useUI } from '@context/UIContext';

const generateQR = (payload: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
    <rect width='200' height='200' fill='#fff'/>
    <text x='100' y='100' font-size='12' dominant-baseline='middle' text-anchor='middle' fill='#064e3b'>${payload}</text>
    <rect x='20' y='20' width='40' height='40' fill='#0b0f10'/>
    <rect x='140' y='20' width='40' height='40' fill='#0b0f10'/>
    <rect x='20' y='140' width='40' height='40' fill='#0b0f10'/>
    <rect x='80' y='80' width='40' height='40' fill='#0b0f10'/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const WalletPage = () => {
  const { t } = useTranslation();
  const { openModal, closeModal } = useUI();

  return (
    <div style={{ position: 'relative' }}>
      <Portfolio
        withActions
        onAction={(type, symbol) => {
          const title = `${type === 'deposit' ? t('deposit') : t('withdraw')} ${symbol}`;
          const code = generateQR(`${type.toUpperCase()}-${symbol}-COINOWIN`);
          openModal({
            title,
            content: (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)' }}>{t('offline')}</p>
                <img
                  src={code}
                  alt={`${type} ${symbol}`}
                  style={{ width: 200, height: 200, margin: '12px auto', borderRadius: 'var(--radius-2)' }}
                />
              </div>
            ),
            actions: (
              <button type="button" className="btn btn-cta" onClick={closeModal}>
                {t('close')}
              </button>
            )
          });
        }}
      />
    </div>
  );
};

export default WalletPage;
