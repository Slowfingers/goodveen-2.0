// Frontend domain types (camelCase, matching Prisma schema).

export type UserRole = 'CUSTOMER' | 'ADMIN';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';
export type DeliveryType = 'STANDARD' | 'EXPRESS' | 'SAME_DAY';
export type PaymentMethod = 'CLICK' | 'PAYME' | 'UZUM' | 'CARD' | 'CASH';
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'EXPIRED';

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  title: string;
  street: string;
  city: string;
  district: string | null;
  zipCode: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSize {
  id: string;
  productId: string;
  name: string;
  price: number;
  height: string | null;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  composition: string[];
  careTips: string[];
  colors: string[];
  flowerTypes: string[];
  createdAt: string;
  updatedAt: string;
  sizes?: ProductSize[];
  images?: ProductImage[];
  category?: Category | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  sizeId: string;
  productName: string;
  sizeName: string;
  price: number;
  quantity: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryType: DeliveryType;
  deliveryPrice: number;
  deliveryDate: string | null;
  deliveryTime: string | null;
  address: string;
  city: string;
  phone: string;
  recipientName: string | null;
  notes: string | null;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: Pick<User, 'id' | 'email' | 'name' | 'phone'> | null;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  image: string | null;
  contentImages: string[];
  tag: string;
  size: 'half' | 'full';
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AboutPage {
  id: string;
  spaceImages: string[];
  workshopPhotos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterColor {
  id: string;
  name: string;
  hex: string;
  sortOrder: number;
  isActive: boolean;
}

export interface FilterFlowerType {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PageSetting {
  id: string;
  pageKey: string;
  heroImage: string | null;
  heroVideo: string | null;
  title: string | null;
  subtitle: string | null;
}
