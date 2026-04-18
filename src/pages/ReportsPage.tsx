import React, { useState, useEffect } from 'react';
import { getOrders, getEmployees, getSavedReports, addSavedReport } from '@/lib/store';
import { SERVICES, type Order, type Employee } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, FileText } from 'lucide-react';
import { nextId } from '@/lib/ids';
import { printReportHTML, reportHeader, signatureBlock } from '@/lib/printReport';

const ReportsPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    setOrders(getOrders());
    setEmployees(getEmployees());
  }, []);

  const filtered = orders.filter(o => {
    const d = new Date(o.createdAt);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  // ---- Revenue ----
  const paid = filtered.filter(o => o.paymentStatus === 'Оплачено');
  const totalRevenue = paid.reduce((s, o) => s + o.totalCost, 0);
  const avgCheck = paid.length > 0 ? Math.round(totalRevenue / paid.length) : 0;

  // ---- Orders ----
  const completed = filtered.filter(o => o.status === 'Выдан клиенту');
  const inWork = filtered.filter(o => o.status !== 'Выдан клиенту' && o.status !== 'Готов к выдаче');
  const overdue = filtered.filter(o => new Date(o.deadline) < new Date() && o.status !== 'Выдан клиенту');

  // ---- Services ----
  const serviceData = SERVICES.map(s => ({
    name: s.name,
    count: filtered.reduce((sum, o) => sum + o.services.filter(os => os.serviceId === s.id).reduce((a, os) => a + os.quantity, 0), 0),
    revenue: filtered.reduce((sum, o) => sum + o.services.filter(os => os.serviceId === s.id).reduce((a, os) => a + os.sum, 0), 0),
  })).filter(d => d.count > 0);

  // ---- Staff ----
  const empMap: Record<string, { count: number; minutes: number }> = {};
  filtered.forEach(o => o.operations.forEach(op => {
    const key = op.employeeName || op.employeeId;
    if (!empMap[key]) empMap[key] = { count: 0, minutes: 0 };
    empMap[key].count += 1;
    if (op.duration) empMap[key].minutes += op.duration;
  }));
  const empData = Object.entries(empMap).map(([name, d]) => ({
    name, count: d.count, hours: Math.round(d.minutes / 60 * 10) / 10,
  })).sort((a, b) => b.count - a.count);

  const userName = user?.name || '—';

  // ---- Generators ----
  const genRevenue = () => {
    const id = nextId('RPR');
    const html = reportHeader({ title: 'Отчёт по выручке', reportCode: id, dateFrom, dateTo, user: userName }) + `
      <h2 class="sec">Сводные показатели</h2>
      <div class="summary">
        <div>Общая выручка: <strong>${totalRevenue.toLocaleString()} ₽</strong></div>
        <div>Количество оплаченных заказов: <strong>${paid.length}</strong></div>
        <div>Средний чек: <strong>${avgCheck.toLocaleString()} ₽</strong></div>
      </div>
      <h2 class="sec">Детализация по заказам</h2>
      <table><thead><tr><th>№</th><th>Код заказа</th><th>Дата приёма</th><th class="num">Сумма, ₽</th></tr></thead><tbody>
        ${paid.map((o, i) => `<tr><td>${i + 1}</td><td>${o.id}</td><td>${new Date(o.createdAt).toLocaleDateString('ru')}</td><td class="num">${o.totalCost.toLocaleString()}</td></tr>`).join('')}
        ${paid.length === 0 ? '<tr><td colspan="4" style="text-align:center">Нет данных</td></tr>' : ''}
      </tbody></table>
      ${signatureBlock()}
    `;
    addSavedReport({ id, type: 'revenue', dateFrom, dateTo, createdAt: new Date().toISOString(), createdBy: userName, data: { totalRevenue, count: paid.length, avgCheck } });
    printReportHTML({ title: 'Отчёт по выручке', reportCode: id, html });
  };

  const genOrders = () => {
    const id = nextId('RPC');
    const html = reportHeader({ title: 'Отчёт о выполненных заказах', reportCode: id, dateFrom, dateTo, user: userName }) + `
      <h2 class="sec">Сводка</h2>
      <div class="summary">
        <div>Выполнено: <strong>${completed.length}</strong></div>
        <div>В работе: <strong>${inWork.length}</strong></div>
        <div>Просрочено: <strong>${overdue.length}</strong></div>
      </div>
      <h2 class="sec">Реестр заказов</h2>
      <table><thead><tr><th>№</th><th>Код заказа</th><th>Статус</th><th>Дата приёма</th><th>Плановая</th><th class="num">Сумма, ₽</th></tr></thead><tbody>
        ${filtered.map((o, i) => `<tr><td>${i + 1}</td><td>${o.id}</td><td>${o.status}</td><td>${new Date(o.createdAt).toLocaleDateString('ru')}</td><td>${new Date(o.deadline).toLocaleDateString('ru')}</td><td class="num">${o.totalCost.toLocaleString()}</td></tr>`).join('')}
        ${filtered.length === 0 ? '<tr><td colspan="6" style="text-align:center">Нет данных</td></tr>' : ''}
      </tbody></table>
      ${signatureBlock()}
    `;
    addSavedReport({ id, type: 'orders', dateFrom, dateTo, createdAt: new Date().toISOString(), createdBy: userName, data: { completed: completed.length, inWork: inWork.length, overdue: overdue.length } });
    printReportHTML({ title: 'Отчёт о выполненных заказах', reportCode: id, html });
  };

  const genServices = () => {
    const id = nextId('RPS');
    const totalCount = serviceData.reduce((s, x) => s + x.count, 0);
    const totalSum = serviceData.reduce((s, x) => s + x.revenue, 0);
    const html = reportHeader({ title: 'Отчёт по оказанным услугам', reportCode: id, dateFrom, dateTo, user: userName }) + `
      <h2 class="sec">Услуги</h2>
      <table><thead><tr><th>№</th><th>Услуга</th><th class="num">Количество оказаний</th><th class="num">Сумма по услуге, ₽</th></tr></thead><tbody>
        ${serviceData.map((s, i) => `<tr><td>${i + 1}</td><td>${s.name}</td><td class="num">${s.count}</td><td class="num">${s.revenue.toLocaleString()}</td></tr>`).join('')}
        ${serviceData.length === 0 ? '<tr><td colspan="4" style="text-align:center">Нет данных</td></tr>' : ''}
        <tr><td colspan="2"><strong>Итого</strong></td><td class="num"><strong>${totalCount}</strong></td><td class="num"><strong>${totalSum.toLocaleString()}</strong></td></tr>
      </tbody></table>
      ${signatureBlock()}
    `;
    addSavedReport({ id, type: 'services', dateFrom, dateTo, createdAt: new Date().toISOString(), createdBy: userName, data: serviceData });
    printReportHTML({ title: 'Отчёт по оказанным услугам', reportCode: id, html });
  };

  const genStaff = () => {
    const id = nextId('RPP');
    const html = reportHeader({ title: 'Отчёт о работе персонала', reportCode: id, dateFrom, dateTo, user: userName }) + `
      <h2 class="sec">Загрузка персонала</h2>
      <table><thead><tr><th>№</th><th>Сотрудник</th><th class="num">Кол-во выполненных операций</th><th class="num">Общее время работы, ч</th></tr></thead><tbody>
        ${empData.map((e, i) => `<tr><td>${i + 1}</td><td>${e.name}</td><td class="num">${e.count}</td><td class="num">${e.hours}</td></tr>`).join('')}
        ${empData.length === 0 ? '<tr><td colspan="4" style="text-align:center">Нет данных</td></tr>' : ''}
      </tbody></table>
      ${signatureBlock()}
    `;
    addSavedReport({ id, type: 'staff', dateFrom, dateTo, createdAt: new Date().toISOString(), createdBy: userName, data: empData });
    printReportHTML({ title: 'Отчёт о работе персонала', reportCode: id, html });
  };

  const savedReports = getSavedReports();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Отчётность</h1>
        <p className="text-sm text-muted-foreground">Формирование официальных отчётов и выгрузка в PDF</p>
      </div>

      <Card className="p-4 card-shadow">
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-xs text-muted-foreground">Период с</label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Период по</label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
          </div>
          <div className="text-xs text-muted-foreground ml-auto">Пользователь: <strong>{userName}</strong></div>
        </div>
      </Card>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Выручка</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
          <TabsTrigger value="services">Услуги</TabsTrigger>
          <TabsTrigger value="staff">Персонал</TabsTrigger>
          <TabsTrigger value="archive">Архив ({savedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="p-5 card-shadow space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Stat label="Общая выручка" value={`${totalRevenue.toLocaleString()} ₽`} />
              <Stat label="Количество оплат" value={String(paid.length)} />
              <Stat label="Средний чек" value={`${avgCheck.toLocaleString()} ₽`} />
            </div>
            <Button onClick={genRevenue} className="gap-2"><Printer className="h-4 w-4" />Сформировать PDF (RPR)</Button>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="p-5 card-shadow space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Stat label="Выполнено" value={String(completed.length)} accent="text-success" />
              <Stat label="В работе" value={String(inWork.length)} accent="text-warning" />
              <Stat label="Просрочено" value={String(overdue.length)} accent="text-destructive" />
            </div>
            <Button onClick={genOrders} className="gap-2"><Printer className="h-4 w-4" />Сформировать PDF (RPC)</Button>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card className="p-5 card-shadow space-y-4">
            <div className="space-y-1">
              {serviceData.length === 0 && <p className="text-sm text-muted-foreground">Нет данных за период</p>}
              {serviceData.map(s => (
                <div key={s.name} className="flex justify-between text-sm bg-muted/50 px-3 py-2 rounded">
                  <span>{s.name}</span>
                  <span className="text-muted-foreground">{s.count} шт • {s.revenue.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
            <Button onClick={genServices} className="gap-2"><Printer className="h-4 w-4" />Сформировать PDF (RPS)</Button>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card className="p-5 card-shadow space-y-4">
            <div className="space-y-1">
              {empData.length === 0 && <p className="text-sm text-muted-foreground">Нет операций за период</p>}
              {empData.map(e => (
                <div key={e.name} className="flex justify-between text-sm bg-muted/50 px-3 py-2 rounded">
                  <span>{e.name}</span>
                  <span className="text-muted-foreground">{e.count} операций • {e.hours} ч</span>
                </div>
              ))}
            </div>
            <Button onClick={genStaff} className="gap-2"><Printer className="h-4 w-4" />Сформировать PDF (RPP)</Button>
          </Card>
        </TabsContent>

        <TabsContent value="archive">
          <Card className="p-5 card-shadow space-y-2">
            {savedReports.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Архив пуст</p>}
            {savedReports.slice().reverse().map((r: any) => (
              <div key={r.id} className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{r.id}</span>
                  <Badge variant="outline" className="text-xs">{r.type}</Badge>
                  <span className="text-muted-foreground">{new Date(r.createdAt).toLocaleString('ru')} • {r.createdBy}</span>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
  <Card className="p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${accent || ''}`}>{value}</p>
  </Card>
);

export default ReportsPage;
