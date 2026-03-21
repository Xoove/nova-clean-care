import React, { useState, useEffect } from 'react';
import { getOrders, getPayments, addPayment, updateOrder } from '@/lib/store';
import { PAYMENT_METHODS, type Order, type Payment } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const PaymentsPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const refresh = () => { setOrders(getOrders()); setPayments(getPayments()); };
  useEffect(refresh, []);

  const unpaid = orders.filter(o => o.paymentStatus !== 'Оплачено');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Оплата</h1>
          <p className="text-sm text-muted-foreground">Управление платежами</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" />Принять оплату</Button>
      </div>

      <h3 className="text-sm font-medium text-muted-foreground">Неоплаченные заказы ({unpaid.length})</h3>
      <div className="space-y-2">
        {unpaid.map(o => (
          <Card key={o.id} className="p-4 card-shadow flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">#{o.id.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground">{o.totalCost.toLocaleString()} ₽</p>
            </div>
            <Badge variant="outline">{o.paymentStatus}</Badge>
          </Card>
        ))}
      </div>

      <h3 className="text-sm font-medium text-muted-foreground mt-6">История платежей ({payments.length})</h3>
      <div className="space-y-2">
        {payments.map(p => (
          <Card key={p.id} className="p-4 card-shadow flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">#{p.orderId.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground">{p.method} • {new Date(p.date).toLocaleDateString('ru')}</p>
            </div>
            <span className="font-semibold text-sm">{p.amount.toLocaleString()} ₽</span>
          </Card>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Принять оплату</DialogTitle></DialogHeader>
          <PaymentForm orders={unpaid} onPaid={() => { setShowAdd(false); refresh(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function PaymentForm({ orders, onPaid }: { orders: Order[]; onPaid: () => void }) {
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);

  const order = orders.find(o => o.id === orderId);

  const handleSubmit = () => {
    if (!orderId || !amount || !order) { toast.error('Заполните все поля'); return; }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) { toast.error('Некорректная сумма'); return; }

    addPayment({ id: crypto.randomUUID(), orderId, amount: numAmount, method, date: new Date().toISOString() });

    const paid = numAmount >= order.totalCost;
    updateOrder({ ...order, paymentStatus: paid ? 'Оплачено' : 'Частично оплачено' });
    toast.success('Оплата принята');
    onPaid();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Заказ</label>
        <Select value={orderId} onValueChange={setOrderId}>
          <SelectTrigger><SelectValue placeholder="Выберите заказ" /></SelectTrigger>
          <SelectContent>{orders.map(o => <SelectItem key={o.id} value={o.id}>#{o.id.slice(0, 8)} — {o.totalCost.toLocaleString()} ₽</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Сумма</label>
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={order ? `${order.totalCost}` : '0'} />
      </div>
      <div>
        <label className="text-sm font-medium">Способ оплаты</label>
        <Select value={method} onValueChange={v => setMethod(v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Button onClick={handleSubmit} className="w-full">Принять оплату</Button>
    </div>
  );
}

export default PaymentsPage;
