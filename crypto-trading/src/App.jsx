import "./styles/global.css";
import { AppProvider, useApp } from "./context/AppContext";
import HomePage from "./pages/HomePage";
import { LoginPage, RegisterPage } from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import TradePage from "./pages/TradePage";
import { MarketPage } from "./pages/MarketPage";
import { PortfolioPage } from "./pages/AllPages";
import WalletPage from "./pages/WalletPage"; // Note: Using default export
import { FuturesPage } from "./pages/AllPages";
import { P2PPage } from "./pages/P2PPage";
import { EarnPage } from "./pages/AllPages";
import { AdminPage } from "./pages/AdminPage";
import Navbar from "./components/Navbar";
import { ProfilePage } from "./pages/ProfilePage";

// Route configuration - centralized for easier maintenance
const ROUTES_CONFIG = {
  // Public routes (no navbar, no auth required)
  public: {
    hideNavbar: ["home", "login", "register"],
    noAuth: ["home", "login", "register", "market"],
  },
  // Protected routes (require authentication)
  protected: ["dashboard", "trade", "portfolio", "wallet", "profile", "futures", "p2p", "earn"],
  // Admin only routes
  adminOnly: ["admin"],
};

function AppRoutes() {
  const { page, user } = useApp();

  // Protected route guard - redirects to login if not authenticated
  const guard = (element) => (user ? element : <LoginPage />);

  // Admin route guard - redirects non-admins to dashboard
  const adminGuard = (element) => (user?.isAdmin ? element : guard(<Dashboard />));

  // Define all routes with their protection levels
  const routes = {
    // Public routes (no authentication needed)
    home: <HomePage />,
    login: <LoginPage />,
    register: <RegisterPage />,
    market: <MarketPage />,
    
    // Protected routes (require authentication)
    dashboard: guard(<Dashboard />),
    trade: guard(<TradePage />),
    portfolio: guard(<PortfolioPage />),
    wallet: guard(<WalletPage />),
    profile: guard(<ProfilePage />),
    futures: guard(<FuturesPage />),
    p2p: guard(<P2PPage />),
    earn: guard(<EarnPage />),
    
    // Admin only routes
    admin: adminGuard(<AdminPage />),
  };

  // Pages that should NOT show the navbar
  const shouldShowNavbar = !ROUTES_CONFIG.public.hideNavbar.includes(page);
  
  // Get current route or fallback to home
  const currentPage = routes[page] ?? <HomePage />;

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {currentPage}
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