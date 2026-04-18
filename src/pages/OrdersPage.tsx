import React, { useState, useEffect } from 'react';
import { getOrders, getClients, getEmployees, updateOrder, addOrder, addNotification, deleteOrder, getNextOrderNumber } from '@/lib/store';
import { ORDER_STATUSES, SERVICES, ITEM_TYPES, MATERIALS, type Order, type Client, type Item, type OrderService, type StatusChange, type Employee } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, ArrowRight, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { nextId } from '@/lib/ids';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const refresh = () => { setOrders(getOrders()); setClients(getClients()); setEmployees(getEmployees()); };
  useEffect(refresh, []);

  const now = new Date();

  const filtered = orders.filter(o => {
    const client = clients.find(c => c.id === o.clientId);
    const matchSearch = !search || client?.lastName.toLowerCase().includes(search.toLowerCase()) || client?.firstName.toLowerCase().includes(search.toLowerCase()) || String(o.orderNumber).includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const advanceStatus = (order: Order) => {
    const idx = ORDER_STATUSES.indexOf(order.status);
    if (idx < 0 || idx >= ORDER_STATUSES.length - 1) return;
    const nextStatus = ORDER_STATUSES[idx + 1];
    const change: StatusChange = { id: nextId('OH'), status: nextStatus, changedAt: new Date().toISOString(), changedBy: user?.name || '', employeeId: user?.employeeId };
    const updated: Order = { ...order, status: nextStatus, statusHistory: [...order.statusHistory, change] };

    if (nextStatus === 'Выдан клиенту') {
      updated.items = updated.items.map(i => ({ ...i, status: 'Выдано' as const }));
      updated.issueDate = new Date().toISOString();
    } else if (['Принят в производство', 'Пятновыведение', 'Чистка / стирка', 'Сушка', 'Глажение'].includes(nextStatus)) {
      updated.items = updated.items.map(i => ({ ...i, status: 'В обработке' as const }));
    } else if (['Контроль качества', 'Готов к выдаче'].includes(nextStatus)) {
      updated.items = updated.items.map(i => ({ ...i, status: 'Готово' as const }));
      if (nextStatus === 'Готов к выдаче') {
        updated.actualReadyDate = new Date().toISOString();
      }
    }

    if (nextStatus === 'Готов к выдаче') {
      addNotification({ id: nextId('NT'), orderId: order.id, clientId: order.clientId, type: 'SMS', message: `Заказ №${order.orderNumber} готов к выдаче`, createdAt: new Date().toISOString(), status: 'Запланировано', read: false });
    }

    updateOrder(updated);
    toast.success(`Статус изменён на «${nextStatus}»`);
    refresh();
    if (selectedOrder?.id === order.id) setSelectedOrder(updated);
  };

  const handleDelete = (id: string) => {
    deleteOrder(id);
    toast.success('Заказ удалён');
    refresh();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Заказы</h1>
          <p className="text-sm text-muted-foreground">Управление заказами химчистки</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => { setEditingOrder(null); setShowCreate(true); }} className="gap-2"><Plus className="h-4 w-4" />Создать заказ</Button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск по клиенту или номеру..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Все статусы" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map(o => {
          const client = clients.find(c => c.id === o.clientId);
          const overdue = new Date(o.deadline) < now && o.status !== 'Выдан клиенту';
          return (
            <Card key={o.id} className={`p-4 card-shadow hover:card-shadow-hover transition-shadow cursor-pointer ${overdue ? 'border-overdue/30' : ''}`} onClick={() => setSelectedOrder(o)}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">№{o.orderNumber}</span>
                    <span className="text-sm text-muted-foreground">{client ? `${client.lastName} ${client.firstName}` : '—'}</span>
                    {overdue && <Badge variant="destructive" className="text-xs">Просрочен</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{o.items.map(i => i.type).join(', ')}</span>
                    <span>•</span>
                    <span>{o.totalCost.toLocaleString()} ₽</span>
                    <span>•</span>
                    <span>{o.paymentStatus}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">{o.status}</Badge>
                  {o.status !== 'Выдан клиенту' && (user?.role === 'admin' || user?.role === 'production') && (
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); advanceStatus(o); }}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingOrder(o); setShowCreate(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Заказы не найдены</p>}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedOrder && <OrderDetail order={selectedOrder} clients={clients} employees={employees} onAdvance={() => advanceStatus(selectedOrder)} user={user} />}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingOrder ? 'Редактировать заказ' : 'Создать заказ'}</DialogTitle></DialogHeader>
          <CreateOrderForm clients={clients} employees={employees} initial={editingOrder} onCreated={() => { setShowCreate(false); setEditingOrder(null); refresh(); }} userName={user?.name || ''} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function OrderDetail({ order, clients, employees, onAdvance, user }: { order: Order; clients: Client[]; employees: Employee[]; onAdvance: () => void; user: any }) {
  const client = clients.find(c => c.id === order.clientId);
  const emp = employees.find(e => e.id === order.employeeId);
  const overdue = new Date(order.deadline) < new Date() && order.status !== 'Выдан клиенту';
  const statusIdx = ORDER_STATUSES.indexOf(order.status);

  return (
    <div className="space-y-5">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Заказ №{order.orderNumber}
          {overdue && <Badge variant="destructive">Просрочен</Badge>}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-muted-foreground">Клиент:</span><p className="font-medium">{client ? `${client.lastName} ${client.firstName} ${client.patronymic || ''}` : '—'}</p></div>
        <div><span className="text-muted-foreground">Телефон:</span><p className="font-medium">{client?.phone || '—'}</p></div>
        <div><span className="text-muted-foreground">Сотрудник:</span><p className="font-medium">{emp?.name || '—'}</p></div>
        <div><span className="text-muted-foreground">Стоимость:</span><p className="font-medium">{order.totalCost.toLocaleString()} ₽</p></div>
        <div><span className="text-muted-foreground">Оплата:</span><p className="font-medium">{order.paymentStatus}</p></div>
        <div><span className="text-muted-foreground">Дата приёма:</span><p className="font-medium">{new Date(order.createdAt).toLocaleDateString('ru')}</p></div>
        <div><span className="text-muted-foreground">Плановая дата:</span><p className={`font-medium ${overdue ? 'text-overdue' : ''}`}>{new Date(order.deadline).toLocaleDateString('ru')}</p></div>
        {order.actualReadyDate && <div><span className="text-muted-foreground">Факт. готовность:</span><p className="font-medium">{new Date(order.actualReadyDate).toLocaleDateString('ru')}</p></div>}
        {order.issueDate && <div><span className="text-muted-foreground">Дата выдачи:</span><p className="font-medium">{new Date(order.issueDate).toLocaleDateString('ru')}</p></div>}
      </div>

      {order.description && (
        <div><span className="text-sm text-muted-foreground">Описание:</span><p className="text-sm">{order.description}</p></div>
      )}

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Изделия</h4>
        {order.items.map(item => (
          <div key={item.id} className="bg-muted/50 rounded-md p-3 mb-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.type}</span>
              <Badge variant="outline" className="text-xs">{item.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{item.material} {item.markingCode && `• ${item.markingCode}`}</p>
            {item.features && <p className="text-xs text-muted-foreground mt-0.5">{item.features}</p>}
            {item.defects.length > 0 && (
              <div className="mt-1">
                {item.defects.map(d => <p key={d.id} className="text-xs text-overdue">⚠ {d.description}</p>)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Услуги</h4>
        {order.services.map(s => {
          const svc = SERVICES.find(x => x.id === s.serviceId);
          return (
            <div key={s.serviceId} className="flex justify-between text-sm py-1">
              <span>{svc?.name} × {s.quantity}</span>
              <span>{s.sum.toLocaleString()} ₽</span>
            </div>
          );
        })}
        <div className="flex justify-between text-sm py-1 border-t mt-1 font-medium">
          <span>Итого</span>
          <span>{order.totalCost.toLocaleString()} ₽</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Статус ({ORDER_STATUSES.indexOf(order.status) + 1} из {ORDER_STATUSES.length})</h4>
        <div className="flex flex-wrap gap-1">
          {ORDER_STATUSES.map((s, i) => (
            <div key={s} className={`text-xs px-2 py-1 rounded ${i <= statusIdx ? 'bg-primary/10 text-primary font-medium' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
          ))}
        </div>
        <p className="text-sm mt-2 font-medium">{order.status}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">История статусов</h4>
        <div className="space-y-1.5">
          {order.statusHistory.map((h, i) => (
            <div key={i} className="flex justify-between text-xs bg-muted/50 px-3 py-1.5 rounded">
              <span>{h.status}</span>
              <span className="text-muted-foreground">{new Date(h.changedAt).toLocaleString('ru')} — {h.changedBy}</span>
            </div>
          ))}
        </div>
      </div>

      {order.status !== 'Выдан клиенту' && (user?.role === 'admin' || user?.role === 'production') && (
        <Button onClick={onAdvance} className="w-full gap-2">
          <ArrowRight className="h-4 w-4" />Перевести в: {ORDER_STATUSES[statusIdx + 1]}
        </Button>
      )}
    </div>
  );
}

function CreateOrderForm({ clients, employees, initial, onCreated, userName }: { clients: Client[]; employees: Employee[]; initial: Order | null; onCreated: () => void; userName: string }) {
  const [clientId, setClientId] = useState(initial?.clientId || '');
  const [itemType, setItemType] = useState(initial?.items[0]?.type || ITEM_TYPES[0]);
  const [material, setMaterial] = useState(initial?.items[0]?.material || MATERIALS[0]);
  const [features, setFeatures] = useState(initial?.items[0]?.features || '');
  const [markingCode, setMarkingCode] = useState(initial?.items[0]?.markingCode || '');
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>(
    initial ? Object.fromEntries(initial.services.map(s => [s.serviceId, s.quantity])) : {}
  );
  const [deadline, setDeadline] = useState(initial ? initial.deadline.split('T')[0] : '');
  const [description, setDescription] = useState(initial?.description || '');
  const [employeeId, setEmployeeId] = useState(initial?.employeeId || '');

  const toggleService = (id: string) => {
    setSelectedServices(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id]; else next[id] = 1;
      return next;
    });
  };
  const setQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setSelectedServices(prev => ({ ...prev, [id]: qty }));
  };

  const serviceEntries = Object.entries(selectedServices);
  const totalCost = serviceEntries.reduce((s, [id, qty]) => s + (SERVICES.find(x => x.id === id)?.price || 0) * qty, 0);

  const handleSubmit = () => {
    if (!clientId || serviceEntries.length === 0 || !deadline) { toast.error('Заполните все обязательные поля'); return; }
    
    const orderServices: OrderService[] = serviceEntries.map(([id, qty]) => {
      const svc = SERVICES.find(x => x.id === id)!;
      return { serviceId: id, quantity: qty, price: svc.price, sum: svc.price * qty };
    });

    if (initial) {
      const updated: Order = {
        ...initial,
        clientId,
        items: [{ ...initial.items[0], clientId, type: itemType, material, features: features || undefined, markingCode: markingCode || undefined }],
        services: orderServices,
        totalCost,
        deadline: new Date(deadline).toISOString(),
        description: description || undefined,
        employeeId: employeeId || undefined,
      };
      updateOrder(updated);
      toast.success('Заказ обновлён');
    } else {
      const orderId = nextId('OR');
      const order: Order = {
        id: orderId,
        orderNumber: getNextOrderNumber(),
        clientId,
        items: [{ id: nextId('IT'), clientId, orderId, type: itemType, material, status: 'Принято', features: features || undefined, markingCode: markingCode || undefined, defects: [] }],
        services: orderServices,
        status: 'Принят',
        totalCost,
        paymentStatus: 'Не оплачено',
        createdAt: new Date().toISOString(),
        deadline: new Date(deadline).toISOString(),
        description: description || undefined,
        employeeId: employeeId || undefined,
        statusHistory: [{ id: nextId('OH'), status: 'Принят', changedAt: new Date().toISOString(), changedBy: userName }],
        operations: [],
      };
      addOrder(order);
      toast.success('Заказ создан');
    }
    onCreated();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Клиент *</label>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger><SelectValue placeholder="Выберите клиента" /></SelectTrigger>
          <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.lastName} {c.firstName}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Сотрудник</label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger><SelectValue placeholder="Выберите сотрудника" /></SelectTrigger>
          <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name} — {e.position}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Тип изделия *</label>
          <Select value={itemType} onValueChange={v => setItemType(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ITEM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Материал *</label>
          <Select value={material} onValueChange={v => setMaterial(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Код маркировки</label>
          <Input value={markingCode} onChange={e => setMarkingCode(e.target.value)} placeholder="MK-XXX" />
        </div>
        <div>
          <label className="text-sm font-medium">Особенности</label>
          <Input value={features} onChange={e => setFeatures(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Услуги *</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {SERVICES.map(s => {
            const active = selectedServices[s.id] !== undefined;
            return (
              <div key={s.id} className={`px-3 py-2 rounded-md border text-sm transition-colors ${active ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={active} onCheckedChange={() => toggleService(s.id)} />
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.price} ₽</div>
                  </div>
                </label>
                {active && (
                  <div className="flex items-center gap-2 mt-1 ml-6">
                    <label className="text-xs text-muted-foreground">Кол-во:</label>
                    <Input type="number" min={1} value={selectedServices[s.id]} onChange={e => setQty(s.id, parseInt(e.target.value) || 1)} className="h-7 w-16 text-xs" />
                    <span className="text-xs font-medium">{(s.price * (selectedServices[s.id] || 1)).toLocaleString()} ₽</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Плановая дата готовности *</label>
        <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium">Описание</label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
      </div>
      <div className="flex justify-between items-center pt-2 border-t">
        <span className="text-sm text-muted-foreground">Итого: <strong className="text-foreground">{totalCost.toLocaleString()} ₽</strong></span>
        <Button onClick={handleSubmit}>{initial ? 'Сохранить' : 'Создать'}</Button>
      </div>
    </div>
  );
}

export default OrdersPage;
