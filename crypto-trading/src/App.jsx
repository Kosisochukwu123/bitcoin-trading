import { useEffect } from "react";
import "./styles/global.css";
import { AppProvider, useApp } from "./context/AppContext";
import HomePage from "./pages/HomePage";
import { LoginPage, RegisterPage } from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import TradePage from "./pages/TradePage";
import WalletPage from "./pages/WalletPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage  from "./pages/MarketPage";
import  PortfolioPage  from "./pages/PortfolioPage";
import  FuturesPage  from "./pages/FuturesPage";
import  P2PPage  from "./pages/P2PPage";
import  EarnPage  from "./pages/EarnPage";
import Navbar from "./components/Navbar";

function AppRoutes() {
  const { page, user } = useApp();
  const guard = (el) => (user ? el : <LoginPage />);

  // Scroll to top on every page change — belt AND suspenders
  // (navigate() also calls scrollTo, but this catches any direct setPage calls)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);

  const routes = {
    home: <HomePage />,
    login: <LoginPage />,
    register: <RegisterPage />,
    dashboard: guard(<Dashboard />),
    trade: guard(<TradePage />),
    market: <MarketPage />,
    portfolio: guard(<PortfolioPage />),
    wallet: guard(<WalletPage />),
    profile: guard(<ProfilePage />),
    futures: guard(<FuturesPage />),
    p2p: guard(<P2PPage />),
    earn: guard(<EarnPage />),
    admin: user?.isAdmin ? <AdminPage /> : guard(<Dashboard />),
  };

  const noNav = ["home", "login", "register"].includes(page);
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
