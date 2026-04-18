import React, { useState, useEffect } from 'react';
import { getOrders, getClients } from '@/lib/store';
import { ORDER_STATUSES } from '@/lib/types';
import type { Order, Client } from '@/lib/types';
import { ClipboardList, Users, DollarSign, AlertTriangle, CheckCircle, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'primary',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'primary' | 'warning' | 'success' | 'overdue' | 'accent';
}) => {
  const toneMap = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    success: 'text-success bg-success/10 border-success/20',
    overdue: 'text-overdue bg-overdue/10 border-overdue/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
  };
  return (
    <div className="card-shadow rounded-xl p-5 relative overflow-hidden group hover:card-shadow-hover transition-all">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div className={`h-10 w-10 rounded-lg border flex items-center justify-center ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

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
  const paidOrders = orders.filter(o => o.paymentStatus === 'Оплачено');
  const avgCheck = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  const statusData = ORDER_STATUSES.slice(0, -1).map(s => ({
    name: s.length > 14 ? s.slice(0, 14) + '…' : s,
    count: orders.filter(o => o.status === s).length,
  })).filter(d => d.count > 0);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl card-shadow p-6 lg:p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-60" style={{ background: 'var(--gradient-glow)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-3">
              <Sparkles className="h-3 w-3" /> Панель управления
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold gradient-text">Добро пожаловать</h1>
            <p className="text-muted-foreground text-sm mt-2 max-w-xl">
              Обзор деятельности химчистки в реальном времени: статусы заказов, выручка и ключевые показатели.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" />
            {now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard icon={ClipboardList} label="Всего заказов" value={orders.length} tone="primary" />
        <StatCard icon={Clock} label="В работе" value={inProgressCount} tone="warning" />
        <StatCard icon={CheckCircle} label="Готовы к выдаче" value={readyCount} tone="success" />
        <StatCard icon={AlertTriangle} label="Просрочено" value={overdueCount} tone="overdue" />
        <StatCard icon={DollarSign} label="Выручка" value={`${totalRevenue.toLocaleString()} ₽`} hint={`Средний чек: ${avgCheck.toLocaleString()} ₽`} tone="accent" />
      </div>

      {/* Chart + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {statusData.length > 0 && (
          <div className="lg:col-span-2 card-shadow rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">Заказы по статусам</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Распределение активных заказов по этапам</p>
              </div>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <defs>
                    <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="url(#barFill)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="card-shadow rounded-xl p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Сводка</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" /> Клиентов</div>
              <span className="text-lg font-semibold">{clients.length}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="h-4 w-4" /> Средний чек</div>
              <span className="text-lg font-semibold">{avgCheck.toLocaleString()} ₽</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4" /> Оплачено</div>
              <span className="text-lg font-semibold">{paidOrders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card-shadow rounded-xl p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Последние заказы</h3>
        <div className="space-y-2">
          {orders.slice(0, 6).map(o => {
            const client = clients.find(c => c.id === o.clientId);
            const overdue = new Date(o.deadline) < now && o.status !== 'Выдан клиенту';
            return (
              <div
                key={o.id}
                className={`flex items-center justify-between text-sm px-4 py-3 rounded-lg border transition-colors ${
                  overdue ? 'bg-overdue/5 border-overdue/30' : 'bg-muted/30 border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">№{o.orderNumber}</span>
                  <span className="font-medium">{client ? `${client.lastName} ${client.firstName}` : '—'}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                  overdue ? 'bg-overdue/10 text-overdue' : 'bg-primary/10 text-primary'
                }`}>{o.status}</span>
              </div>
            );
          })}
          {orders.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">Нет заказов</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
