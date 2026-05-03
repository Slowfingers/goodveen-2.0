import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartUIProvider } from '../cart/CartContext';
import { CartPopup } from '../cart/CartPopup';
import { AuthUIProvider } from '../auth/AuthContext';
import { AuthPopup } from '../auth/AuthPopup';

export function Layout() {
  return (
    <AuthUIProvider>
      <CartUIProvider>
        <div className="min-h-screen flex flex-col font-sans bg-white text-brand-gray overflow-x-hidden">
          <Header />
          <main className="flex-1 w-full relative">
            <Outlet />
          </main>
          <Footer />
          <CartPopup />
          <AuthPopup />
        </div>
      </CartUIProvider>
    </AuthUIProvider>
  );
}
