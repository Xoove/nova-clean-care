import React, { useState, useEffect } from 'react';
import { getDefects, addDefect, deleteDefect, getOrders, getEmployees, getDictionaries, updateOrder } from '@/lib/store';
import type { Defect, Order, Employee, Item } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { nextId } from '@/lib/ids';

const DefectsPage = () => {
  const { user } = useAuth();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const refresh = () => {
    setDefects(getDefects());
    setOrders(getOrders());
    setEmployees(getEmployees());
  };
  useEffect(refresh, []);

  const itemMap: Record<string, { item: Item; order: Order }> = {};
  orders.forEach(o => o.items.forEach(it => { itemMap[it.id] = { item: it, order: o }; }));

  const filtered = defects.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.id.toLowerCase().includes(q)
      || d.type.toLowerCase().includes(q)
      || (d.description?.toLowerCase().includes(q) ?? false)
      || (itemMap[d.itemId]?.item.type.toLowerCase().includes(q) ?? false);
  });

  const handleDelete = (id: string) => {
    deleteDefect(id);
    toast.success('Дефект удалён');
    refresh();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Дефекты</h1>
          <p className="text-sm text-muted-foreground">Учёт дефектов изделий</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" />Зафиксировать дефект</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по ID, типу, описанию..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {filtered.map(d => {
          const ctx = itemMap[d.itemId];
          return (
            <Card key={d.id} className="p-4 card-shadow flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{d.type}</span>
                  <span className="text-xs font-mono text-muted-foreground">{d.id}</span>
                  {ctx && <span className="text-xs text-muted-foreground">• Заказ №{ctx.order.orderNumber} • {ctx.item.type}</span>}
                </div>
                {d.description && <p className="text-sm text-muted-foreground mt-0.5">{d.description}</p>}
                <div className="flex gap-3 text-xs text-muted-foreground/80 mt-1 flex-wrap">
                  {d.location && <span>📍 {d.location}</span>}
                  <span>📅 {new Date(d.detectedAt).toLocaleString('ru')}</span>
                  {d.employeeName && <span>👤 {d.employeeName}</span>}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(d.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Дефектов не зафиксировано</p>}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Зафиксировать дефект</DialogTitle></DialogHeader>
          <DefectForm orders={orders} employees={employees} userName={user?.name || ''} userEmployeeId={user?.employeeId} onSaved={() => { setShowAdd(false); refresh(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function DefectForm({ orders, employees, userName, userEmployeeId, onSaved }: { orders: Order[]; employees: Employee[]; userName: string; userEmployeeId?: string; onSaved: () => void }) {
  const dicts = getDictionaries();
  const [orderId, setOrderId] = useState('');
  const [itemId, setItemId] = useState('');
  const [type, setType] = useState(dicts.defectTypes[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [employeeId, setEmployeeId] = useState(userEmployeeId || '');

  const order = orders.find(o => o.id === orderId);
  const items = order?.items || [];

  const handleSubmit = () => {
    if (!orderId || !itemId || !type) { toast.error('Заполните обязательные поля'); return; }
    const emp = employees.find(e => e.id === employeeId);
    const defect: Defect = {
      id: nextId('DF'),
      itemId,
      type,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      detectedAt: new Date().toISOString(),
      employeeId: employeeId || undefined,
      employeeName: emp?.name || userName || undefined,
    };
    addDefect(defect);
    // Also attach to item.defects in order
    if (order) {
      const updated: Order = {
        ...order,
        items: order.items.map(i => i.id === itemId ? { ...i, defects: [...i.defects, defect] } : i),
      };
      updateOrder(updated);
    }
    toast.success('Дефект зафиксирован');
    onSaved();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Заказ *</label>
        <Select value={orderId} onValueChange={(v) => { setOrderId(v); setItemId(''); }}>
          <SelectTrigger><SelectValue placeholder="Выберите заказ" /></SelectTrigger>
          <SelectContent>{orders.map(o => <SelectItem key={o.id} value={o.id}>№{o.orderNumber} ({o.id})</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Изделие *</label>
        <Select value={itemId} onValueChange={setItemId} disabled={!order}>
          <SelectTrigger><SelectValue placeholder="Выберите изделие" /></SelectTrigger>
          <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.type} • {i.material} ({i.id})</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Тип дефекта *</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{dicts.defectTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Описание</label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
      </div>
      <div>
        <label className="text-sm font-medium">Местонахождение</label>
        <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Например: левый рукав, воротник" />
      </div>
      <div>
        <label className="text-sm font-medium">Сотрудник, зафиксировавший дефект</label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger><SelectValue placeholder="Выберите сотрудника" /></SelectTrigger>
          <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Button onClick={handleSubmit} className="w-full">Зафиксировать</Button>
    </div>
  );
}

export default DefectsPage;
