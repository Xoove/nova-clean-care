import React, { useState, useEffect } from 'react';
import { getOrders, updateOrder, getEmployees, getDictionaries } from '@/lib/store';
import type { Order, Operation, Employee } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { nextId } from '@/lib/ids';

const OperationsPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const refresh = () => { setOrders(getOrders()); setEmployees(getEmployees()); };
  useEffect(refresh, []);

  const activeOrders = orders.filter(o => o.status !== 'Выдан клиенту');
  const allOps = orders.flatMap(o => o.operations.map(op => ({ ...op, orderNumber: o.orderNumber })));
  const filteredOps = allOps.filter(op => !search
    || String(op.orderNumber).includes(search)
    || op.employeeName.toLowerCase().includes(search.toLowerCase())
    || op.operationType.toLowerCase().includes(search.toLowerCase())
    || op.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Операции</h1>
          <p className="text-sm text-muted-foreground">Технологические операции</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" />Добавить</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {filteredOps.length === 0 && <p className="text-center text-muted-foreground py-8">Операций пока нет</p>}
        {filteredOps.map(op => (
          <Card key={op.id} className="p-4 card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Заказ №{op.orderNumber}</p>
                  <span className="text-xs font-mono text-muted-foreground">{op.id}</span>
                </div>
                <p className="text-xs text-muted-foreground">{op.operationType} • {op.employeeName}</p>
                <p className="text-xs text-muted-foreground">
                  Начало: {new Date(op.startedAt).toLocaleString('ru')}
                  {op.completedAt && ` • Окончание: ${new Date(op.completedAt).toLocaleString('ru')}`}
                  {op.duration != null && ` • ${op.duration} мин`}
                </p>
                {op.result && <p className="text-xs text-muted-foreground">Результат: {op.result}</p>}
                {op.notes && <p className="text-xs text-muted-foreground/70 mt-0.5">Прим.: {op.notes}</p>}
              </div>
              <Badge variant="secondary" className="text-xs">{op.completedAt ? 'Завершена' : 'В работе'}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Добавить операцию</DialogTitle></DialogHeader>
          <AddOperationForm orders={activeOrders} employees={employees} userName={user?.name || ''} userEmployeeId={user?.employeeId} onAdded={() => { setShowAdd(false); refresh(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function AddOperationForm({ orders, employees, userName, userEmployeeId, onAdded }: { orders: Order[]; employees: Employee[]; userName: string; userEmployeeId?: string; onAdded: () => void }) {
  const dicts = getDictionaries();
  const [orderId, setOrderId] = useState('');
  const [employeeId, setEmployeeId] = useState(userEmployeeId || '');
  const [operationType, setOperationType] = useState(dicts.operationTypes[0]);
  const [startedAt, setStartedAt] = useState(new Date().toISOString().slice(0, 16));
  const [completedAt, setCompletedAt] = useState('');
  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');

  const order = orders.find(o => o.id === orderId);
  const emp = employees.find(e => e.id === employeeId);
  const itemId = order?.items[0]?.id;

  let duration: number | undefined;
  if (startedAt && completedAt) {
    duration = Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000);
    if (duration < 0) duration = undefined;
  }

  const handleSubmit = () => {
    if (!orderId || !employeeId || !order) { toast.error('Заполните обязательные поля'); return; }
    const op: Operation = {
      id: nextId('OP'), orderId, itemId,
      operationType,
      employeeId,
      employeeName: emp?.name || '',
      startedAt: new Date(startedAt).toISOString(),
      completedAt: completedAt ? new Date(completedAt).toISOString() : undefined,
      duration,
      result: result.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const ORDER_STATUSES = dicts.orderStatuses;
    const statusMap: Record<string, string> = {
      'Пятновыведение': 'Пятновыведение',
      'Чистка': 'Чистка / стирка',
      'Стирка': 'Чистка / стирка',
      'Сушка': 'Сушка',
      'Глажение': 'Глажение',
      'Контроль качества': 'Контроль качества',
      'Упаковка': 'Упаковка',
    };
    const targetStatus = statusMap[operationType];
    let updated = { ...order, operations: [...order.operations, op] };

    if (targetStatus) {
      const currentIdx = ORDER_STATUSES.indexOf(order.status);
      const targetIdx = ORDER_STATUSES.indexOf(targetStatus);
      if (targetIdx > currentIdx && targetIdx >= 0) {
        let newHistory = [...order.statusHistory];
        for (let i = currentIdx + 1; i <= targetIdx; i++) {
          newHistory.push({ id: nextId('OH'), status: ORDER_STATUSES[i], changedAt: new Date().toISOString(), changedBy: userName, employeeId });
        }
        updated = { ...updated, status: ORDER_STATUSES[targetIdx], statusHistory: newHistory };
      }
    }

    updateOrder(updated);
    toast.success('Операция добавлена');
    onAdded();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Заказ *</label>
        <Select value={orderId} onValueChange={setOrderId}>
          <SelectTrigger><SelectValue placeholder="Выберите заказ" /></SelectTrigger>
          <SelectContent>{orders.map(o => <SelectItem key={o.id} value={o.id}>№{o.orderNumber} — {o.status}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Тип операции *</label>
        <Select value={operationType} onValueChange={setOperationType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{dicts.operationTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Сотрудник *</label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger><SelectValue placeholder="Выберите сотрудника" /></SelectTrigger>
          <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name} — {e.position}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Дата начала *</label>
          <Input type="datetime-local" value={startedAt} onChange={e => setStartedAt(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Дата окончания</label>
          <Input type="datetime-local" value={completedAt} onChange={e => setCompletedAt(e.target.value)} />
        </div>
      </div>
      {duration != null && duration >= 0 && <p className="text-sm text-muted-foreground">Длительность: <strong>{duration} мин</strong></p>}
      <div>
        <label className="text-sm font-medium">Результат операции</label>
        <Input value={result} onChange={e => setResult(e.target.value)} placeholder="Например: Пятна удалены полностью" />
      </div>
      <div>
        <label className="text-sm font-medium">Примечание</label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
      </div>
      <Button onClick={handleSubmit} className="w-full">Добавить операцию</Button>
    </div>
  );
}

export default OperationsPage;
