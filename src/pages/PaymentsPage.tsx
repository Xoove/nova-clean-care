import React, { useState, useEffect } from 'react';
import { getOrders, getPayments, addPayment, updateOrder, deletePayment, getEmployees } from '@/lib/store';
import { PAYMENT_METHODS, type Order, type Payment, type Employee } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const PaymentsPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const refresh = () => { setOrders(getOrders()); setPayments(getPayments()); setEmployees(getEmployees()); };
  useEffect(refresh, []);

  const unpaid = orders.filter(o => o.paymentStatus !== 'Оплачено');
  const filteredPayments = payments.filter(p => !search || p.orderId.includes(search) || p.method.toLowerCase().includes(search.toLowerCase()));

  const handleDeletePayment = (id: string) => {
    deletePayment(id);
    toast.success('Платёж удалён');
    refresh();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Оплата</h1>
          <p className="text-sm text-muted-foreground">Управление платежами</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" />Принять оплату</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по способу оплаты..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <h3 className="text-sm font-medium text-muted-foreground">Неоплаченные заказы ({unpaid.length})</h3>
      <div className="space-y-2">
        {unpaid.map(o => (
          <Card key={o.id} className="p-4 card-shadow flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">№{o.orderNumber}</p>
              <p className="text-xs text-muted-foreground">{o.totalCost.toLocaleString()} ₽</p>
            </div>
            <Badge variant="outline">{o.paymentStatus}</Badge>
          </Card>
        ))}
        {unpaid.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Все заказы оплачены</p>}
      </div>

      <h3 className="text-sm font-medium text-muted-foreground mt-6">История платежей ({filteredPayments.length})</h3>
      <div className="space-y-2">
        {filteredPayments.map(p => {
          const order = orders.find(o => o.id === p.orderId);
          const emp = employees.find(e => e.id === p.employeeId);
          return (
            <Card key={p.id} className="p-4 card-shadow flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Заказ №{order?.orderNumber || '—'}</p>
                <p className="text-xs text-muted-foreground">{p.method} • {new Date(p.date).toLocaleDateString('ru')} • {p.status}</p>
                {emp && <p className="text-xs text-muted-foreground">Сотрудник: {emp.name}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{p.amount.toLocaleString()} ₽</span>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeletePayment(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Принять оплату</DialogTitle></DialogHeader>
          <PaymentForm orders={unpaid} employees={employees} userId={user?.id} onPaid={() => { setShowAdd(false); refresh(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function PaymentForm({ orders, employees, userId, onPaid }: { orders: Order[]; employees: Employee[]; userId?: string; onPaid: () => void }) {
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS[0] as string);
  const [employeeId, setEmployeeId] = useState(userId || '');

  const order = orders.find(o => o.id === orderId);

  const handleSubmit = () => {
    if (!orderId || !amount || !order) { toast.error('Заполните все поля'); return; }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) { toast.error('Некорректная сумма'); return; }

    const status = numAmount >= order.totalCost ? 'Оплачено' as const : 'Частично оплачено' as const;
    addPayment({ id: crypto.randomUUID(), orderId, amount: numAmount, method, status, employeeId: employeeId || undefined, date: new Date().toISOString() });
    updateOrder({ ...order, paymentStatus: status });
    toast.success('Оплата принята');
    onPaid();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Заказ *</label>
        <Select value={orderId} onValueChange={setOrderId}>
          <SelectTrigger><SelectValue placeholder="Выберите заказ" /></SelectTrigger>
          <SelectContent>{orders.map(o => <SelectItem key={o.id} value={o.id}>№{o.orderNumber} — {o.totalCost.toLocaleString()} ₽</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Сумма *</label>
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={order ? `${order.totalCost}` : '0'} />
      </div>
      <div>
        <label className="text-sm font-medium">Способ оплаты *</label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Сотрудник</label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger><SelectValue placeholder="Выберите сотрудника" /></SelectTrigger>
          <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Button onClick={handleSubmit} className="w-full">Принять оплату</Button>
    </div>
  );
}

export default PaymentsPage;
