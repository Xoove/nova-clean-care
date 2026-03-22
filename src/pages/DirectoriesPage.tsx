import { useState } from 'react';
import {
  ITEM_TYPES, MATERIALS, SERVICES, ORDER_STATUSES, ITEM_STATUSES,
  PAYMENT_METHODS, PAYMENT_STATUSES, POSITIONS, OPERATION_TYPES,
  NOTIFICATION_TYPES, NOTIFICATION_STATUSES, USER_ROLES_LABELS,
} from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Shirt, Layers, ShoppingBag, ListChecks, Tag, CreditCard, Wallet,
  Users, Wrench, Bell, BellDot, Shield,
} from 'lucide-react';

interface DirectoryDef {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  items: { name: string; extra?: string }[];
}

const directories: DirectoryDef[] = [
  {
    id: 'item-types', title: 'Типы изделий', icon: Shirt,
    description: 'Классификация изделий, принимаемых в химчистку',
    items: ITEM_TYPES.map(t => ({ name: t })),
  },
  {
    id: 'materials', title: 'Материалы', icon: Layers,
    description: 'Влияет на технологию обработки изделия',
    items: MATERIALS.map(m => ({ name: m })),
  },
  {
    id: 'services', title: 'Услуги', icon: ShoppingBag,
    description: 'Основа расчёта стоимости заказа',
    items: SERVICES.map(s => ({ name: s.name, extra: `${s.price} ₽` })),
  },
  {
    id: 'order-statuses', title: 'Статусы заказа', icon: ListChecks,
    description: 'Строгая последовательность этапов обработки',
    items: ORDER_STATUSES.map((s, i) => ({ name: s, extra: `Этап ${i + 1}` })),
  },
  {
    id: 'item-statuses', title: 'Статусы изделия', icon: Tag,
    description: 'Текущее состояние изделия в процессе обработки',
    items: ITEM_STATUSES.map(s => ({ name: s })),
  },
  {
    id: 'payment-methods', title: 'Способы оплаты', icon: CreditCard,
    description: 'Доступные способы приёма оплаты',
    items: PAYMENT_METHODS.map(m => ({ name: m })),
  },
  {
    id: 'payment-statuses', title: 'Статусы оплаты', icon: Wallet,
    description: 'Состояние оплаты по заказу',
    items: PAYMENT_STATUSES.map(s => ({ name: s })),
  },
  {
    id: 'positions', title: 'Должности сотрудников', icon: Users,
    description: 'Важно для назначения операций и отчётов',
    items: POSITIONS.map(p => ({ name: p })),
  },
  {
    id: 'operation-types', title: 'Типы операций', icon: Wrench,
    description: 'Виды технологических операций',
    items: OPERATION_TYPES.map(o => ({ name: o })),
  },
  {
    id: 'notification-types', title: 'Типы уведомлений', icon: Bell,
    description: 'Каналы информирования клиентов',
    items: NOTIFICATION_TYPES.map(n => ({ name: n })),
  },
  {
    id: 'notification-statuses', title: 'Статусы уведомлений', icon: BellDot,
    description: 'Состояние отправки уведомления',
    items: NOTIFICATION_STATUSES.map(s => ({ name: s })),
  },
  {
    id: 'user-roles', title: 'Роли пользователей', icon: Shield,
    description: 'Разграничение доступа к системе',
    items: USER_ROLES_LABELS.map(r => ({ name: r })),
  },
];

export default function DirectoriesPage() {
  const [activeTab, setActiveTab] = useState(directories[0].id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Справочники</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Нормативные данные системы «НИКА ЛЮКС» — {directories.length} справочников
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-lg">
          {directories.map(dir => (
            <TabsTrigger
              key={dir.id}
              value={dir.id}
              className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <dir.icon className="h-3.5 w-3.5 mr-1.5" />
              {dir.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {directories.map(dir => (
          <TabsContent key={dir.id} value={dir.id} className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <dir.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{dir.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{dir.description}</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {dir.items.length} записей
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">№</TableHead>
                      <TableHead>Наименование</TableHead>
                      {dir.items.some(i => i.extra) && (
                        <TableHead className="text-right">Значение</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dir.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        {dir.items.some(i => i.extra) && (
                          <TableCell className="text-right">
                            {item.extra && (
                              <Badge variant="outline">{item.extra}</Badge>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
