import { Routes, Route } from 'react-router-dom';
import StoreRoutes from '../store/routes/StoreRoutes';
import AdminRoutes from './AdminRoutes';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*" element={<StoreRoutes />} />
    </Routes>
  );
}
