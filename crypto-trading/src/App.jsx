import "./styles/global.css";
import { AppProvider, useApp } from "./context/AppContext";
import HomePage            from "./pages/HomePage";
import { LoginPage, RegisterPage } from "./pages/LoginPage";
import Dashboard           from "./pages/Dashboard";
import TradePage           from "./pages/TradePage";
import WalletPage          from "./pages/WalletPage";
import AdminPage           from "./pages/AdminPage";
import { MarketPage }      from "./pages/MarketPage";
// import { PortfolioPage }   from "./pages/AllPages";
import { FuturesPage }     from "./pages/AllPages";
import { P2PPage }         from "./pages/P2PPage";
import { EarnPage }        from "./pages/AllPages";
import Navbar              from "./components/Navbar";
import {ProfilePage} from "./pages/ProfilePage";

function AppRoutes() {
  const { page, user } = useApp();
  const guard = el => user ? el : <LoginPage />;

  const routes = {
    home:      <HomePage />,
    login:     <LoginPage />,
    register:  <RegisterPage />,
    dashboard: guard(<Dashboard />),
    trade:     guard(<TradePage />),
    market:    <MarketPage />,
    // portfolio: guard(<PortfolioPage />),
    wallet:    guard(<WalletPage />),
    profile:   guard(<ProfilePage />),
    futures:   guard(<FuturesPage />),
    p2p:       guard(<P2PPage />),
    earn:      guard(<EarnPage />),
    admin:     user?.isAdmin ? <AdminPage /> : guard(<Dashboard />),
  };

  const noNav = ["home","login","register"].includes(page);
  return (
    <>
      {!noNav && <Navbar />}
      {routes[page] ?? <HomePage />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
