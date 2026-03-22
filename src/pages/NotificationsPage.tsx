import React, { useState, useEffect } from 'react';
import { getNotifications, saveNotifications } from '@/lib/store';
import type { Notification } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bell, Search } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => setNotifications(getNotifications()), []);

  const markRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
    setNotifications(updated);
  };

  const filtered = notifications.filter(n => !search || n.message.toLowerCase().includes(search.toLowerCase()) || n.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Уведомления</h1>
        <p className="text-sm text-muted-foreground">Системные уведомления</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по сообщению..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Уведомлений нет</p>}
        {filtered.map(n => (
          <Card key={n.id} className={`p-4 card-shadow cursor-pointer transition-colors ${n.read ? 'opacity-60' : ''}`} onClick={() => markRead(n.id)}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${n.read ? 'bg-muted' : 'bg-primary/10'}`}>
                <Bell className={`h-4 w-4 ${n.read ? 'text-muted-foreground' : 'text-primary'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.message}</p>
                  {!n.read && <Badge className="text-xs bg-primary text-primary-foreground">Новое</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{n.type} • {new Date(n.createdAt).toLocaleString('ru')}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
