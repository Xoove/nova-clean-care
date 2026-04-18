import React, { useState, useEffect } from 'react';
import { getEmployees } from '@/lib/store';
import type { Employee } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, UserCog } from 'lucide-react';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => setEmployees(getEmployees()), []);

  const filtered = employees.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.lastName.toLowerCase().includes(q)
      || e.firstName.toLowerCase().includes(q)
      || e.position.toLowerCase().includes(q)
      || e.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Сотрудники</h1>
          <p className="text-sm text-muted-foreground">Список персонала химчистки (только просмотр)</p>
        </div>
        <Badge variant="outline" className="font-mono">{employees.length} записей</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по ФИО, должности, ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {filtered.map(e => (
          <Card key={e.id} className="p-4 card-shadow flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">{e.lastName} {e.firstName} {e.patronymic || ''}</p>
                <span className="text-xs font-mono text-muted-foreground">{e.id}</span>
                <Badge variant={e.status === 'Активен' ? 'secondary' : 'destructive'} className="text-xs">{e.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{e.position}</p>
              <div className="flex gap-3 text-xs text-muted-foreground/80 mt-1 flex-wrap">
                {e.phone && <span>📞 {e.phone}</span>}
                {e.email && <span>✉ {e.email}</span>}
                <span>Принят: {new Date(e.hiredAt).toLocaleDateString('ru')}</span>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Сотрудники не найдены</p>}
      </div>
    </div>
  );
};

export default EmployeesPage;
