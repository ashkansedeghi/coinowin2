import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const createSparkline = (symbol: string, price: number, change: number) => {
    const length = 16;
    const seed = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const amplitude = Math.max(Math.abs(change) / 100, 0.015);
    const points = Array.from({ length }, (_, index) => {
      const angle = (index + seed) * 0.35;
      return price * (1 + Math.sin(angle) * amplitude);
    });
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const coords = points.map((value, index) => {
      const x = (index / (length - 1)) * 100;
      const y = 32 - ((value - min) / range) * 32;
      return [x, y];
    });
    const path = coords.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    const area = `M0,32 ${coords.map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`).join(' ')} L100,32 Z`;
    return { path, area };
  };

  const renderIcon = (base: string) => (
    <svg width="28" height="28">
      <use href={`#coin-${base.toLowerCase()}`} />
    </svg>
  );

  return (
    <div className="panel">
      <div className="card-title">
        <span>{t('markets')}</span>
        <div className="tab-bar">
          <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            {t('all', { defaultValue: 'All' })}
          </button>
          <button type="button" className={filter === 'gainers' ? 'active' : ''} onClick={() => setFilter('gainers')}>
            {t('topGainers')}
          </button>
          <button type="button" className={filter === 'losers' ? 'active' : ''} onClick={() => setFilter('losers')}>
            {t('topLosers')}
          </button>
        </div>
      </div>
      <input
        className="input"
        placeholder={t('search') ?? 'Search'}
        value={query}
        onChange={event => setQuery(event.target.value)}
        style={{ marginBottom: 16 }}
        aria-label={t('search') ?? 'Search markets'}
      />
      <div className="market-grid" role="list">
        {filteredMarkets.length === 0 &&
          Array.from({ length: 6 }).map((_, index) => <div key={index} className="skel" aria-hidden="true" />)}
        {filteredMarkets.map(market => {
          const trend = market.chgPct >= 0 ? 'up' : 'down';
          const sparkline = createSparkline(market.symbol, market.last, market.chgPct);
          return (
            <article
              key={market.symbol}
              className={`market-card ${selectedMarket?.symbol === market.symbol ? 'is-active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => onRowClick(market.symbol)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onRowClick(market.symbol);
                }
              }}
            >
              <div className="market-card-header">
                <div className="pair-meta">
                  {renderIcon(market.base)}
                  <div>
                    <div style={{ fontWeight: 600 }}>{market.base}/{market.quote}</div>
                    <small style={{ color: 'var(--muted)' }}>{market.symbol}</small>
                  </div>
                </div>
                <span className="market-change" data-trend={trend}>
                  {trend === 'up' ? '↑' : '↓'} {formatPercent(market.chgPct)}
                </span>
              </div>
              <div className="market-card-body">
                <span className="market-price">{formatNumber(market.last, market.last > 100 ? 2 : 4)}</span>
                <svg className="sparkline" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
                  <path className="sparkline-area" d={sparkline.area} fill={trend === 'up' ? 'var(--success)' : 'var(--danger)'} />
                  <path d={sparkline.path} stroke={trend === 'up' ? 'var(--success)' : 'var(--danger)'} />
                </svg>
              </div>
              <div className="market-card-footer">
                <span>{t('volume')}: {formatNumber(market.vol, 2)}</span>
                <button
                  type="button"
                  className="btn btn-cta"
                  onClick={event => {
                    event.stopPropagation();
                    onRowClick(market.symbol);
                  }}
                >
                  {t('trade')}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default MarketList;
