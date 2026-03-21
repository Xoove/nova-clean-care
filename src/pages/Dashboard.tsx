import React, { useState, useEffect } from 'react';
import { getOrders, getClients, getPayments } from '@/lib/store';
import { SERVICES, ORDER_STATUSES } from '@/lib/types';
import type { Order, Client } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { ClipboardList, Users, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string | number; accent?: string }) => (
  <Card className="p-5 card-shadow animate-fade-in-up">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
      </div>
      <div className={`p-2.5 rounded-lg ${accent || 'bg-primary/10 text-primary'}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setOrders(getOrders());
    setClients(getClients());
  }, []);

  const now = new Date();
  const overdueCount = orders.filter(o => new Date(o.deadline) < now && o.status !== 'Выдан клиенту').length;
  const readyCount = orders.filter(o => o.status === 'Готов к выдаче').length;
  const inProgressCount = orders.filter(o => o.status !== 'Выдан клиенту' && o.status !== 'Готов к выдаче').length;
  const totalRevenue = orders.filter(o => o.paymentStatus === 'Оплачено').reduce((s, o) => s + o.totalCost, 0);
  const avgCheck = orders.length > 0 ? Math.round(totalRevenue / orders.filter(o => o.paymentStatus === 'Оплачено').length || 1) : 0;

  const statusData = ORDER_STATUSES.slice(0, -1).map(s => ({
    name: s.length > 12 ? s.slice(0, 12) + '…' : s,
    count: orders.filter(o => o.status === s).length,
  })).filter(d => d.count > 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Панель управления</h1>
        <p className="text-muted-foreground text-sm mt-1">Обзор текущей деятельности химчистки</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard icon={ClipboardList} label="Всего заказов" value={orders.length} />
        <StatCard icon={Clock} label="В работе" value={inProgressCount} accent="bg-warning/10 text-warning" />
        <StatCard icon={CheckCircle} label="Готовы к выдаче" value={readyCount} accent="bg-success/10 text-success" />
        <StatCard icon={AlertTriangle} label="Просрочено" value={overdueCount} accent="bg-overdue/10 text-overdue" />
        <StatCard icon={DollarSign} label="Выручка" value={`${totalRevenue.toLocaleString()} ₽`} />
      </div>

      {statusData.length > 0 && (
        <Card className="p-5 card-shadow animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Заказы по статусам</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 card-shadow animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">KPI</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm">Средний чек</span><span className="font-semibold">{avgCheck.toLocaleString()} ₽</span></div>
            <div className="flex justify-between"><span className="text-sm">Клиентов</span><span className="font-semibold">{clients.length}</span></div>
            <div className="flex justify-between"><span className="text-sm">Заказов за месяц</span><span className="font-semibold">{orders.length}</span></div>
          </div>
        </Card>
        <Card className="p-5 card-shadow animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Последние заказы</h3>
          <div className="space-y-2">
            {orders.slice(0, 4).map(o => {
              const client = clients.find(c => c.id === o.clientId);
              const overdue = new Date(o.deadline) < now && o.status !== 'Выдан клиенту';
              return (
                <div key={o.id} className={`flex justify-between items-center text-sm px-3 py-2 rounded-md ${overdue ? 'bg-overdue/5 border border-overdue/20' : 'bg-muted/50'}`}>
                  <span>{client ? `${client.lastName} ${client.firstName}` : '—'}</span>
                  <span className={`text-xs font-medium ${overdue ? 'text-overdue' : 'text-muted-foreground'}`}>{o.status}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
