import type { Client, Order, Employee, Notification, Payment, User, Delivery, Defect, EmployeeStatus } from './types';
import {
  DEFAULT_ITEM_TYPES, DEFAULT_MATERIALS, DEFAULT_ITEM_STATUSES, DEFAULT_DEFECT_TYPES,
  DEFAULT_ORDER_STATUSES, DEFAULT_PAYMENT_STATUSES, DEFAULT_PAYMENT_METHODS,
  DEFAULT_OPERATION_TYPES, DEFAULT_NOTIFICATION_TYPES, DEFAULT_NOTIFICATION_STATUSES,
  DEFAULT_POSITIONS, DEFAULT_USER_ROLES, DEFAULT_USER_STATUSES, DEFAULT_SERVICES,
} from './types';
import { nextId, setCounter } from './ids';

const STORAGE_KEYS = {
  clients: 'nika_clients',
  orders: 'nika_orders',
  employees: 'nika_employees',
  notifications: 'nika_notifications',
  payments: 'nika_payments',
  deliveries: 'nika_deliveries',
  defects: 'nika_defects',
  reports: 'nika_reports',
  currentUser: 'nika_current_user',
  orderCounter: 'nika_order_counter',
  dictionaries: 'nika_dictionaries',
  seedDone: 'nika_seed_done_v2',
} as const;

function get<T>(key: string, fallback: T[] = []): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Order counter
export const getNextOrderNumber = (): number => {
  const current = parseInt(localStorage.getItem(STORAGE_KEYS.orderCounter) || '0', 10);
  const next = current + 1;
  localStorage.setItem(STORAGE_KEYS.orderCounter, String(next));
  return next;
};

// Clients
export const getClients = () => get<Client>(STORAGE_KEYS.clients);
export const saveClients = (c: Client[]) => set(STORAGE_KEYS.clients, c);
export const addClient = (c: Client) => { const all = getClients(); all.push(c); saveClients(all); };
export const updateClient = (c: Client) => { saveClients(getClients().map(x => x.id === c.id ? c : x)); };
export const deleteClient = (id: string) => { saveClients(getClients().filter(x => x.id !== id)); };

// Orders
export const getOrders = () => get<Order>(STORAGE_KEYS.orders);
export const saveOrders = (o: Order[]) => set(STORAGE_KEYS.orders, o);
export const addOrder = (o: Order) => { const all = getOrders(); all.push(o); saveOrders(all); };
export const updateOrder = (o: Order) => { saveOrders(getOrders().map(x => x.id === o.id ? o : x)); };
export const deleteOrder = (id: string) => { saveOrders(getOrders().filter(x => x.id !== id)); };

// Employees
const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'EM01', lastName: 'Иванова', firstName: 'Анна', patronymic: 'Сергеевна', position: 'Администратор-кассир', phone: '+7 (916) 100-00-01', email: 'ivanova@nika-lux.ru', hiredAt: '2023-01-15', status: 'Активен', name: 'Иванова А.С.' },
  { id: 'EM02', lastName: 'Петров', firstName: 'Иван', patronymic: 'Викторович', position: 'Технолог', phone: '+7 (916) 100-00-02', email: 'petrov@nika-lux.ru', hiredAt: '2022-06-01', status: 'Активен', name: 'Петров И.В.' },
  { id: 'EM03', lastName: 'Сидорова', firstName: 'Мария', patronymic: 'Константиновна', position: 'Специалист по пятновыведению', phone: '+7 (916) 100-00-03', email: 'sidorova@nika-lux.ru', hiredAt: '2023-03-10', status: 'Активен', name: 'Сидорова М.К.' },
  { id: 'EM04', lastName: 'Козлов', firstName: 'Дмитрий', patronymic: 'Александрович', position: 'Оператор оборудования', phone: '+7 (916) 100-00-04', email: 'kozlov@nika-lux.ru', hiredAt: '2024-01-20', status: 'Активен', name: 'Козлов Д.А.' },
  { id: 'EM05', lastName: 'Морозова', firstName: 'Елена', patronymic: 'Павловна', position: 'Гладильщик', phone: '+7 (916) 100-00-05', email: 'morozova@nika-lux.ru', hiredAt: '2023-09-05', status: 'Активен', name: 'Морозова Е.П.' },
  { id: 'EM06', lastName: 'Волков', firstName: 'Роман', patronymic: 'Сергеевич', position: 'Швея', phone: '+7 (916) 100-00-06', email: 'volkov@nika-lux.ru', hiredAt: '2022-11-12', status: 'Активен', name: 'Волков Р.С.' },
  { id: 'EM07', lastName: 'Николаев', firstName: 'Павел', patronymic: 'Геннадьевич', position: 'Генеральный директор', phone: '+7 (916) 100-00-07', email: 'director@nika-lux.ru', hiredAt: '2020-02-01', status: 'Активен', name: 'Николаев П.Г.' },
  { id: 'EM08', lastName: 'Григорьев', firstName: 'Артём', patronymic: 'Николаевич', position: 'Водитель-экспедитор', phone: '+7 (916) 100-00-08', email: 'grigoriev@nika-lux.ru', hiredAt: '2024-04-18', status: 'Активен', name: 'Григорьев А.Н.' },
];

export const getEmployees = (): Employee[] => {
  const existing = get<Employee>(STORAGE_KEYS.employees);
  if (existing.length > 0) return existing;
  saveEmployees(DEFAULT_EMPLOYEES);
  return DEFAULT_EMPLOYEES;
};
export const saveEmployees = (e: Employee[]) => set(STORAGE_KEYS.employees, e);

// Notifications
export const getNotifications = () => get<Notification>(STORAGE_KEYS.notifications);
export const saveNotifications = (n: Notification[]) => set(STORAGE_KEYS.notifications, n);
export const addNotification = (n: Notification) => { const all = getNotifications(); all.push(n); saveNotifications(all); };

// Payments
export const getPayments = () => get<Payment>(STORAGE_KEYS.payments);
export const savePayments = (p: Payment[]) => set(STORAGE_KEYS.payments, p);
export const addPayment = (p: Payment) => { const all = getPayments(); all.push(p); savePayments(all); };
export const deletePayment = (id: string) => { savePayments(getPayments().filter(x => x.id !== id)); };

// Deliveries
export const getDeliveries = () => get<Delivery>(STORAGE_KEYS.deliveries);
export const saveDeliveries = (d: Delivery[]) => set(STORAGE_KEYS.deliveries, d);
export const addDelivery = (d: Delivery) => { const all = getDeliveries(); all.push(d); saveDeliveries(all); };

// Defects
export const getDefects = (): Defect[] => get<Defect>(STORAGE_KEYS.defects);
export const saveDefects = (d: Defect[]) => set(STORAGE_KEYS.defects, d);
export const addDefect = (d: Defect) => { const all = getDefects(); all.push(d); saveDefects(all); };
export const deleteDefect = (id: string) => { saveDefects(getDefects().filter(x => x.id !== id)); };

// Saved reports
export const getSavedReports = () => get<any>(STORAGE_KEYS.reports);
export const saveSavedReports = (r: any[]) => set(STORAGE_KEYS.reports, r);
export const addSavedReport = (r: any) => { const all = getSavedReports(); all.push(r); saveSavedReports(all); };

// Dictionaries (editable)
export interface Dictionaries {
  itemTypes: string[];
  materials: string[];
  itemStatuses: string[];
  defectTypes: string[];
  orderStatuses: string[];
  paymentStatuses: string[];
  paymentMethods: string[];
  operationTypes: string[];
  notificationTypes: string[];
  notificationStatuses: string[];
  positions: string[];
  userRoles: string[];
  userStatuses: string[];
  services: { id: string; name: string; price: number }[];
}

const DEFAULT_DICTIONARIES: Dictionaries = {
  itemTypes: [...DEFAULT_ITEM_TYPES],
  materials: [...DEFAULT_MATERIALS],
  itemStatuses: [...DEFAULT_ITEM_STATUSES],
  defectTypes: [...DEFAULT_DEFECT_TYPES],
  orderStatuses: [...DEFAULT_ORDER_STATUSES],
  paymentStatuses: [...DEFAULT_PAYMENT_STATUSES],
  paymentMethods: [...DEFAULT_PAYMENT_METHODS],
  operationTypes: [...DEFAULT_OPERATION_TYPES],
  notificationTypes: [...DEFAULT_NOTIFICATION_TYPES],
  notificationStatuses: [...DEFAULT_NOTIFICATION_STATUSES],
  positions: [...DEFAULT_POSITIONS],
  userRoles: [...DEFAULT_USER_ROLES],
  userStatuses: [...DEFAULT_USER_STATUSES],
  services: DEFAULT_SERVICES.map(s => ({ ...s })),
};

export const getDictionaries = (): Dictionaries => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.dictionaries);
    if (!raw) { saveDictionaries(DEFAULT_DICTIONARIES); return DEFAULT_DICTIONARIES; }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DICTIONARIES, ...parsed };
  } catch { return DEFAULT_DICTIONARIES; }
};
export const saveDictionaries = (d: Dictionaries) => {
  localStorage.setItem(STORAGE_KEYS.dictionaries, JSON.stringify(d));
};
export const resetDictionaries = () => saveDictionaries(DEFAULT_DICTIONARIES);

// Backup / restore
export const exportBackup = (): string => {
  const data: Record<string, any> = {};
  for (const k of Object.values(STORAGE_KEYS)) {
    const raw = localStorage.getItem(k);
    if (raw) data[k] = raw;
  }
  data['nika_id_counters'] = localStorage.getItem('nika_id_counters');
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
};

export const importBackup = (json: string) => {
  const parsed = JSON.parse(json);
  if (!parsed.data) throw new Error('Некорректный файл резервной копии');
  for (const [k, v] of Object.entries(parsed.data)) {
    if (typeof v === 'string') localStorage.setItem(k, v);
  }
};

// Mock users (login)
export const MOCK_USERS: User[] = [
  { id: 'US001', employeeId: 'EM01', name: 'Иванова А.С.', role: 'admin', position: 'Администратор-кассир' },
  { id: 'US002', employeeId: 'EM02', name: 'Петров И.В.', role: 'production', position: 'Технолог' },
];

export const getCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const setCurrentUser = (u: User | null) => {
  if (u) localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(u));
  else localStorage.removeItem(STORAGE_KEYS.currentUser);
};

// Seed demo data
export const seedDemoData = () => {
  if (localStorage.getItem(STORAGE_KEYS.seedDone)) return;
  // wipe any v1 demo orders/clients to align IDs
  localStorage.removeItem(STORAGE_KEYS.clients);
  localStorage.removeItem(STORAGE_KEYS.orders);
  localStorage.removeItem(STORAGE_KEYS.defects);
  localStorage.removeItem(STORAGE_KEYS.notifications);
  localStorage.removeItem(STORAGE_KEYS.payments);
  localStorage.removeItem(STORAGE_KEYS.deliveries);
  localStorage.removeItem('nika_id_counters');
  setCounter('CL', 0);
  setCounter('OR', 0);
  setCounter('IT', 0);
  setCounter('OH', 0);

  localStorage.setItem(STORAGE_KEYS.orderCounter, '0');
  getEmployees(); // ensure defaults
  getDictionaries();

  const c1: Client = { id: nextId('CL'), firstName: 'Елена', lastName: 'Смирнова', patronymic: 'Викторовна', phone: '+7 (916) 123-45-67', email: 'smirnova@mail.ru', note: 'Постоянный клиент', createdAt: '2025-03-01' };
  const c2: Client = { id: nextId('CL'), firstName: 'Дмитрий', lastName: 'Орлов', patronymic: 'Андреевич', phone: '+7 (925) 987-65-43', createdAt: '2025-03-05' };
  const c3: Client = { id: nextId('CL'), firstName: 'Анна', lastName: 'Кузнецова', patronymic: 'Сергеевна', phone: '+7 (903) 555-12-34', email: 'kuznetsova@ya.ru', createdAt: '2025-03-10' };
  saveClients([c1, c2, c3]);

  const now = new Date();
  const mkOrder = (client: Client, daysAgo: number, deadlineDays: number, status: string, paid: boolean, items: { type: string; material: string }[], services: { id: string; qty: number }[]): Order => {
    const id = nextId('OR');
    const orderItems = items.map(i => ({
      id: nextId('IT'),
      clientId: client.id,
      orderId: id,
      type: i.type,
      material: i.material,
      status: 'Принято' as const,
      markingCode: `MK-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
      defects: [],
    }));
    const orderServices = services.map(s => {
      const svc = DEFAULT_SERVICES.find(x => x.id === s.id)!;
      return { serviceId: s.id, quantity: s.qty, price: svc.price, sum: svc.price * s.qty };
    });
    const totalCost = orderServices.reduce((s, x) => s + x.sum, 0);
    return {
      id,
      orderNumber: getNextOrderNumber(),
      clientId: client.id,
      items: orderItems,
      services: orderServices,
      status,
      totalCost,
      paymentStatus: paid ? 'Оплачено' : 'Не оплачено',
      createdAt: new Date(now.getTime() - daysAgo * 86400000).toISOString(),
      deadline: new Date(now.getTime() + deadlineDays * 86400000).toISOString(),
      employeeId: 'EM01',
      statusHistory: [{ id: nextId('OH'), status: 'Принят', changedAt: new Date(now.getTime() - daysAgo * 86400000).toISOString(), changedBy: 'Иванова А.С.', employeeId: 'EM01' }],
      operations: [],
    };
  };

  saveOrders([
    mkOrder(c1, 3, 2, 'Чистка / стирка', true, [{ type: 'Пальто', material: 'Шерсть' }], [{ id: 'SV00001', qty: 1 }]),
    mkOrder(c2, 1, -0.5, 'Принят', false, [{ type: 'Костюм', material: 'Хлопок' }], [{ id: 'SV00001', qty: 1 }, { id: 'SV00003', qty: 1 }]),
    mkOrder(c3, 5, 1, 'Готов к выдаче', true, [{ type: 'Платье', material: 'Шелк' }], [{ id: 'SV00002', qty: 1 }, { id: 'SV00004', qty: 1 }]),
  ]);

  localStorage.setItem(STORAGE_KEYS.seedDone, '1');
};
