import { Outlet, useLocation } from 'react-router-dom';
import StoreHeader from './StoreHeader';
import StoreFooter from './StoreFooter';
import CartDrawer from '../components/CartDrawer';
import SupportChatbot from '../components/SupportChatbot';
import AnnouncementBar from '../../components/ui/AnnouncementBar';
import TermsModal from '../components/TermsModal';
import WebsitePopup from '../components/WebsitePopup';

function StoreLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="store-theme min-h-screen flex flex-col">
      <AnnouncementBar />
      {!isHome && <StoreHeader />}
      <main className="flex-1">
        <Outlet />
      </main>
      <StoreFooter />
      <CartDrawer />
      <SupportChatbot />
      <TermsModal />
      <WebsitePopup />
    </div>
  );
}

export default StoreLayout;
