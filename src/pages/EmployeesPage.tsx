import React, { useState, useEffect } from 'react';
import { getEmployees, addEmployee, syncEmployeeCounter } from '@/lib/store';
import type { Employee } from '@/lib/types';
import { POSITIONS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, UserCog, Plus } from 'lucide-react';
import { useAuth, can } from '@/contexts/AuthContext';
import { nextId } from '@/lib/ids';
import { toast } from 'sonner';

const EmployeesPage = () => {
  const { user } = useAuth();
  const canWrite = can(user, 'employees.write');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    lastName: '', firstName: '', patronymic: '', position: POSITIONS[0],
    phone: '', email: '', hiredAt: new Date().toISOString().slice(0,10),
  });

  useEffect(() => {
    setEmployees(getEmployees());
    syncEmployeeCounter();
  }, []);

  const submit = () => {
    const { lastName, firstName, position } = form;
    if (!lastName.trim() || !firstName.trim()) { toast.error('Укажите фамилию и имя'); return; }
    const id = nextId('EM');
    const initials = `${firstName[0]}.${form.patronymic ? form.patronymic[0] + '.' : ''}`;
    const e: Employee = {
      id,
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      patronymic: form.patronymic.trim() || undefined,
      position,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      hiredAt: form.hiredAt,
      status: 'Активен',
      name: `${lastName} ${initials}`,
    };
    addEmployee(e);
    setEmployees(getEmployees());
    setOpen(false);
    setForm({ lastName: '', firstName: '', patronymic: '', position: POSITIONS[0], phone: '', email: '', hiredAt: new Date().toISOString().slice(0,10) });
    toast.success(`Сотрудник ${id} добавлен`);
  };

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
          <p className="text-sm text-muted-foreground">Список персонала химчистки</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">{employees.length} записей</Badge>
          {canWrite && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Новый сотрудник</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Добавить сотрудника</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Фамилия*</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
                  <div><Label>Имя*</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Отчество</Label><Input value={form.patronymic} onChange={e => setForm({ ...form, patronymic: e.target.value })} /></div>
                  <div className="col-span-2">
                    <Label>Должность</Label>
                    <Select value={form.position} onValueChange={v => setForm({ ...form, position: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Телефон</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Дата приёма</Label><Input type="date" value={form.hiredAt} onChange={e => setForm({ ...form, hiredAt: e.target.value })} /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
                  <Button onClick={submit}>Сохранить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
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
