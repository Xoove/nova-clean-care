import React, { useState, useEffect } from 'react';
import { getOrders, updateOrder, getEmployees } from '@/lib/store';
import { ORDER_STATUSES, type Order, type Operation, type Employee } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const OperationsPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');

  const refresh = () => { setOrders(getOrders()); setEmployees(getEmployees()); };
  useEffect(refresh, []);

  const activeOrders = orders.filter(o => o.status !== 'Выдан клиенту');
  const allOps = orders.flatMap(o => o.operations.map(op => ({ ...op, orderId: o.id, orderStatus: o.status })));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Операции</h1>
          <p className="text-sm text-muted-foreground">Технологические операции</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" />Добавить</Button>
      </div>

      <div className="space-y-2">
        {allOps.length === 0 && <p className="text-center text-muted-foreground py-8">Операций пока нет</p>}
        {allOps.map(op => (
          <Card key={op.id} className="p-4 card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Заказ #{op.orderId.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">Этап: {op.status} • {op.employeeName}</p>
                <p className="text-xs text-muted-foreground">{new Date(op.startedAt).toLocaleString('ru')}</p>
              </div>
              <Badge variant="secondary" className="text-xs">{op.completedAt ? 'Завершена' : 'В работе'}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Добавить операцию</DialogTitle></DialogHeader>
          <AddOperationForm orders={activeOrders} employees={employees} userName={user?.name || ''} onAdded={() => { setShowAdd(false); refresh(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function AddOperationForm({ orders, employees, userName, onAdded }: { orders: Order[]; employees: Employee[]; userName: string; onAdded: () => void }) {
  const [orderId, setOrderId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');

  const order = orders.find(o => o.id === orderId);
  const statusIdx = order ? ORDER_STATUSES.indexOf(order.status) : -1;
  const nextStatus = statusIdx >= 0 && statusIdx < ORDER_STATUSES.length - 1 ? ORDER_STATUSES[statusIdx + 1] : null;
  const emp = employees.find(e => e.id === employeeId);

  const handleSubmit = () => {
    if (!orderId || !employeeId || !order || !nextStatus) { toast.error('Выберите заказ и сотрудника'); return; }
    const op: Operation = {
      id: crypto.randomUUID(), orderId, status: nextStatus,
      employeeName: emp?.name || '', startedAt: new Date().toISOString(), notes: notes || undefined,
    };
    const updated: Order = {
      ...order, status: nextStatus,
      operations: [...order.operations, op],
      statusHistory: [...order.statusHistory, { status: nextStatus, changedAt: new Date().toISOString(), changedBy: userName }],
    };
    updateOrder(updated);
    toast.success(`Операция добавлена, статус → "${nextStatus}"`);
    onAdded();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Заказ</label>
        <Select value={orderId} onValueChange={setOrderId}>
          <SelectTrigger><SelectValue placeholder="Выберите заказ" /></SelectTrigger>
          <SelectContent>{orders.map(o => <SelectItem key={o.id} value={o.id}>#{o.id.slice(0, 8)} — {o.status}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {nextStatus && <p className="text-sm text-muted-foreground">Следующий этап: <strong className="text-foreground">{nextStatus}</strong></p>}
      <div>
        <label className="text-sm font-medium">Сотрудник</label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger><SelectValue placeholder="Выберите сотрудника" /></SelectTrigger>
          <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name} — {e.position}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Примечания</label>
        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Необязательно" />
      </div>
      <Button onClick={handleSubmit} className="w-full" disabled={!nextStatus}>Добавить операцию</Button>
    </div>
  );
}

export default OperationsPage;
