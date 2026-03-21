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
  phone: string;
  email?: string;
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
  orderId: string;
  type: string;
  material: string;
  status: ItemStatus;
  defects: Defect[];
}

export interface Defect {
  id: string;
  description: string;
  detectedAt: string;
}

export const ORDER_STATUSES = [
  'Принят','Принят в производство','Определение способа обработки','Подготовка изделия',
  'Мелкий ремонт','Пятновыведение','Чистка / стирка','Сушка','Глажение',
  'Контроль качества','Упаковка','Готов к выдаче','Выдан клиенту'
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export interface Order {
  id: string;
  clientId: string;
  items: Item[];
  services: OrderService[];
  status: OrderStatus;
  totalCost: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  deadline: string;
  statusHistory: StatusChange[];
  operations: Operation[];
}

export interface OrderService {
  serviceId: string;
  quantity: number;
}

export interface Service {
  id: string;
  name: string;
  price: number;
}

export const SERVICES: Service[] = [
  { id: '1', name: 'Химическая чистка', price: 1200 },
  { id: '2', name: 'Стирка', price: 800 },
  { id: '3', name: 'Пятновыведение', price: 400 },
  { id: '4', name: 'Глажение', price: 300 },
  { id: '5', name: 'Мелкий ремонт', price: 500 },
  { id: '6', name: 'Сушка', price: 250 },
];

export const POSITIONS = [
  'Администратор-кассир','Технолог','Генеральный директор','Специалист по пятновыведению',
  'Швея','Оператор оборудования','Гладильщик','Водитель-экспедитор'
] as const;

export const PAYMENT_METHODS = ['Наличные','Банковская карта','Безналичный расчет'] as const;
export const PAYMENT_STATUSES = ['Не оплачено','Частично оплачено','Оплачено'] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  date: string;
}

export interface Operation {
  id: string;
  orderId: string;
  status: OrderStatus;
  employeeName: string;
  startedAt: string;
  completedAt?: string;
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

export interface Notification {
  id: string;
  orderId: string;
  clientId: string;
  type: 'SMS' | 'Email' | 'Уведомление о готовности заказа';
  message: string;
  createdAt: string;
  read: boolean;
}
