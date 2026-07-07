import { Outlet, useLocation } from 'react-router-dom';
import StoreHeader from './StoreHeader';
import StoreFooter from './StoreFooter';
import CartDrawer from '../components/CartDrawer';
import SupportChatbot from '../components/SupportChatbot';

function StoreLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="store-theme min-h-screen flex flex-col">
      {!isHome && <StoreHeader />}
      <main className="flex-1">
        <Outlet />
      </main>
      <StoreFooter />
      <CartDrawer />
      <SupportChatbot />
    </div>
  );
}

export default StoreLayout;
