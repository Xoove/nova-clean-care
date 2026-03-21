import React, { useState, useEffect } from 'react';
import { getOrders, getClients, getPayments, getEmployees } from '@/lib/store';
import { SERVICES, type Order } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CHART_COLORS = ['hsl(173,58%,39%)', 'hsl(38,92%,50%)', 'hsl(152,60%,42%)', 'hsl(0,72%,51%)', 'hsl(200,25%,40%)', 'hsl(280,50%,50%)'];

const ReportsPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => setOrders(getOrders()), []);

  const filtered = orders.filter(o => {
    const d = new Date(o.createdAt);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const completed = filtered.filter(o => o.status === 'Выдан клиенту');
  const totalRevenue = filtered.filter(o => o.paymentStatus === 'Оплачено').reduce((s, o) => s + o.totalCost, 0);
  const avgCheck = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;

  // Services breakdown
  const serviceData = SERVICES.map(s => ({
    name: s.name,
    count: filtered.reduce((sum, o) => sum + o.services.filter(os => os.serviceId === s.id).length, 0),
    revenue: filtered.reduce((sum, o) => sum + o.services.filter(os => os.serviceId === s.id).length * s.price, 0),
  })).filter(d => d.count > 0);

  // Employee workload
  const empMap: Record<string, number> = {};
  filtered.forEach(o => o.operations.forEach(op => { empMap[op.employeeName] = (empMap[op.employeeName] || 0) + 1; }));
  const empData = Object.entries(empMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Отчётность</h1>
        <p className="text-sm text-muted-foreground">Аналитика и статистика</p>
      </div>

      <div className="flex gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground">Дата от</label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Дата до</label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 card-shadow"><p className="text-sm text-muted-foreground">Выполнено заказов</p><p className="text-3xl font-bold mt-1">{completed.length}</p></Card>
        <Card className="p-5 card-shadow"><p className="text-sm text-muted-foreground">Выручка</p><p className="text-3xl font-bold mt-1">{totalRevenue.toLocaleString()} ₽</p></Card>
        <Card className="p-5 card-shadow"><p className="text-sm text-muted-foreground">Средний чек</p><p className="text-3xl font-bold mt-1">{avgCheck.toLocaleString()} ₽</p></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 card-shadow">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Услуги (количество)</h3>
          <div className="h-64">
            {serviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {serviceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-8">Нет данных</p>}
          </div>
        </Card>

        <Card className="p-5 card-shadow">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Загрузка персонала</h3>
          <div className="h-64">
            {empData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={empData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-8">Нет операций</p>}
          </div>
        </Card>
      </div>

      <Card className="p-5 card-shadow">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Выручка по услугам</h3>
        <div className="h-64">
          {serviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} ₽`} />
                <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground py-8">Нет данных</p>}
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;
