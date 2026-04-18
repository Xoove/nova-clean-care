import React, { useState, useEffect } from 'react';
import { getNotifications, saveNotifications, getOrders, getClients, addNotification, getDictionaries } from '@/lib/store';
import type { Notification, Order, Client } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Search, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { nextId } from '@/lib/ids';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const refresh = () => {
    setNotifications(getNotifications());
    setOrders(getOrders());
    setClients(getClients());
  };
  useEffect(refresh, []);

  const markSent = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, status: 'Отправлено', sentAt: new Date().toISOString(), read: true } : n);
    saveNotifications(updated);
    setNotifications(updated);
    toast.success('Уведомление отправлено');
  };

  const filtered = notifications.filter(n => !search
    || n.message.toLowerCase().includes(search.toLowerCase())
    || n.type.toLowerCase().includes(search.toLowerCase())
    || n.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Уведомления</h1>
          <p className="text-sm text-muted-foreground">Системные уведомления клиентам</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" />Создать</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по сообщению..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Уведомлений нет</p>}
        {filtered.map(n => {
          const order = orders.find(o => o.id === n.orderId);
          const client = clients.find(c => c.id === n.clientId);
          return (
            <Card key={n.id} className="p-4 card-shadow">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${n.status === 'Отправлено' ? 'bg-success/10' : 'bg-primary/10'}`}>
                  <Bell className={`h-4 w-4 ${n.status === 'Отправлено' ? 'text-success' : 'text-primary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{n.message}</p>
                    <Badge variant={n.status === 'Отправлено' ? 'secondary' : n.status === 'Ошибка' ? 'destructive' : 'outline'} className="text-xs">{n.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-mono">{n.id}</span> • {n.type}
                    {order && ` • Заказ №${order.orderNumber}`}
                    {client && ` • ${client.lastName} ${client.firstName}`}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">
                    Создано: {new Date(n.createdAt).toLocaleString('ru')}
                    {n.sentAt && ` • Отправлено: ${new Date(n.sentAt).toLocaleString('ru')}`}
                  </p>
                </div>
                {n.status !== 'Отправлено' && (
                  <Button size="sm" variant="ghost" onClick={() => markSent(n.id)} className="gap-1">
                    <Send className="h-3.5 w-3.5" />Отправить
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новое уведомление</DialogTitle></DialogHeader>
          <CreateForm orders={orders} onCreated={() => { setShowAdd(false); refresh(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function CreateForm({ orders, onCreated }: { orders: Order[]; onCreated: () => void }) {
  const dicts = getDictionaries();
  const [orderId, setOrderId] = useState('');
  const [type, setType] = useState(dicts.notificationTypes[0]);
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !message.trim()) { toast.error('Заполните все поля'); return; }
    addNotification({
      id: nextId('NT'),
      orderId: order.id,
      clientId: order.clientId,
      type,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'Запланировано',
      read: false,
    });
    toast.success('Уведомление создано');
    onCreated();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Заказ *</label>
        <Select value={orderId} onValueChange={setOrderId}>
          <SelectTrigger><SelectValue placeholder="Выберите заказ" /></SelectTrigger>
          <SelectContent>{orders.map(o => <SelectItem key={o.id} value={o.id}>№{o.orderNumber} ({o.id})</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Тип уведомления *</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{dicts.notificationTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Текст *</label>
        <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} />
      </div>
      <Button onClick={handleSubmit} className="w-full">Создать</Button>
    </div>
  );
}

export default NotificationsPage;
