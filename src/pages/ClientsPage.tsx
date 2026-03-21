import React, { useState, useEffect } from 'react';
import { getClients, addClient, updateClient } from '@/lib/store';
import type { Client } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const refresh = () => setClients(getClients());
  useEffect(refresh, []);

  const filtered = clients.filter(c =>
    !search || c.lastName.toLowerCase().includes(search.toLowerCase()) || c.firstName.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Клиенты</h1>
          <p className="text-sm text-muted-foreground">База клиентов химчистки</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2"><Plus className="h-4 w-4" />Добавить</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по имени или телефону..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {filtered.map(c => (
          <Card key={c.id} className="p-4 card-shadow flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{c.lastName} {c.firstName}</p>
              <p className="text-xs text-muted-foreground">{c.phone} {c.email && `• ${c.email}`}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(c); setShowForm(true); }}><Pencil className="h-4 w-4" /></Button>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Клиенты не найдены</p>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Редактировать клиента' : 'Новый клиент'}</DialogTitle></DialogHeader>
          <ClientForm initial={editing} onSave={() => { setShowForm(false); refresh(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

function ClientForm({ initial, onSave }: { initial: Client | null; onSave: () => void }) {
  const [firstName, setFirstName] = useState(initial?.firstName || '');
  const [lastName, setLastName] = useState(initial?.lastName || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [email, setEmail] = useState(initial?.email || '');

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) { toast.error('Заполните обязательные поля'); return; }
    if (initial) {
      updateClient({ ...initial, firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), email: email.trim() || undefined });
      toast.success('Клиент обновлён');
    } else {
      addClient({ id: crypto.randomUUID(), firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), email: email.trim() || undefined, createdAt: new Date().toISOString() });
      toast.success('Клиент добавлен');
    }
    onSave();
  };

  return (
    <div className="space-y-3">
      <div><label className="text-sm font-medium">Фамилия *</label><Input value={lastName} onChange={e => setLastName(e.target.value)} /></div>
      <div><label className="text-sm font-medium">Имя *</label><Input value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
      <div><label className="text-sm font-medium">Телефон *</label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
      <div><label className="text-sm font-medium">Email</label><Input value={email} onChange={e => setEmail(e.target.value)} /></div>
      <Button onClick={handleSubmit} className="w-full">{initial ? 'Сохранить' : 'Добавить'}</Button>
    </div>
  );
}

export default ClientsPage;
