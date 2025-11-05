import MarketList from '@components/MarketList';
import Portfolio from '@components/Portfolio';

const MarketsPage = () => {
  return (
    <div className="market-layout">
      <MarketList />
      <Portfolio />
    </div>
  );
};

export default MarketsPage;
