import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const faqs = [
  { question: 'How does the offline demo work?', answer: 'All market data and actions are simulated locally with zero network calls.' },
  { question: 'Can I connect my wallet?', answer: 'This is a closed offline preview. Wallet integrations are disabled intentionally.' },
  { question: 'Is trading live?', answer: 'No. Orders and fills are synthetic to showcase the CoinoWin experience.' }
];

const SupportPage = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="panel">
      <div className="card-title">
        <span>{t('support')}</span>
      </div>
      <div className="status-banner" style={{ marginBottom: 16 }}>
        {t('offline')}
      </div>
      <h2>{t('faqTitle')}</h2>
      <div className="accordion">
        {faqs.map((item, index) => (
          <div key={item.question} className="accordion-item" onClick={() => setOpen(open === index ? null : index)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{item.question}</strong>
              <span>{open === index ? '−' : '+'}</span>
            </div>
            {open === index && <p style={{ marginTop: 12, color: 'var(--muted)' }}>{item.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportPage;
