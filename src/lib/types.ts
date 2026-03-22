// Types for НИКА ЛЮКС dry cleaning system

export type UserRole = 'admin' | 'production' | 'director';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  position: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  phone: string;
  email?: string;
  note?: string;
  createdAt: string;
}

export const ITEM_TYPES = [
  'Куртка','Пальто','Костюм','Платье','Брюки','Рубашка','Кофта','Футболка',
  'Свитер','Пиджак','Юбка','Пуховик','Шорты','Жилет','Комбинезон','Шарф','Штора','Одеяло','Плед'
] as const;

export const MATERIALS = [
  'Хлопок','Шерсть','Синтетика','Шелк','Лен','Вискоза','Полиэстер','Кожа','Замша','Мех','Смешанный материал'
] as const;

export const ITEM_STATUSES = ['Принято','В обработке','Готово','Выдано'] as const;
export type ItemStatus = typeof ITEM_STATUSES[number];

export interface Item {
  id: string;
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
  id: string;
  description: string;
  detectedAt: string;
}

export const ORDER_STATUSES = [
  'Принят','В обработке','Пятновыведение','Чистка','Сушка','Глажение',
  'Контроль качества','Готов к выдаче','Выдан'
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export interface Order {
  id: string;
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
  id: string;
  name: string;
  price: number;
}

export const SERVICES: Service[] = [
  { id: '1', name: 'Химчистка', price: 1200 },
  { id: '2', name: 'Стирка', price: 800 },
  { id: '3', name: 'Пятновыведение', price: 400 },
  { id: '4', name: 'Глажение', price: 300 },
  { id: '5', name: 'Ремонт', price: 500 },
  { id: '6', name: 'Сушка', price: 250 },
];

export const POSITIONS = [
  'Администратор-кассир','Технолог','Генеральный директор','Специалист по пятновыведению',
  'Швея','Оператор оборудования','Гладильщик','Водитель-экспедитор'
] as const;

export const OPERATION_TYPES = [
  'Ремонт','Чистка','Сушка','Глажение','Пятновыведение','Контроль качества','Стирка','Упаковка'
] as const;

export const PAYMENT_METHODS = ['Наличные','Банковская карта','Безналичный расчет'] as const;
export const PAYMENT_STATUSES = ['Не оплачено','Частично оплачено','Оплачено'] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  employeeId?: string;
  date: string;
}

export interface Operation {
  id: string;
  orderId: string;
  itemId?: string;
  operationType: string;
  employeeId: string;
  employeeName: string;
  startedAt: string;
  completedAt?: string;
  duration?: number; // minutes
  notes?: string;
}

export interface StatusChange {
  status: OrderStatus;
  changedAt: string;
  changedBy: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  employeeId: string;
  date: string;
  recipientName: string;
  document?: string;
}

export interface Notification {
  id: string;
  orderId: string;
  clientId: string;
  type: 'SMS' | 'Email';
  message: string;
  createdAt: string;
  read: boolean;
}
