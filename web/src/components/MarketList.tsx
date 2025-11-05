import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTrading } from '@context/TradingContext';
import { formatPercent } from '@lib/utils';

type SortKey =
  | 'asset'
  | 'pair'
  | 'price'
  | 'depthPlus'
  | 'depthMinus'
  | 'volume'
  | 'vp'
  | 'liq'
  | 'updated';
type SortDir = 'asc' | 'desc';

type ConfidenceLevel = 'high' | 'mid' | 'low';

interface TableMarket {
  symbol: string;
  base: string;
  quote: string;
  pair: string;
  price: number;
  change: number;
  depthPlus: number;
  depthMinus: number;
  volumeUsd: number;
  liquidity: number;
  updated: number;
  volumePercent: number;
  confidence: ConfidenceLevel;
}

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const seededRandom = (value: string, offset = 0) => {
  const seed = hashString(`${value}-${offset}`);
  const random = Math.sin(seed) * 10000;
  return random - Math.floor(random);
};

const createDepthValue = (symbol: string, base: number, offset: number) => {
  const variance = seededRandom(symbol, offset);
  const intensity = 0.08 + variance * 0.22;
  return base * intensity;
};

const createLiquidityScore = (symbol: string) => {
  const score = 60 + seededRandom(symbol, 5) * 220;
  return Math.round(score);
};

const createUpdatedTimestamp = (symbol: string) => {
  const hoursAgo = 0.2 + seededRandom(symbol, 8) * 5.5;
  return Date.now() - hoursAgo * 3600 * 1000;
};

const formatUSD = (value: number, locale: string) => {
  if (!Number.isFinite(value)) {
    return '$0.00';
  }
  const abs = Math.abs(value);
  const options: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
  if (abs >= 1000) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  } else if (abs >= 1) {
    options.minimumFractionDigits = 2;
    options.maximumFractionDigits = 2;
  } else {
    options.minimumFractionDigits = 4;
    options.maximumFractionDigits = 6;
  }
  return value.toLocaleString(locale, options);
};

const formatCompact = (value: number, locale: string) =>
  Number(value || 0).toLocaleString(locale, { notation: 'compact', maximumFractionDigits: 1 });

const MarketList = () => {
  const { markets, selectedMarket, selectMarket } = useTrading();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [sortState, setSortState] = useState<{ key: SortKey; dir: SortDir }>({ key: 'volume', dir: 'desc' });
  const priceHistoryRef = useRef<Map<string, number>>(new Map());
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down'>>({});

  const baseRows = useMemo(() => {
    return markets.map(market => {
      const volumeUsd = Math.max(0, market.vol * market.last);
      const depthPlus = createDepthValue(market.symbol, volumeUsd, 2);
      const depthMinus = createDepthValue(market.symbol, volumeUsd, 3);
      const liquidity = createLiquidityScore(market.symbol);
      const updated = createUpdatedTimestamp(market.symbol);
      return {
        symbol: market.symbol,
        base: market.base,
        quote: market.quote,
        pair: `${market.base}/${market.quote}`,
        price: market.last,
        change: market.chgPct,
        depthPlus,
        depthMinus,
        volumeUsd,
        liquidity,
        updated
      };
    });
  }, [markets]);

  const rowsWithPercent = useMemo(() => {
    const totalVolume = baseRows.reduce((sum, row) => sum + row.volumeUsd, 0) || 1;
    return baseRows.map(row => {
      const volumePercent = (row.volumeUsd / totalVolume) * 100;
      let confidence: ConfidenceLevel = 'mid';
      if (volumePercent >= 14) {
        confidence = 'high';
      } else if (volumePercent < 6) {
        confidence = 'low';
      }
      return {
        ...row,
        volumePercent,
        confidence
      } as TableMarket;
    });
  }, [baseRows]);

  useEffect(() => {
    const visibleSymbols = new Set(rowsWithPercent.map(row => row.symbol));
    priceHistoryRef.current.forEach((_, symbol) => {
      if (!visibleSymbols.has(symbol)) {
        priceHistoryRef.current.delete(symbol);
      }
    });

    const updates: Array<[string, 'up' | 'down']> = [];
    rowsWithPercent.forEach(row => {
      const prevPrice = priceHistoryRef.current.get(row.symbol);
      if (prevPrice !== undefined && prevPrice !== row.price) {
        updates.push([row.symbol, row.price > prevPrice ? 'up' : 'down']);
      }
      priceHistoryRef.current.set(row.symbol, row.price);
    });

    if (!updates.length || typeof window === 'undefined') {
      return;
    }

    setPriceFlashes(prev => {
      const next = { ...prev };
      updates.forEach(([symbol, direction]) => {
        next[symbol] = direction;
      });
      return next;
    });

    const timer = window.setTimeout(() => {
      setPriceFlashes(prev => {
        const next = { ...prev };
        updates.forEach(([symbol]) => {
          delete next[symbol];
        });
        return next;
      });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [rowsWithPercent]);

  type RankedMarket = TableMarket & { rank: number };

  const filteredAndSorted: RankedMarket[] = useMemo(() => {
    const { key, dir } = sortState;
    const direction = dir === 'asc' ? 1 : -1;
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? rowsWithPercent.filter(row => {
          const haystack = `${row.symbol} ${row.base} ${row.quote}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : rowsWithPercent;

    const sorted = [...filtered].sort((a, b) => {
      const valueForKey = (row: TableMarket, sortKey: SortKey) => {
        switch (sortKey) {
          case 'asset':
            return row.base;
          case 'pair':
            return row.pair;
          case 'price':
            return row.price;
          case 'depthPlus':
            return row.depthPlus;
          case 'depthMinus':
            return row.depthMinus;
          case 'volume':
            return row.volumeUsd;
          case 'vp':
            return row.volumePercent;
          case 'liq':
            return row.liquidity;
          case 'updated':
            return row.updated;
          default:
            return row.volumeUsd;
        }
      };

      const va = valueForKey(a, key);
      const vb = valueForKey(b, key);

      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * direction;
      }

      return String(va).localeCompare(String(vb)) * direction;
    });

    return sorted.map((row, index) => ({ ...row, rank: index + 1 }));
  }, [rowsWithPercent, query, sortState]);

  const maxDepthPlus = useMemo(
    () => (filteredAndSorted.length ? Math.max(...filteredAndSorted.map(row => row.depthPlus)) : 0),
    [filteredAndSorted]
  );
  const maxDepthMinus = useMemo(
    () => (filteredAndSorted.length ? Math.max(...filteredAndSorted.map(row => row.depthMinus)) : 0),
    [filteredAndSorted]
  );

  const confidenceLabels = useMemo(
    () => ({
      high: t('confidenceHigh', { defaultValue: 'High' }),
      mid: t('confidenceMedium', { defaultValue: 'Moderate' }),
      low: t('confidenceLow', { defaultValue: 'Low' })
    }),
    [t]
  );

  const relativeTimeFormatter = useMemo(
    () => new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' }),
    [i18n.language]
  );

  const formatTimeAgo = useCallback(
    (timestamp: number) => {
      const diffMs = timestamp - Date.now();
      const diffSeconds = Math.round(diffMs / 1000);
      if (Math.abs(diffSeconds) < 60) {
        return relativeTimeFormatter.format(diffSeconds, 'second');
      }
      const diffMinutes = Math.round(diffSeconds / 60);
      if (Math.abs(diffMinutes) < 60) {
        return relativeTimeFormatter.format(diffMinutes, 'minute');
      }
      const diffHours = Math.round(diffMinutes / 60);
      if (Math.abs(diffHours) < 24) {
        return relativeTimeFormatter.format(diffHours, 'hour');
      }
      const diffDays = Math.round(diffHours / 24);
      return relativeTimeFormatter.format(diffDays, 'day');
    },
    [relativeTimeFormatter]
  );

  const handleSort = (key: SortKey) => {
    setSortState(prev => {
      if (prev.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      const defaultDir: SortDir = key === 'asset' || key === 'pair' ? 'asc' : 'desc';
      return { key, dir: defaultDir };
    });
  };

  const sortIndicator = (key: SortKey): 'ascending' | 'descending' | 'none' => {
    if (sortState.key !== key) {
      return 'none';
    }
    return sortState.dir === 'asc' ? 'ascending' : 'descending';
  };

  const handleRowSelect = (symbol: string) => {
    selectMarket(symbol);
    navigate(`/spot/${symbol}`);
  };

  const locale = i18n.language;
  const isLoading = markets.length === 0;

  return (
    <section className="panel sx-market" aria-labelledby="market-table-title">
      <div className="sx-market__toolbar">
        <h2 id="market-table-title" className="sx-market__title">
          {t('markets')}
        </h2>
        <div className="sx-market__search">
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={t('search', { defaultValue: 'Search markets' })}
            aria-label={t('search', { defaultValue: 'Search markets' })}
          />
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M10.5 3a7.5 7.5 0 0 1 5.973 12.065l4.23 4.232a1 1 0 0 1-1.414 1.414l-4.232-4.23A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11Z"
            />
          </svg>
        </div>
      </div>

      <div className="sx-market__table-wrapper">
        <table className="sx-table" aria-label={t('markets')}>
          <colgroup>
            <col className="sx-col-rank" />
            <col className="sx-col-asset" />
            <col className="sx-col-pair" />
            <col className="sx-col-price" />
            <col className="sx-col-depth" />
            <col className="sx-col-depth" />
            <col className="sx-col-vol" />
            <col className="sx-col-vp" />
            <col className="sx-col-conf" />
            <col className="sx-col-liq" />
            <col className="sx-col-upd" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col" aria-sort={sortIndicator('asset')}>
                <button
                  type="button"
                  className="sx-sort"
                  onClick={() => handleSort('asset')}
                  data-dir={sortState.key === 'asset' ? sortState.dir : undefined}
                  data-active={sortState.key === 'asset' || undefined}
                >
                  {t('marketCurrency', { defaultValue: 'Currency' })} <i aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={sortIndicator('pair')}>
                <button
                  type="button"
                  className="sx-sort"
                  onClick={() => handleSort('pair')}
                  data-dir={sortState.key === 'pair' ? sortState.dir : undefined}
                  data-active={sortState.key === 'pair' || undefined}
                >
                  {t('marketPair', { defaultValue: 'Pair' })} <i aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={sortIndicator('price')}>
                <button
                  type="button"
                  className="sx-sort"
                  onClick={() => handleSort('price')}
                  data-dir={sortState.key === 'price' ? sortState.dir : undefined}
                  data-active={sortState.key === 'price' || undefined}
                >
                  {t('price')} <i aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={sortIndicator('depthPlus')}>
                <button
                  type="button"
                  className="sx-sort"
                  onClick={() => handleSort('depthPlus')}
                  data-dir={sortState.key === 'depthPlus' ? sortState.dir : undefined}
                  data-active={sortState.key === 'depthPlus' || undefined}
                >
                  {t('marketDepthPlus', { defaultValue: '+2% depth' })} <i aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={sortIndicator('depthMinus')}>
                <button
                  type="button"
                  className="sx-sort"
                  onClick={() => handleSort('depthMinus')}
                  data-dir={sortState.key === 'depthMinus' ? sortState.dir : undefined}
                  data-active={sortState.key === 'depthMinus' || undefined}
                >
                  {t('marketDepthMinus', { defaultValue: '-2% depth' })} <i aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={sortIndicator('volume')}>
                <button
                  type="button"
                  className="sx-sort"
                  onClick={() => handleSort('volume')}
                  data-dir={sortState.key === 'volume' ? sortState.dir : undefined}
                  data-active={sortState.key === 'volume' || undefined}
                >
                  {t('volume')} <i aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={sortIndicator('vp')}>
                <button
                  type="button"
                  className="sx-sort"
                  onClick={() => handleSort('vp')}
                  data-dir={sortState.key === 'vp' ? sortState.dir : undefined}
                  data-active={sortState.key === 'vp' || undefined}
                >
                  {t('marketVolumePercent', { defaultValue: 'Volume %' })} <i aria-hidden="true" />
                </button>
              </th>
              <th scope="col">{t('marketConfidence', { defaultValue: 'Confidence' })}</th>
              <th scope="col" aria-sort={sortIndicator('liq')}>
                <button
                  type="button"
                  className="sx-sort"
                  onClick={() => handleSort('liq')}
                  data-dir={sortState.key === 'liq' ? sortState.dir : undefined}
                  data-active={sortState.key === 'liq' || undefined}
                >
                  {t('marketLiquidity', { defaultValue: 'Liquidity' })} <i aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={sortIndicator('updated')}>
                <button
                  type="button"
                  className="sx-sort"
                  onClick={() => handleSort('updated')}
                  data-dir={sortState.key === 'updated' ? sortState.dir : undefined}
                  data-active={sortState.key === 'updated' || undefined}
                >
                  {t('marketUpdated', { defaultValue: 'Updated' })} <i aria-hidden="true" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="sx-skel-row">
                  <td colSpan={11}>
                    <div className="sx-skel" aria-hidden="true" />
                  </td>
                </tr>
              ))}

            {!isLoading && filteredAndSorted.length === 0 && (
              <tr>
                <td colSpan={11} className="sx-empty">
                  {t('marketNoMatches', { defaultValue: 'No markets match your search.' })}
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredAndSorted.map((row, index) => {
                const isSelected = selectedMarket?.symbol === row.symbol;
                const depthPlusPct = maxDepthPlus ? Math.min(100, (row.depthPlus / maxDepthPlus) * 100) : 0;
                const depthMinusPct = maxDepthMinus ? Math.min(100, (row.depthMinus / maxDepthMinus) * 100) : 0;
                const trend = row.change >= 0 ? 'up' : 'down';
                const priceFlash = priceFlashes[row.symbol];
                return (
                  <tr
                    key={row.symbol}
                    tabIndex={0}
                    className={isSelected ? 'is-active' : undefined}
                    data-reveal="true"
                    style={{ '--row-index': index } as CSSProperties}
                    aria-label={`${row.pair} ${formatUSD(row.price, locale)}`}
                    aria-selected={isSelected}
                    onClick={() => handleRowSelect(row.symbol)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleRowSelect(row.symbol);
                      }
                    }}
                  >
                  <td className="sx-col-rank">{row.rank}</td>
                    <td className="sx-col-asset">
                      <div className="sx-asset">
                        <span className="sx-coin" aria-hidden="true">
                          <svg width="24" height="24" viewBox="0 0 24 24" focusable="false">
                            <use href={`#coin-${row.base.toLowerCase()}`} />
                          </svg>
                        </span>
                        <div className="sx-asset__meta">
                          <span className="sx-asset__name">{row.base}</span>
                          <span className="sx-asset__symbol">{row.symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="sx-col-pair">
                      <span className="sx-pair">{row.pair}</span>
                    </td>
                    <td
                      className={`sx-col-price sx-num${priceFlash ? ` sx-flash-${priceFlash}` : ''}`}
                      data-trend={trend}
                    >
                      <span className="sx-price">{formatUSD(row.price, locale)}</span>
                      <span className="sx-price-change">{formatPercent(row.change)}</span>
                    </td>
                    <td className="sx-col-depth">
                      <div className="sx-depth-wrap">
                        <div className="sx-depth sx-depth--plus" aria-hidden="true">
                          <div className="sx-depth__bar" style={{ width: `${depthPlusPct.toFixed(0)}%` }} />
                        </div>
                        <span className="sx-depth__value">{formatCompact(row.depthPlus, locale)}</span>
                      </div>
                    </td>
                    <td className="sx-col-depth">
                      <div className="sx-depth-wrap">
                        <div className="sx-depth sx-depth--minus" aria-hidden="true">
                          <div className="sx-depth__bar" style={{ width: `${depthMinusPct.toFixed(0)}%` }} />
                        </div>
                        <span className="sx-depth__value">{formatCompact(row.depthMinus, locale)}</span>
                      </div>
                    </td>
                    <td className="sx-col-vol sx-num" title={formatUSD(row.volumeUsd, locale)}>
                      {formatCompact(row.volumeUsd, locale)}
                    </td>
                    <td className="sx-col-vp sx-num">{row.volumePercent.toFixed(2)}%</td>
                    <td className="sx-col-conf">
                      <span className={`sx-pill sx-pill--${row.confidence}`}>
                        {confidenceLabels[row.confidence]}
                      </span>
                    </td>
                    <td className="sx-col-liq">
                      <span className="sx-liq">{row.liquidity}</span>
                    </td>
                    <td className="sx-col-upd">{formatTimeAgo(row.updated)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MarketList;
