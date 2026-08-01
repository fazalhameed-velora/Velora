import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { getDiscountedPrice } from '../utils';
import { useAuth } from './AuthContext';
import notify from '../utils/notifications';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, storage?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalDiscount: number;
  itemCount: number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  subtotal: 0,
  totalDiscount: 0,
  itemCount: 0,
  isInCart: () => false,
});

const CART_KEY = 'velora_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1, color?: string, storage?: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.product._id === product._id);
      if (existing) {
        notify.success('Cart Updated', { description: `${product.name} quantity increased to ${existing.quantity + quantity}` });
        return prev.map(i => i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      notify.success('Added to Cart', { description: `${product.name} has been added to your cart.` });
      return [...prev, { product, quantity, selectedColor: color, selectedStorage: storage }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product._id !== productId));
    notify.success('Removed from Cart', { description: 'Item has been removed from your cart.' });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(i => i.product._id === productId ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((sum, item) => {
    const price = getDiscountedPrice(item.product.price, item.product.discount);
    return sum + price * item.quantity;
  }, 0);

  const totalDiscount = items.reduce((sum, item) => {
    return sum + (item.product.price - getDiscountedPrice(item.product.price, item.product.discount)) * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isInCart = useCallback((productId: string) => {
    return items.some(i => i.product._id === productId);
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, totalDiscount, itemCount, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
