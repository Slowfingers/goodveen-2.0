import type { ComponentType } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Calendar,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  Tags,
  Sliders,
  Info,
  Mail,
  LogOut,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';

const NAV: { to: string; label: string; icon: ComponentType<{ size?: number }>; end?: boolean }[] = [
  { to: '/admin', label: 'Главная', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Товары', icon: Package },
  { to: '/admin/categories', label: 'Категории', icon: Tags },
  { to: '/admin/events', label: 'События', icon: Calendar },
  { to: '/admin/orders', label: 'Заказы', icon: ShoppingBag },
  { to: '/admin/users', label: 'Пользователи', icon: Users },
  { to: '/admin/filters', label: 'Фильтры', icon: Sliders },
  { to: '/admin/pages', label: 'Обложки страниц', icon: ImageIcon },
  { to: '/admin/about', label: 'Страница О нас', icon: Info },
  { to: '/admin/contact', label: 'Контакты', icon: Mail },
];

export function AdminLayout() {
  const { profile, signOut } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-[#EEE] flex flex-col">
        <div className="px-6 py-6 border-b border-[#EEE]">
          <div className="text-[18px] tracking-[0.18em] uppercase text-[#303030]">Goodveen</div>
          <div className="text-[10px] tracking-[0.24em] uppercase text-[#808080] mt-0.5">
            Админ-панель
          </div>
        </div>

        <nav className="flex-1 py-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-6 py-2.5 text-[13px] tracking-[0.04em]',
                  isActive
                    ? 'bg-[#F7F4EF] text-[#303030] border-l-2 border-[#303030]'
                    : 'text-[#808080] hover:text-[#303030] border-l-2 border-transparent',
                ].join(' ')
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-[#EEE]">
          <div className="text-[12px] text-[#303030] truncate">{profile?.name ?? profile?.email}</div>
          <div className="text-[10px] tracking-[0.18em] uppercase text-[#ABA094] mt-0.5">
            {profile?.role}
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate('/admin/login', { replace: true });
            }}
            className="mt-3 flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#808080] hover:text-[#303030]"
          >
            <LogOut size={14} /> Выйти
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <div className="px-10 py-8 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
