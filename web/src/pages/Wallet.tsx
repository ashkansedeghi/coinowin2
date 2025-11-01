import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Portfolio from '@components/Portfolio';

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
  const [modal, setModal] = useState<{ type: 'deposit' | 'withdraw'; symbol: string } | null>(null);

  const qr = useMemo(() => (modal ? generateQR(`${modal.type.toUpperCase()}-${modal.symbol}-COINOWIN`) : ''), [modal]);

  return (
    <div style={{ position: 'relative' }}>
      <Portfolio
        withActions
        onAction={(type, symbol) => {
          setModal({ type, symbol });
        }}
      />
      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
          onClick={() => setModal(null)}
        >
          <div
            className="panel"
            style={{ width: 360, textAlign: 'center' }}
            onClick={event => event.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>{modal.type === 'deposit' ? t('deposit') : t('withdraw')} {modal.symbol}</h2>
            <p style={{ color: 'var(--subtext)' }}>{t('offline')}</p>
            <img src={qr} alt={`${modal.type} QR`} style={{ width: 200, height: 200, margin: '12px auto' }} />
            <button className="btn" style={{ background: 'var(--brand)', color: '#0b0f10' }} onClick={() => setModal(null)}>
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
