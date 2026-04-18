import React, { useState } from 'react';
import { getDictionaries, saveDictionaries, resetDictionaries, type Dictionaries } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { nextId } from '@/lib/ids';

interface SimpleDir {
  id: keyof Omit<Dictionaries, 'services'>;
  title: string;
}

const SIMPLE_DIRS: SimpleDir[] = [
  { id: 'positions', title: 'Должности' },
  { id: 'userRoles', title: 'Роли пользователей' },
  { id: 'userStatuses', title: 'Статусы пользователей' },
  { id: 'itemTypes', title: 'Типы изделий' },
  { id: 'materials', title: 'Материалы' },
  { id: 'itemStatuses', title: 'Статусы изделий' },
  { id: 'defectTypes', title: 'Типы дефектов' },
  { id: 'orderStatuses', title: 'Статусы заказа' },
  { id: 'paymentStatuses', title: 'Статусы оплаты' },
  { id: 'paymentMethods', title: 'Способы оплаты' },
  { id: 'operationTypes', title: 'Типы операций' },
  { id: 'notificationTypes', title: 'Типы уведомлений' },
  { id: 'notificationStatuses', title: 'Статусы отправки уведомлений' },
];

export default function DirectoriesPage() {
  const [dicts, setDicts] = useState<Dictionaries>(getDictionaries());
  const [activeTab, setActiveTab] = useState<string>(SIMPLE_DIRS[0].id);

  const updateDicts = (next: Dictionaries) => {
    saveDictionaries(next);
    setDicts({ ...next });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Справочники</h1>
          <p className="text-sm text-muted-foreground">Нормативно-справочная информация системы — можно изменять</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          if (confirm('Восстановить значения справочников по умолчанию?')) {
            resetDictionaries();
            setDicts(getDictionaries());
            toast.success('Справочники восстановлены');
          }
        }}>Сбросить</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-lg">
          {SIMPLE_DIRS.map(d => (
            <TabsTrigger key={d.id} value={d.id} className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {d.title}
            </TabsTrigger>
          ))}
          <TabsTrigger value="services" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Услуги
          </TabsTrigger>
        </TabsList>

        {SIMPLE_DIRS.map(d => (
          <TabsContent key={d.id} value={d.id} className="mt-4">
            <SimpleDictEditor
              title={d.title}
              items={dicts[d.id] as string[]}
              onChange={(items) => updateDicts({ ...dicts, [d.id]: items })}
            />
          </TabsContent>
        ))}

        <TabsContent value="services" className="mt-4">
          <ServicesEditor
            services={dicts.services}
            onChange={(services) => updateDicts({ ...dicts, services })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SimpleDictEditor({ title, items, onChange }: { title: string; items: string[]; onChange: (items: string[]) => void }) {
  const [newName, setNewName] = useState('');

  const add = () => {
    const v = newName.trim();
    if (!v) return;
    if (items.includes(v)) { toast.error('Такая запись уже есть'); return; }
    onChange([...items, v]);
    setNewName('');
    toast.success('Добавлено');
  };

  const remove = (name: string) => {
    onChange(items.filter(x => x !== name));
    toast.success('Удалено');
  };

  return (
    <Card className="p-5 card-shadow space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">Записей: {items.length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Новая запись..." onKeyDown={e => e.key === 'Enter' && add()} />
        <Button onClick={add} className="gap-1"><Plus className="h-4 w-4" />Добавить</Button>
      </div>

      <div className="space-y-1">
        {items.map((it, i) => (
          <div key={it} className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded text-sm">
            <span><span className="font-mono text-xs text-muted-foreground mr-2">{String(i + 1).padStart(2, '0')}</span>{it}</span>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(it)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ServicesEditor({ services, onChange }: { services: { id: string; name: string; price: number }[]; onChange: (s: { id: string; name: string; price: number }[]) => void }) {
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const add = () => {
    const name = newName.trim();
    const price = Number(newPrice);
    if (!name || isNaN(price) || price < 0) { toast.error('Заполните название и цену'); return; }
    onChange([...services, { id: nextId('SV'), name, price }]);
    setNewName(''); setNewPrice('');
    toast.success('Услуга добавлена');
  };

  const remove = (id: string) => {
    onChange(services.filter(s => s.id !== id));
    toast.success('Услуга удалена');
  };

  return (
    <Card className="p-5 card-shadow space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Услуги</h2>
          <p className="text-sm text-muted-foreground">Записей: {services.length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Название услуги" />
        <Input value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Цена, ₽" type="number" className="w-32" />
        <Button onClick={add} className="gap-1"><Plus className="h-4 w-4" />Добавить</Button>
      </div>

      <div className="space-y-1">
        {services.map(s => (
          <div key={s.id} className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded text-sm">
            <span className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">{s.id}</span>
              <span>{s.name}</span>
            </span>
            <span className="flex items-center gap-2">
              <Badge variant="outline">{s.price} ₽</Badge>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
