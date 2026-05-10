import { apiRequest } from './client';
import type {
  AboutPage,
  Category,
  ContactSettings,
  Event,
  FilterColor,
  FilterFlowerType,
  Order,
  PageSetting,
  Product,
  ProductImage,
  ProductSize,
  User,
} from './types';

// ============================================================
// AUTH
// ============================================================
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    }),
  register: (email: string, password: string, name?: string) =>
    apiRequest<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: { email, password, name },
      skipAuth: true,
    }),
  me: () => apiRequest<{ user: User }>('/api/auth/me'),
  updateProfile: (data: { name?: string; phone?: string | null }) =>
    apiRequest<{ user: User }>('/api/auth/profile', { method: 'PATCH', body: data }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ ok: boolean }>('/api/auth/password', {
      method: 'PATCH',
      body: { currentPassword, newPassword },
    }),
};

// ============================================================
// PRODUCTS
// ============================================================
export const productsApi = {
  list: (params?: { search?: string; categoryId?: string; onlyActive?: boolean }) =>
    apiRequest<Product[]>('/api/products', { query: params }),
  getById: (id: string) => apiRequest<Product>(`/api/products/${id}`),
  getBySlug: (slug: string) => apiRequest<Product>(`/api/products/by-slug/${slug}`),
  create: (input: Partial<Product>) =>
    apiRequest<Product>('/api/products', { method: 'POST', body: input }),
  update: (id: string, input: Partial<Product>) =>
    apiRequest<Product>(`/api/products/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => apiRequest<void>(`/api/products/${id}`, { method: 'DELETE' }),

  addSize: (productId: string, input: Omit<Partial<ProductSize>, 'productId'>) =>
    apiRequest<ProductSize>(`/api/products/${productId}/sizes`, { method: 'POST', body: input }),
  updateSize: (sizeId: string, input: Partial<ProductSize>) =>
    apiRequest<ProductSize>(`/api/products/sizes/${sizeId}`, { method: 'PUT', body: input }),
  removeSize: (sizeId: string) =>
    apiRequest<void>(`/api/products/sizes/${sizeId}`, { method: 'DELETE' }),

  addImage: (productId: string, input: { url: string; alt?: string | null; sortOrder?: number }) =>
    apiRequest<ProductImage>(`/api/products/${productId}/images`, { method: 'POST', body: input }),
  removeImage: (imageId: string) =>
    apiRequest<void>(`/api/products/images/${imageId}`, { method: 'DELETE' }),
};

// ============================================================
// CATEGORIES
// ============================================================
export const categoriesApi = {
  list: (onlyActive = false) =>
    apiRequest<Category[]>('/api/categories', { query: { onlyActive } }),
  create: (input: Partial<Category>) =>
    apiRequest<Category>('/api/categories', { method: 'POST', body: input }),
  update: (id: string, input: Partial<Category>) =>
    apiRequest<Category>(`/api/categories/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => apiRequest<void>(`/api/categories/${id}`, { method: 'DELETE' }),
};

// ============================================================
// EVENTS
// ============================================================
export const eventsApi = {
  list: (params?: { onlyPublished?: boolean; tag?: string }) =>
    apiRequest<Event[]>('/api/events', { query: params }),
  getById: (id: string) => apiRequest<Event>(`/api/events/${id}`),
  getBySlug: (slug: string) => apiRequest<Event>(`/api/events/by-slug/${slug}`),
  create: (input: Partial<Event>) =>
    apiRequest<Event>('/api/events', { method: 'POST', body: input }),
  update: (id: string, input: Partial<Event>) =>
    apiRequest<Event>(`/api/events/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => apiRequest<void>(`/api/events/${id}`, { method: 'DELETE' }),
};

// ============================================================
// ORDERS
// ============================================================
export const ordersApi = {
  listAdmin: () => apiRequest<Order[]>('/api/orders'),
  listMine: () => apiRequest<Order[]>('/api/orders/mine'),
  getById: (id: string) => apiRequest<Order>(`/api/orders/${id}`),
  update: (
    id: string,
    patch: { status?: Order['status']; paymentStatus?: Order['paymentStatus'] },
  ) => apiRequest<Order>(`/api/orders/${id}`, { method: 'PATCH', body: patch }),
  remove: (id: string) => apiRequest<void>(`/api/orders/${id}`, { method: 'DELETE' }),
};

// ============================================================
// USERS
// ============================================================
export const usersApi = {
  list: () => apiRequest<User[]>('/api/users'),
  updateRole: (id: string, role: User['role']) =>
    apiRequest<User>(`/api/users/${id}/role`, { method: 'PATCH', body: { role } }),
};

// ============================================================
// FILTERS
// ============================================================
export const filtersApi = {
  listColors: (onlyActive = false) =>
    apiRequest<FilterColor[]>('/api/filters/colors', { query: { onlyActive } }),
  createColor: (input: Partial<FilterColor>) =>
    apiRequest<FilterColor>('/api/filters/colors', { method: 'POST', body: input }),
  updateColor: (id: string, input: Partial<FilterColor>) =>
    apiRequest<FilterColor>(`/api/filters/colors/${id}`, { method: 'PUT', body: input }),
  removeColor: (id: string) =>
    apiRequest<void>(`/api/filters/colors/${id}`, { method: 'DELETE' }),

  listFlowerTypes: (onlyActive = false) =>
    apiRequest<FilterFlowerType[]>('/api/filters/flower-types', { query: { onlyActive } }),
  createFlowerType: (input: Partial<FilterFlowerType>) =>
    apiRequest<FilterFlowerType>('/api/filters/flower-types', { method: 'POST', body: input }),
  updateFlowerType: (id: string, input: Partial<FilterFlowerType>) =>
    apiRequest<FilterFlowerType>(`/api/filters/flower-types/${id}`, {
      method: 'PUT',
      body: input,
    }),
  removeFlowerType: (id: string) =>
    apiRequest<void>(`/api/filters/flower-types/${id}`, { method: 'DELETE' }),
};

// ============================================================
// PAGES & ABOUT
// ============================================================
export const pagesApi = {
  listSettings: () => apiRequest<PageSetting[]>('/api/pages/settings'),
  upsertSetting: (input: Partial<PageSetting> & { pageKey: string }) =>
    apiRequest<PageSetting>('/api/pages/settings', { method: 'PUT', body: input }),
  getAbout: () => apiRequest<AboutPage>('/api/pages/about'),
  updateAbout: (input: Partial<AboutPage>) =>
    apiRequest<AboutPage>('/api/pages/about', { method: 'PUT', body: input }),
  getContact: () => apiRequest<ContactSettings>('/api/pages/contact'),
  updateContact: (input: Partial<ContactSettings>) =>
    apiRequest<ContactSettings>('/api/pages/contact', { method: 'PUT', body: input }),
};
