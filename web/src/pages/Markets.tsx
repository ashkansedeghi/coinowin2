import MarketList from '@components/MarketList';
import Portfolio from '@components/Portfolio';

const MarketsPage = () => {
  return (
    <div className="market-grid">
      <MarketList />
      <Portfolio />
    </div>
  );
};

export default MarketsPage;
