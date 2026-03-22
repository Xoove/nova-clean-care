import React from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, ClipboardList, Users, BarChart3,
  LogOut, CreditCard, Bell, Wrench, PackageCheck, BookOpen
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar
} from '@/components/ui/sidebar';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { title: 'Панель управления', url: '/', icon: LayoutDashboard, roles: ['admin','production','director'] },
  { title: 'Заказы', url: '/orders', icon: ClipboardList, roles: ['admin','production','director'] },
  { title: 'Клиенты', url: '/clients', icon: Users, roles: ['admin','director'] },
  { title: 'Операции', url: '/operations', icon: Wrench, roles: ['admin','production'] },
  { title: 'Оплата', url: '/payments', icon: CreditCard, roles: ['admin'] },
  { title: 'Выдача', url: '/delivery', icon: PackageCheck, roles: ['admin'] },
  { title: 'Уведомления', url: '/notifications', icon: Bell, roles: ['admin'] },
  { title: 'Справочники', url: '/directories', icon: BookOpen, roles: ['admin','production','director'] },
  { title: 'Отчётность', url: '/reports', icon: BarChart3, roles: ['director','admin'] },
];

function AppSidebarContent() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const filtered = NAV_ITEMS.filter(i => user && i.roles.includes(user.role));

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {!collapsed && (
          <div className="px-4 py-5 border-b border-sidebar-border">
            <h2 className="text-base font-bold text-sidebar-primary-foreground tracking-wide">НИКА ЛЮКС</h2>
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">Химчистка</p>
          </div>
        )}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-sidebar-foreground/50">Меню</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filtered.map(item => {
                const active = location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <RouterNavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${active ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </RouterNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {!collapsed && user && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-sm text-sidebar-foreground">{user.name}</div>
            <div className="text-xs text-sidebar-foreground/50 mb-2">{user.position}</div>
            <button onClick={logout} className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Выйти
            </button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebarContent />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-4 bg-card shrink-0">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
