// Types for НИКА ЛЮКС dry cleaning system

export type UserRole = 'admin' | 'production';
export type EmployeeStatus = 'Активен' | 'Заблокирован';

export interface User {
  id: string; // US001
  employeeId: string; // EM01
  name: string;
  role: UserRole;
  position: string;
}

export interface Client {
  id: string; // CL000001
  firstName: string;
  lastName: string;
  patronymic?: string;
  phone: string;
  email?: string;
  note?: string;
  createdAt: string;
}

export type ItemStatus = 'Принято' | 'В обработке' | 'Готово' | 'Выдано';

export interface Item {
  id: string; // IT000001
  clientId: string;
  orderId: string;
  type: string;
  material: string;
  status: ItemStatus;
  features?: string;
  markingCode?: string;
  defects: Defect[];
}

export interface Defect {
  id: string; // DF000001
  itemId: string;
  type: string;
  description?: string;
  location?: string;
  detectedAt: string;
  employeeId?: string;
  employeeName?: string;
}

export type OrderStatus = string;

export interface Order {
  id: string; // OR00000001
  orderNumber: number;
  clientId: string;
  items: Item[];
  services: OrderService[];
  status: OrderStatus;
  totalCost: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  deadline: string;
  actualReadyDate?: string;
  issueDate?: string;
  description?: string;
  employeeId?: string;
  statusHistory: StatusChange[];
  operations: Operation[];
}

export interface OrderService {
  serviceId: string;
  quantity: number;
  price: number;
  sum: number;
}

export interface Service {
  id: string; // SV00001
  name: string;
  price: number;
}

export type PaymentStatus = string;

export interface Payment {
  id: string; // PM0000001
  orderId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  employeeId?: string;
  date: string;
}

export interface Operation {
  id: string; // OP0000001
  orderId: string;
  itemId?: string;
  operationType: string;
  employeeId: string;
  employeeName: string;
  startedAt: string;
  completedAt?: string;
  duration?: number; // minutes
  result?: string;
  notes?: string;
}

export interface StatusChange {
  id?: string; // OH00000001
  status: OrderStatus;
  changedAt: string;
  changedBy: string;
  employeeId?: string;
}

export interface Employee {
  id: string; // EM01
  lastName: string;
  firstName: string;
  patronymic?: string;
  position: string;
  phone?: string;
  email?: string;
  hiredAt: string;
  status: EmployeeStatus;
  // Backwards compat helper
  name: string;
}

export interface Delivery {
  id: string; // DL000001
  orderId: string;
  employeeId: string;
  date: string;
  recipientLastName: string;
  recipientFirstName: string;
  recipientPatronymic?: string;
  recipientName: string; // computed combined
  document?: string;
  notes?: string;
}

export interface Notification {
  id: string; // NT00000001
  orderId: string;
  clientId: string;
  type: string;
  message: string;
  createdAt: string;
  sentAt?: string;
  status: string; // Запланировано / Отправлено / Ошибка
  read: boolean;
}

export interface SavedReport {
  id: string; // RPR00001 etc.
  type: 'revenue' | 'orders' | 'services' | 'staff';
  dateFrom?: string;
  dateTo?: string;
  createdAt: string;
  createdBy: string;
  data: any;
}

// ============= DEFAULT DICTIONARY VALUES =============
// These are used to seed the editable dictionaries.

export const DEFAULT_ITEM_TYPES = [
  'Куртка','Пальто','Костюм','Платье','Брюки','Рубашка','Кофта','Свитер',
  'Пиджак','Юбка','Пуховик','Комбинезон','Шарф','Одеяло','Другое'
];

export const DEFAULT_MATERIALS = [
  'Хлопок','Шерсть','Синтетика','Шелк','Лен','Вискоза','Полиэстер',
  'Кожа','Замша','Мех','Смешанный материал'
];

export const DEFAULT_ITEM_STATUSES = ['Принято','В обработке','Готово','Выдано'];

export const DEFAULT_DEFECT_TYPES = [
  'Потертость','Отсутствие фурнитуры','Выцветание','Деформация',
  'Загрязнение','Повреждение материала','Другое'
];

export const DEFAULT_ORDER_STATUSES = [
  'Принят','Принят в производство','Определение способа обработки','Подготовка изделия',
  'Мелкий ремонт','Пятновыведение','Чистка / стирка','Сушка','Глажение',
  'Контроль качества','Упаковка','Готов к выдаче','Выдан клиенту'
];

export const DEFAULT_PAYMENT_STATUSES = ['Не оплачено','Оплачено'];
export const DEFAULT_PAYMENT_METHODS = ['Наличные','Банковская карта','Безналичный расчет'];

export const DEFAULT_OPERATION_TYPES = [
  'Мелкий ремонт','Пятновыведение','Чистка','Стирка','Сушка',
  'Глажение','Контроль качества','Упаковка'
];

export const DEFAULT_NOTIFICATION_TYPES = ['SMS','Email'];
export const DEFAULT_NOTIFICATION_STATUSES = ['Запланировано','Отправлено','Ошибка'];

export const DEFAULT_POSITIONS = [
  'Администратор-кассир','Технолог','Генеральный директор',
  'Специалист по пятновыведению','Швея','Оператор оборудования',
  'Гладильщик','Водитель-экспедитор'
];

export const DEFAULT_USER_ROLES = ['Администратор-кассир','Производственный персонал'];
export const DEFAULT_USER_STATUSES = ['Активен','Заблокирован'];

export const DEFAULT_SERVICES: Service[] = [
  { id: 'SV00001', name: 'Химическая чистка', price: 1200 },
  { id: 'SV00002', name: 'Стирка', price: 800 },
  { id: 'SV00003', name: 'Пятновыведение', price: 400 },
  { id: 'SV00004', name: 'Глажение', price: 300 },
  { id: 'SV00005', name: 'Мелкий ремонт', price: 500 },
  { id: 'SV00006', name: 'Сушка', price: 250 },
];

// Legacy aliases used across pages
export const ORDER_STATUSES = DEFAULT_ORDER_STATUSES as readonly string[];
export const PAYMENT_METHODS = DEFAULT_PAYMENT_METHODS as readonly string[];
export const PAYMENT_STATUSES = DEFAULT_PAYMENT_STATUSES as readonly string[];
export const OPERATION_TYPES = DEFAULT_OPERATION_TYPES as readonly string[];
export const ITEM_TYPES = DEFAULT_ITEM_TYPES as readonly string[];
export const MATERIALS = DEFAULT_MATERIALS as readonly string[];
export const ITEM_STATUSES = DEFAULT_ITEM_STATUSES as readonly string[];
export const POSITIONS = DEFAULT_POSITIONS as readonly string[];
export const NOTIFICATION_TYPES = DEFAULT_NOTIFICATION_TYPES as readonly string[];
export const NOTIFICATION_STATUSES = DEFAULT_NOTIFICATION_STATUSES as readonly string[];
export const USER_ROLES_LABELS = DEFAULT_USER_ROLES as readonly string[];
export const SERVICES = DEFAULT_SERVICES;
