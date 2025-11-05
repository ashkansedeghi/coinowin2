import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from '@components/Sidebar';
import Header from '@components/Header';
import TickerTape from '@components/TickerTape';
import MarketsPage from '@pages/Markets';
import SpotPage from '@pages/Spot';
import WalletPage from '@pages/Wallet';
import OrdersPage from '@pages/Orders';
import SettingsPage from '@pages/Settings';
import SupportPage from '@pages/Support';
import SpriteDefs from '@components/SpriteDefs';
import { SettingsProvider } from '@context/SettingsContext';
import { TradingProvider } from '@context/TradingContext';

const App = () => {
  return (
    <SettingsProvider>
      <TradingProvider>
        <HashRouter>
          <SpriteDefs />
          <div className="app">
            <Sidebar />
            <div className="main">
              <Header />
              <TickerTape />
              <div className="content-scroll">
                <Routes>
                  <Route path="/" element={<Navigate to="/markets" replace />} />
                  <Route path="/markets" element={<MarketsPage />} />
                  <Route path="/spot/:symbol?" element={<SpotPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/support" element={<SupportPage />} />
                </Routes>
              </div>
            </div>
          </div>
        </HashRouter>
      </TradingProvider>
    </SettingsProvider>
  );
};

export default App;
