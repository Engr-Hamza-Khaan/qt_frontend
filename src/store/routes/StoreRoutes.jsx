import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import StoreLayout from '../layout/StoreLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const HomePage = lazy(() => import('../pages/HomePage'));
const ShopPage = lazy(() => import('../pages/ShopPage'));
const ProductPage = lazy(() => import('../pages/ProductPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const CmsPage = lazy(() => import('../pages/CmsPage'));
const RepairPage = lazy(() => import('../pages/RepairPage'));
const SellPage = lazy(() => import('../pages/SellPage'));
const ControllerTesterPage = lazy(() => import('../pages/ControllerTesterPage'));

function PageLoader() {
  return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
}

export default function StoreRoutes() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
        <Route path="shop" element={<Suspense fallback={<PageLoader />}><ShopPage /></Suspense>} />
        <Route path="product/:id" element={<Suspense fallback={<PageLoader />}><ProductPage /></Suspense>} />
        <Route path="cart" element={<Suspense fallback={<PageLoader />}><CartPage /></Suspense>} />
        <Route path="checkout" element={<Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense>} />
        <Route path="page/:slug" element={<Suspense fallback={<PageLoader />}><CmsPage /></Suspense>} />
        <Route path="repair" element={<Suspense fallback={<PageLoader />}><RepairPage /></Suspense>} />
        <Route path="sell" element={<Suspense fallback={<PageLoader />}><SellPage /></Suspense>} />
        <Route path="controller-tester" element={<Suspense fallback={<PageLoader />}><ControllerTesterPage /></Suspense>} />
      </Route>
    </Routes>
  );
}
