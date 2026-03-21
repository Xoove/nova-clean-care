import type { Client, Order, Employee, Notification, Payment, User } from './types';

const STORAGE_KEYS = {
  clients: 'nika_clients',
  orders: 'nika_orders',
  employees: 'nika_employees',
  notifications: 'nika_notifications',
  payments: 'nika_payments',
  currentUser: 'nika_current_user',
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

// Clients
export const getClients = () => get<Client>(STORAGE_KEYS.clients);
export const saveClients = (c: Client[]) => set(STORAGE_KEYS.clients, c);
export const addClient = (c: Client) => { const all = getClients(); all.push(c); saveClients(all); };
export const updateClient = (c: Client) => {
  const all = getClients().map(x => x.id === c.id ? c : x);
  saveClients(all);
};

// Orders
export const getOrders = () => get<Order>(STORAGE_KEYS.orders);
export const saveOrders = (o: Order[]) => set(STORAGE_KEYS.orders, o);
export const addOrder = (o: Order) => { const all = getOrders(); all.push(o); saveOrders(all); };
export const updateOrder = (o: Order) => {
  const all = getOrders().map(x => x.id === o.id ? o : x);
  saveOrders(all);
};

// Employees
export const getEmployees = (): Employee[] => {
  const existing = get<Employee>(STORAGE_KEYS.employees);
  if (existing.length > 0) return existing;
  const defaults: Employee[] = [
    { id: '1', name: 'Иванова А.С.', position: 'Администратор-кассир' },
    { id: '2', name: 'Петров И.В.', position: 'Технолог' },
    { id: '3', name: 'Сидорова М.К.', position: 'Специалист по пятновыведению' },
    { id: '4', name: 'Козлов Д.А.', position: 'Оператор оборудования' },
    { id: '5', name: 'Морозова Е.П.', position: 'Гладильщик' },
    { id: '6', name: 'Волков Р.С.', position: 'Швея' },
    { id: '7', name: 'Николаев П.Г.', position: 'Генеральный директор' },
  ];
  saveEmployees(defaults);
  return defaults;
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

// Current user (mock auth)
export const MOCK_USERS: User[] = [
  { id: '1', name: 'Иванова А.С.', role: 'admin', position: 'Администратор-кассир' },
  { id: '2', name: 'Петров И.В.', role: 'production', position: 'Технолог' },
  { id: '7', name: 'Николаев П.Г.', role: 'director', position: 'Генеральный директор' },
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
  if (getClients().length > 0) return;
  const clients: Client[] = [
    { id: 'c1', firstName: 'Елена', lastName: 'Смирнова', phone: '+7 (916) 123-45-67', email: 'smirnova@mail.ru', createdAt: '2025-03-01' },
    { id: 'c2', firstName: 'Дмитрий', lastName: 'Орлов', phone: '+7 (925) 987-65-43', createdAt: '2025-03-05' },
    { id: 'c3', firstName: 'Анна', lastName: 'Кузнецова', phone: '+7 (903) 555-12-34', email: 'kuznetsova@ya.ru', createdAt: '2025-03-10' },
  ];
  saveClients(clients);

  const now = new Date();
  const orders: Order[] = [
    {
      id: 'o1', clientId: 'c1',
      items: [{ id: 'i1', orderId: 'o1', type: 'Пальто', material: 'Шерсть', status: 'В обработке', defects: [] }],
      services: [{ serviceId: '1', quantity: 1 }],
      status: 'Чистка / стирка', totalCost: 1200, paymentStatus: 'Оплачено',
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      deadline: new Date(now.getTime() + 2 * 86400000).toISOString(),
      statusHistory: [
        { status: 'Принят', changedAt: new Date(now.getTime() - 3 * 86400000).toISOString(), changedBy: 'Иванова А.С.' },
        { status: 'Принят в производство', changedAt: new Date(now.getTime() - 2 * 86400000).toISOString(), changedBy: 'Иванова А.С.' },
      ],
      operations: [],
    },
    {
      id: 'o2', clientId: 'c2',
      items: [{ id: 'i2', orderId: 'o2', type: 'Костюм', material: 'Хлопок', status: 'Принято', defects: [{ id: 'd1', description: 'Пятно на рукаве', detectedAt: new Date().toISOString() }] }],
      services: [{ serviceId: '1', quantity: 1 }, { serviceId: '3', quantity: 1 }],
      status: 'Принят', totalCost: 1600, paymentStatus: 'Не оплачено',
      createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      deadline: new Date(now.getTime() - 0.5 * 86400000).toISOString(), // overdue
      statusHistory: [
        { status: 'Принят', changedAt: new Date(now.getTime() - 1 * 86400000).toISOString(), changedBy: 'Иванова А.С.' },
      ],
      operations: [],
    },
    {
      id: 'o3', clientId: 'c3',
      items: [{ id: 'i3', orderId: 'o3', type: 'Платье', material: 'Шелк', status: 'Готово', defects: [] }],
      services: [{ serviceId: '2', quantity: 1 }, { serviceId: '4', quantity: 1 }],
      status: 'Готов к выдаче', totalCost: 1100, paymentStatus: 'Оплачено',
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      deadline: new Date(now.getTime() + 1 * 86400000).toISOString(),
      statusHistory: [
        { status: 'Принят', changedAt: new Date(now.getTime() - 5 * 86400000).toISOString(), changedBy: 'Иванова А.С.' },
      ],
      operations: [],
    },
  ];
  saveOrders(orders);
};
