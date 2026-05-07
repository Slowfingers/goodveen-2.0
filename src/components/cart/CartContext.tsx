import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  size: string;
  qty: number;
  price: number;
  img: string;
}

interface CartUI {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQty: (id: string, size: string, qty: number) => void;
  clearCart: () => void;
}

const CartUIContext = createContext<CartUI | null>(null);

export function CartUIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.size === item.size);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.size === item.size
            ? { ...i, qty: i.qty + item.qty }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size)));
  }, []);

  const updateQty = useCallback((id: string, size: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.size === size ? { ...i, qty: Math.max(0, qty) } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  return (
    <CartUIContext.Provider value={{ isOpen, open, close, toggle, items, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error('useCartUI must be used within CartUIProvider');
  return ctx;
}
