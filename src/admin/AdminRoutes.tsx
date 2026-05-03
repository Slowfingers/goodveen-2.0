import { Outlet, Route } from 'react-router-dom';
import { AdminAuthProvider } from './AdminAuthContext';
import { RequireAdmin } from './RequireAdmin';
import { AdminLayout } from './AdminLayout';
import { AdminLogin } from './AdminLogin';
import { Dashboard } from './pages/Dashboard';
import { CategoriesList } from './pages/categories/CategoriesList';
import { ProductsList } from './pages/products/ProductsList';
import { ProductEdit } from './pages/products/ProductEdit';
import { EventsList } from './pages/events/EventsList';
import { EventEdit } from './pages/events/EventEdit';
import { OrdersList } from './pages/orders/OrdersList';
import { OrderDetails } from './pages/orders/OrderDetails';
import { UsersList } from './pages/users/UsersList';
import { FiltersPage } from './pages/filters/FiltersPage';
import { PageCoversPage } from './pages/pages/PageCoversPage';
import { AboutPageEdit } from './pages/about/AboutPageEdit';

function AdminRoot() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}

export function adminRouteTree() {
  return (
    <Route path="/admin" element={<AdminRoot />}>
      <Route path="login" element={<AdminLogin />} />
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="products" element={<ProductsList />} />
        <Route path="products/new" element={<ProductEdit />} />
        <Route path="products/:id" element={<ProductEdit />} />

        <Route path="categories" element={<CategoriesList />} />

        <Route path="events" element={<EventsList />} />
        <Route path="events/new" element={<EventEdit />} />
        <Route path="events/:id" element={<EventEdit />} />

        <Route path="orders" element={<OrdersList />} />
        <Route path="orders/:id" element={<OrderDetails />} />

        <Route path="users" element={<UsersList />} />
        <Route path="filters" element={<FiltersPage />} />
        <Route path="pages" element={<PageCoversPage />} />
        <Route path="about" element={<AboutPageEdit />} />
      </Route>
    </Route>
  );
}
