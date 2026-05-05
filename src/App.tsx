import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { Product } from './pages/Product';
import { Checkout } from './pages/Checkout';
import { useCartUI } from './components/cart/CartContext';
import { useAuthUI, type AuthMode } from './components/auth/AuthContext';

// /cart legacy route → opens the cart popup over Home
function CartRoute() {
  const cartUI = useCartUI();
  useEffect(() => {
    cartUI.open();
  }, [cartUI]);
  return <Navigate to="/" replace />;
}

// Auth legacy routes → open the auth popup over Home
function AuthRoute({ mode }: { mode: AuthMode }) {
  const authUI = useAuthUI();
  useEffect(() => {
    authUI.open(mode);
  }, [authUI, mode]);
  return <Navigate to="/" replace />;
}

import { Cabinet } from './pages/Cabinet';
import { Events } from './pages/Events';
import { EventDetails } from './pages/EventDetails';
import { Contact } from './pages/Contact';
import { Workshop } from './pages/Workshop';
import { About } from './pages/About';
import { adminRouteTree } from './admin/AdminRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {adminRouteTree()}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="workshop" element={<Workshop />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<AuthRoute mode="login" />} />
          <Route path="register" element={<AuthRoute mode="register" />} />
          <Route path="password-reset" element={<AuthRoute mode="password-reset" />} />
          <Route path="cart" element={<CartRoute />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="cabinet" element={<Cabinet />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
