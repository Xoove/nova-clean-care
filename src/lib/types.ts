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
  'Куртка','Пальто','Костюм','Платье','Брюки','Рубашка','Кофта','Майка','Футболка',
  'Свитер','Пиджак','Юбка','Пуховик','Шорты','Жилет','Комбинезон','Шарф','Шторы','Одеяло','Плед','Другое'
] as const;

export const MATERIALS_WITH_DESC: { name: string; description: string }[] = [
  { name: 'Хлопок', description: 'Натуральный растительный материал' },
  { name: 'Шерсть', description: 'Натуральный материал животного происхождения' },
  { name: 'Синтетика', description: 'Искусственный материал' },
  { name: 'Шелк', description: 'Натуральный материал животного происхождения' },
  { name: 'Лен', description: 'Натуральный растительный материал' },
  { name: 'Вискоза', description: 'Искусственный материал из целлюлозы' },
  { name: 'Полиэстер', description: 'Синтетический материал' },
  { name: 'Кожа', description: 'Натуральный материал животного происхождения' },
  { name: 'Замша', description: 'Выделанная кожа с ворсистой поверхностью' },
  { name: 'Мех', description: 'Натуральный материал животного происхождения' },
  { name: 'Смешанный материал', description: 'Комбинация нескольких материалов' },
];
export const MATERIALS = MATERIALS_WITH_DESC.map(m => m.name) as unknown as readonly string[];

export const ITEM_STATUSES_WITH_DESC = [
  { name: 'Принято', description: 'Изделие принято от клиента' },
  { name: 'В обработке', description: 'Изделие находится в процессе обработки' },
  { name: 'Готов к выдаче', description: 'Обработка завершена, изделие готов к передаче клиенту' },
  { name: 'Выдано клиенту', description: 'Изделие передано клиенту' },
] as const;
export const ITEM_STATUSES = ['Принято','В обработке','Готово','Выдано'] as const;
export type ItemStatus = typeof ITEM_STATUSES[number];

export const DEFECT_TYPES_WITH_DESC = [
  { name: 'Потертость', description: 'Истирание материала в отдельных местах' },
  { name: 'Отсутствие фурнитуры', description: 'Недостающие пуговицы, молнии, крючки и прочее' },
  { name: 'Выцветание', description: 'Потеря исходного цвета материала' },
  { name: 'Деформация', description: 'Искажение формы изделия' },
  { name: 'Загрязнение', description: 'Общее загрязнение поверхности изделия' },
  { name: 'Повреждение материала', description: 'Механическое повреждение ткани или волокон' },
  { name: 'Другое', description: 'Прочие виды дефектов' },
] as const;

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
  'Принят','Принят в производство','Определение способа обработки','Подготовка изделия',
  'Мелкий ремонт','Пятновыведение','Чистка / стирка','Сушка','Глажение',
  'Контроль качества','Упаковка','Готов к выдаче','Выдан клиенту'
] as const;

export const ORDER_STATUSES_WITH_DESC: { name: string; description: string }[] = [
  { name: 'Принят', description: 'Заказ принят от клиента и зарегистрирован в системе' },
  { name: 'Принят в производство', description: 'Заказ передан в производственный отдел' },
  { name: 'Определение способа обработки', description: 'Выполняется определение оптимального способа обработки изделия' },
  { name: 'Подготовка изделия', description: 'Изделие подготавливается к технологической обработке' },
  { name: 'Мелкий ремонт', description: 'Выполняется мелкий ремонт изделия' },
  { name: 'Пятновыведение', description: 'Выполняется удаление пятен' },
  { name: 'Чистка / стирка', description: 'Выполняется химическая чистка или стирка изделия' },
  { name: 'Сушка', description: 'Выполняется сушка изделия' },
  { name: 'Глажение', description: 'Выполняется финишная обработка глажением' },
  { name: 'Контроль качества', description: 'Проверка результатов обработки на соответствие требованиям' },
  { name: 'Упаковка', description: 'Изделие упаковывается для передачи в зону выдачи' },
  { name: 'Готов к выдаче', description: 'Заказ готов к передаче клиенту' },
  { name: 'Выдан клиенту', description: 'Заказ передан клиенту' },
];

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

export const OPERATION_TYPES = [
  'Мелкий ремонт','Пятновыведение','Чистка','Стирка','Сушка','Глажение','Контроль качества','Упаковка'
] as const;

export const OPERATION_TYPES_WITH_DESC: { name: string; description: string }[] = [
  { name: 'Мелкий ремонт', description: 'Устранение мелких дефектов изделия' },
  { name: 'Пятновыведение', description: 'Удаление пятен с поверхности изделия' },
  { name: 'Чистка', description: 'Химическая чистка изделия' },
  { name: 'Стирка', description: 'Влажная обработка изделия' },
  { name: 'Сушка', description: 'Удаление влаги после обработки' },
  { name: 'Глажение', description: 'Финишная обработка глажением или отпариванием' },
  { name: 'Контроль качества', description: 'Проверка результатов обработки на соответствие требованиям' },
  { name: 'Упаковка', description: 'Упаковка изделия для передачи в зону выдачи' },
];

export const USER_ROLES_LABELS = [
  'Администратор-кассир','Производственный персонал','Руководитель предприятия'
] as const;

export const NOTIFICATION_TYPES = ['SMS','Email','Уведомление о готовности заказа'] as const;

export const NOTIFICATION_TYPES_WITH_DESC: { name: string; description: string }[] = [
  { name: 'SMS', description: 'Уведомление клиенту посредством SMS-сообщения' },
  { name: 'Email', description: 'Уведомление клиенту посредством электронной почты' },
];

export const NOTIFICATION_STATUSES = ['Запланировано','Отправлено','Ошибка'] as const;

export const NOTIFICATION_STATUSES_WITH_DESC: { name: string; description: string }[] = [
  { name: 'Запланировано', description: 'Уведомление создано и ожидает отправки' },
  { name: 'Отправлено', description: 'Уведомление успешно отправлено клиенту' },
  { name: 'Ошибка', description: 'При отправке уведомления произошла ошибка' },
];

export const PAYMENT_METHODS = ['Наличные','Банковская карта','Безналичный расчет'] as const;

export const PAYMENT_METHODS_WITH_DESC: { name: string; description: string }[] = [
  { name: 'Наличные', description: 'Оплата наличными денежными средствами' },
  { name: 'Банковская карта', description: 'Оплата банковской картой через терминал' },
  { name: 'Безналичный расчет', description: 'Оплата переводом на расчетный счет организации' },
];

export const PAYMENT_STATUSES = ['Не оплачено','Частично оплачено','Оплачено'] as const;

export const PAYMENT_STATUSES_WITH_DESC: { name: string; description: string }[] = [
  { name: 'Не оплачено', description: 'Оплата по заказу не произведена' },
  { name: 'Оплачено', description: 'Оплата по заказу произведена' },
];
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
