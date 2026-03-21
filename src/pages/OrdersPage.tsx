import React, { useState, useEffect } from 'react';
import { getOrders, getClients, updateOrder, addOrder, addNotification } from '@/lib/store';
import { ORDER_STATUSES, SERVICES, ITEM_TYPES, MATERIALS, type Order, type Client, type Item, type OrderService, type StatusChange } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const refresh = () => { setOrders(getOrders()); setClients(getClients()); };
  useEffect(refresh, []);

  const now = new Date();

  const filtered = orders.filter(o => {
    const client = clients.find(c => c.id === o.clientId);
    const matchSearch = !search || client?.lastName.toLowerCase().includes(search.toLowerCase()) || client?.firstName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const advanceStatus = (order: Order) => {
    const idx = ORDER_STATUSES.indexOf(order.status);
    if (idx < 0 || idx >= ORDER_STATUSES.length - 1) return;
    const nextStatus = ORDER_STATUSES[idx + 1];
    const change: StatusChange = { status: nextStatus, changedAt: new Date().toISOString(), changedBy: user?.name || '' };
    const updated: Order = { ...order, status: nextStatus, statusHistory: [...order.statusHistory, change] };
    
    // Update item status
    if (nextStatus === 'Выдан клиенту') {
      updated.items = updated.items.map(i => ({ ...i, status: 'Выдано' }));
    } else if (['Принят в производство','Определение способа обработки','Подготовка изделия','Мелкий ремонт','Пятновыведение','Чистка / стирка','Сушка','Глажение'].includes(nextStatus)) {
      updated.items = updated.items.map(i => ({ ...i, status: 'В обработке' }));
    } else if (['Контроль качества','Упаковка','Готов к выдаче'].includes(nextStatus)) {
      updated.items = updated.items.map(i => ({ ...i, status: 'Готово' }));
    }

    if (nextStatus === 'Готов к выдаче') {
      addNotification({ id: crypto.randomUUID(), orderId: order.id, clientId: order.clientId, type: 'Уведомление о готовности заказа', message: `Заказ ${order.id.slice(0,8)} готов к выдаче`, createdAt: new Date().toISOString(), read: false });
    }

    updateOrder(updated);
    toast.success(`Статус изменён на "${nextStatus}"`);
    refresh();
    if (selectedOrder?.id === order.id) setSelectedOrder(updated);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Заказы</h1>
          <p className="text-sm text-muted-foreground">Управление заказами химчистки</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" />Создать заказ</Button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск по клиенту..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
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
                    <span className="font-medium text-sm">#{o.id.slice(0, 8)}</span>
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
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Заказы не найдены</p>}
      </div>

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedOrder && <OrderDetail order={selectedOrder} clients={clients} onAdvance={() => { advanceStatus(selectedOrder); }} user={user} />}
        </DialogContent>
      </Dialog>

      {/* Create order dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Создать заказ</DialogTitle></DialogHeader>
          <CreateOrderForm clients={clients} onCreated={() => { setShowCreate(false); refresh(); }} userName={user?.name || ''} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function OrderDetail({ order, clients, onAdvance, user }: { order: Order; clients: Client[]; onAdvance: () => void; user: any }) {
  const client = clients.find(c => c.id === order.clientId);
  const overdue = new Date(order.deadline) < new Date() && order.status !== 'Выдан клиенту';
  const statusIdx = ORDER_STATUSES.indexOf(order.status);

  return (
    <div className="space-y-5">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Заказ #{order.id.slice(0, 8)}
          {overdue && <Badge variant="destructive">Просрочен</Badge>}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-muted-foreground">Клиент:</span><p className="font-medium">{client ? `${client.lastName} ${client.firstName}` : '—'}</p></div>
        <div><span className="text-muted-foreground">Телефон:</span><p className="font-medium">{client?.phone || '—'}</p></div>
        <div><span className="text-muted-foreground">Стоимость:</span><p className="font-medium">{order.totalCost.toLocaleString()} ₽</p></div>
        <div><span className="text-muted-foreground">Оплата:</span><p className="font-medium">{order.paymentStatus}</p></div>
        <div><span className="text-muted-foreground">Создан:</span><p className="font-medium">{new Date(order.createdAt).toLocaleDateString('ru')}</p></div>
        <div><span className="text-muted-foreground">Срок:</span><p className={`font-medium ${overdue ? 'text-overdue' : ''}`}>{new Date(order.deadline).toLocaleDateString('ru')}</p></div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Изделия</h4>
        {order.items.map(item => (
          <div key={item.id} className="bg-muted/50 rounded-md p-3 mb-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.type}</span>
              <Badge variant="outline" className="text-xs">{item.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{item.material}</p>
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
          return <div key={s.serviceId} className="flex justify-between text-sm py-1"><span>{svc?.name}</span><span>{svc?.price.toLocaleString()} ₽</span></div>;
        })}
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
              <span className="text-muted-foreground">{new Date(h.changedAt).toLocaleString('ru')}</span>
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

function CreateOrderForm({ clients, onCreated, userName }: { clients: Client[]; onCreated: () => void; userName: string }) {
  const [clientId, setClientId] = useState('');
  const [itemType, setItemType] = useState(ITEM_TYPES[0]);
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('');

  const toggleService = (id: string) => setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const totalCost = selectedServices.reduce((s, id) => s + (SERVICES.find(x => x.id === id)?.price || 0), 0);

  const handleSubmit = () => {
    if (!clientId || selectedServices.length === 0 || !deadline) { toast.error('Заполните все поля'); return; }
    const order: Order = {
      id: crypto.randomUUID(),
      clientId,
      items: [{ id: crypto.randomUUID(), orderId: '', type: itemType, material, status: 'Принято', defects: [] }],
      services: selectedServices.map(id => ({ serviceId: id, quantity: 1 })),
      status: 'Принят',
      totalCost,
      paymentStatus: 'Не оплачено',
      createdAt: new Date().toISOString(),
      deadline: new Date(deadline).toISOString(),
      statusHistory: [{ status: 'Принят', changedAt: new Date().toISOString(), changedBy: userName }],
      operations: [],
    };
    order.items[0].orderId = order.id;
    addOrder(order);
    toast.success('Заказ создан');
    onCreated();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Клиент</label>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger><SelectValue placeholder="Выберите клиента" /></SelectTrigger>
          <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.lastName} {c.firstName}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Тип изделия</label>
          <Select value={itemType} onValueChange={v => setItemType(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ITEM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Материал</label>
          <Select value={material} onValueChange={v => setMaterial(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Услуги</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {SERVICES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleService(s.id)}
              className={`text-left px-3 py-2 rounded-md border text-sm transition-colors ${selectedServices.includes(s.id) ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted/50'}`}
            >
              <div>{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.price} ₽</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Срок выполнения</label>
        <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
      </div>
      <div className="flex justify-between items-center pt-2 border-t">
        <span className="text-sm text-muted-foreground">Итого: <strong className="text-foreground">{totalCost.toLocaleString()} ₽</strong></span>
        <Button onClick={handleSubmit}>Создать</Button>
      </div>
    </div>
  );
}

export default OrdersPage;
