import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './store/context/CartContext';
import { WishlistProvider } from './store/context/WishlistContext';
import AppRoutes from './routes/AppRoutes';
import MaintenanceGate from './components/MaintenanceGate';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <MaintenanceGate>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <AppRoutes />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </MaintenanceGate>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
