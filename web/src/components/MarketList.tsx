import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTrading } from '@context/TradingContext';
import { formatNumber, formatPercent } from '@lib/utils';

const MarketList = () => {
  const { markets, selectedMarket, selectMarket } = useTrading();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');

  const filteredMarkets = useMemo(() => {
    let list = markets;
    if (query) {
      list = list.filter(market => market.symbol.toLowerCase().includes(query.toLowerCase()));
    }
    if (filter === 'gainers') {
      list = list.filter(market => market.chgPct >= 0);
    }
    if (filter === 'losers') {
      list = list.filter(market => market.chgPct < 0);
    }
    return list;
  }, [markets, query, filter]);

  const onRowClick = (symbol: string) => {
    selectMarket(symbol);
    navigate(`/spot/${symbol}`);
  };

  const renderIcon = (base: string) => (
    <svg width="24" height="24" style={{ marginRight: 10 }}>
      <use href={`#coin-${base.toLowerCase()}`} />
    </svg>
  );

  return (
    <div className="panel">
      <div className="card-title" style={{ marginBottom: 16 }}>
        <span>{t('markets')}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${filter === 'all' ? 'btn-buy' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          <button className={`btn ${filter === 'gainers' ? 'btn-buy' : ''}`} onClick={() => setFilter('gainers')}>
            {t('topGainers')}
          </button>
          <button className={`btn ${filter === 'losers' ? 'btn-sell' : ''}`} onClick={() => setFilter('losers')}>
            {t('topLosers')}
          </button>
        </div>
      </div>
      <input
        className="input"
        placeholder={t('search') ?? 'Search'}
        value={query}
        onChange={event => setQuery(event.target.value)}
        style={{ marginBottom: 12 }}
      />
      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>{t('markets')}</th>
              <th style={{ textAlign: 'right' }}>{t('price')}</th>
              <th style={{ textAlign: 'right' }}>{t('change')}</th>
              <th style={{ textAlign: 'right' }}>{t('volume')}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filteredMarkets.map(market => (
                <motion.tr
                  key={market.symbol}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => onRowClick(market.symbol)}
                  style={{
                    cursor: 'pointer',
                    background: selectedMarket?.symbol === market.symbol ? 'rgba(234, 179, 8, 0.1)' : 'transparent'
                  }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {renderIcon(market.base)}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{market.base}/{market.quote}</span>
                        <small style={{ color: 'var(--subtext)' }}>{market.symbol}</small>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(market.last, market.last > 100 ? 2 : 4)}</td>
                  <td style={{ textAlign: 'right', color: market.chgPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {formatPercent(market.chgPct)}
                  </td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(market.vol, 2)}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketList;
