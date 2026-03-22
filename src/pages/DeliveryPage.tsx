import React, { useState, useEffect } from 'react';
import { getOrders, getEmployees, addDelivery, getDeliveries, updateOrder, addNotification } from '@/lib/store';
import type { Order, Employee, Delivery } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, PackageCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const DeliveryPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const refresh = () => { setOrders(getOrders()); setEmployees(getEmployees()); setDeliveries(getDeliveries()); };
  useEffect(refresh, []);

  const readyOrders = orders.filter(o => o.status === 'Готов к выдаче');
  const filteredDeliveries = deliveries.filter(d => !search || d.recipientName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Выдача заказов</h1>
          <p className="text-sm text-muted-foreground">Фиксация передачи заказов клиентам</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2" disabled={readyOrders.length === 0}><Plus className="h-4 w-4" />Выдать заказ</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по получателю..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {readyOrders.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-muted-foreground">Готовы к выдаче ({readyOrders.length})</h3>
          <div className="space-y-2">
            {readyOrders.map(o => (
              <Card key={o.id} className="p-4 card-shadow flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Заказ №{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{o.items.map(i => i.type).join(', ')} • {o.totalCost.toLocaleString()} ₽</p>
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success">Готов</Badge>
              </Card>
            ))}
          </div>
        </>
      )}

      <h3 className="text-sm font-medium text-muted-foreground mt-4">История выдач ({filteredDeliveries.length})</h3>
      <div className="space-y-2">
        {filteredDeliveries.map(d => {
          const order = orders.find(o => o.id === d.orderId);
          const emp = employees.find(e => e.id === d.employeeId);
          return (
            <Card key={d.id} className="p-4 card-shadow flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-success" />
                  <p className="text-sm font-medium">Заказ №{order?.orderNumber || '—'}</p>
                </div>
                <p className="text-xs text-muted-foreground">Получатель: {d.recipientName}</p>
                <p className="text-xs text-muted-foreground">Сотрудник: {emp?.name || '—'} • {new Date(d.date).toLocaleString('ru')}</p>
                {d.document && <p className="text-xs text-muted-foreground">Документ: {d.document}</p>}
              </div>
              <Badge variant="outline" className="text-xs">Выдан</Badge>
            </Card>
          );
        })}
        {filteredDeliveries.length === 0 && <p className="text-center text-muted-foreground py-4">Выдач пока нет</p>}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Выдача заказа</DialogTitle></DialogHeader>
          <DeliveryForm readyOrders={readyOrders} employees={employees} userName={user?.name || ''} onDelivered={() => { setShowAdd(false); refresh(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function DeliveryForm({ readyOrders, employees, userName, onDelivered }: { readyOrders: Order[]; employees: Employee[]; userName: string; onDelivered: () => void }) {
  const [orderId, setOrderId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [document, setDocument] = useState('');

  const handleSubmit = () => {
    if (!orderId || !employeeId || !recipientName.trim()) { toast.error('Заполните обязательные поля'); return; }
    const order = readyOrders.find(o => o.id === orderId);
    if (!order) return;

    addDelivery({
      id: crypto.randomUUID(),
      orderId,
      employeeId,
      date: new Date().toISOString(),
      recipientName: recipientName.trim(),
      document: document.trim() || undefined,
    });

    updateOrder({
      ...order,
      status: 'Выдан клиенту',
      issueDate: new Date().toISOString(),
      items: order.items.map(i => ({ ...i, status: 'Выдано' as const })),
      statusHistory: [...order.statusHistory, { status: 'Выдан клиенту' as const, changedAt: new Date().toISOString(), changedBy: userName }],
    });

    toast.success('Заказ выдан клиенту');
    onDelivered();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Заказ *</label>
        <Select value={orderId} onValueChange={setOrderId}>
          <SelectTrigger><SelectValue placeholder="Выберите заказ" /></SelectTrigger>
          <SelectContent>{readyOrders.map(o => <SelectItem key={o.id} value={o.id}>№{o.orderNumber} — {o.items.map(i => i.type).join(', ')}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Сотрудник *</label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger><SelectValue placeholder="Выберите сотрудника" /></SelectTrigger>
          <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Получатель (ФИО) *</label>
        <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Фамилия Имя Отчество" />
      </div>
      <div>
        <label className="text-sm font-medium">Документ</label>
        <Input value={document} onChange={e => setDocument(e.target.value)} placeholder="Паспорт, доверенность..." />
      </div>
      <Button onClick={handleSubmit} className="w-full">Выдать заказ</Button>
    </div>
  );
}

export default DeliveryPage;
