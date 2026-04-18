import React, { useState } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth, can, type Permission } from '@/contexts/AuthContext';
import {
  LayoutDashboard, ClipboardList, Users, BarChart3,
  LogOut, CreditCard, Bell, Wrench, PackageCheck, BookOpen,
  AlertTriangle, UserCog, Settings, Menu, X, Sparkles,
} from 'lucide-react';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  perm: Permission | 'always';
}

const NAV_ITEMS: NavItem[] = [
  { title: 'Панель', url: '/', icon: LayoutDashboard, perm: 'always' },
  { title: 'Заказы', url: '/orders', icon: ClipboardList, perm: 'orders.advance' },
  { title: 'Клиенты', url: '/clients', icon: Users, perm: 'clients.write' },
  { title: 'Операции', url: '/operations', icon: Wrench, perm: 'operations.write' },
  { title: 'Дефекты', url: '/defects', icon: AlertTriangle, perm: 'defects.write' },
  { title: 'Оплата', url: '/payments', icon: CreditCard, perm: 'payments.write' },
  { title: 'Выдача', url: '/delivery', icon: PackageCheck, perm: 'delivery.write' },
  { title: 'Уведомления', url: '/notifications', icon: Bell, perm: 'notifications.write' },
  { title: 'Сотрудники', url: '/employees', icon: UserCog, perm: 'employees.view' },
  { title: 'Справочники', url: '/directories', icon: BookOpen, perm: 'directories.view' },
  { title: 'Отчёты', url: '/reports', icon: BarChart3, perm: 'reports.view' },
  { title: 'Настройки', url: '/settings', icon: Settings, perm: 'settings.view' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = NAV_ITEMS.filter(i => i.perm === 'always' || can(user, i.perm));

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shadow-[var(--shadow-elegant)]">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold tracking-wider gradient-text">НИКА ЛЮКС</div>
                <div className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-widest">Premium Cleaning</div>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center overflow-x-auto">
              {filtered.map(item => {
                const active = location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url));
                return (
                  <RouterNavLink
                    key={item.url}
                    to={item.url}
                    className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      active
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    <span>{item.title}</span>
                    {active && (
                      <span className="absolute -bottom-px left-2 right-2 h-px gradient-primary rounded-full" />
                    )}
                  </RouterNavLink>
                );
              })}
            </nav>

            {/* User */}
            <div className="flex items-center gap-3 shrink-0">
              {user && (
                <div className="hidden md:block text-right">
                  <div className="text-xs font-semibold text-foreground leading-tight">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{user.position}</div>
                </div>
              )}
              <button
                onClick={logout}
                className="hidden md:flex items-center justify-center h-9 w-9 rounded-lg border border-border hover:border-destructive/50 hover:text-destructive transition-colors"
                title="Выйти"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="lg:hidden h-9 w-9 rounded-lg border border-border flex items-center justify-center"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileOpen && (
            <div className="lg:hidden pb-4 grid grid-cols-2 sm:grid-cols-3 gap-1.5 animate-fade-in">
              {filtered.map(item => {
                const active = location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url));
                return (
                  <RouterNavLink
                    key={item.url}
                    to={item.url}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                      active ? 'gradient-primary text-primary-foreground' : 'bg-muted/40 text-foreground'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.title}
                  </RouterNavLink>
                );
              })}
              {user && (
                <button onClick={logout} className="col-span-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs border border-border text-muted-foreground">
                  <LogOut className="h-3.5 w-3.5" /> Выйти ({user.name})
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
          <div className="animate-fade-in-up">{children}</div>
        </div>
      </main>

      <footer className="border-t border-border py-4">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} НИКА ЛЮКС · Информационная система химчистки
        </div>
      </footer>
    </div>
  );
}
