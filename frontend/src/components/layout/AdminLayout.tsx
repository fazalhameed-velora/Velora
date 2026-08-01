import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, Tags, Ticket, Users, ShoppingBag, BarChart3, Image, ChevronLeft, Menu } from 'lucide-react';
import { cn } from '../../utils';

const sidebarItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/brands', icon: Tags, label: 'Brands' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

function AdminSidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const location = useLocation();
  return (
    <>
      {/* Mobile Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn(
        'fixed top-0 left-0 h-full bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 z-50 transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden',
        'w-64'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-surface-100 dark:border-surface-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Package className="text-white" size={16} />
            </div>
            <span className="font-bold text-surface-900 dark:text-white">Admin</span>
          </Link>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 lg:hidden">
            <ChevronLeft size={16} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {sidebarItems.map(item => {
            const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-surface-600 hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-800'
              )}>
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 h-14 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 lg:hidden">
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <Link to="/" className="text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300">
            View Store →
          </Link>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
