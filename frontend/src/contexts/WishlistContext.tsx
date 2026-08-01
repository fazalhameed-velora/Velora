import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { userAPI } from '../services/api';
import notify from '../utils/notifications';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
  toggleWishlist: () => {},
  loading: false,
});

const WISHLIST_KEY = 'velora_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFromBackend();
    }
  }, [isAuthenticated]);

  const loadFromBackend = async () => {
    try {
      setLoading(true);
      const res: any = await userAPI.getWishlist();
      const backendItems = res.data || [];
      if (backendItems.length > 0) {
        setItems(prev => {
          const merged = [...prev];
          for (const item of backendItems) {
            if (!merged.find(p => p._id === item._id)) {
              merged.push(item);
            }
          }
          return merged;
        });
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = useCallback((product: Product) => {
    setItems(prev => {
      if (prev.find(p => p._id === product._id)) return prev;
      notify.success('Added to Wishlist', { description: `${product.name} saved to your wishlist.` });
      return [product, ...prev];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => prev.filter(p => p._id !== productId));
    notify.success('Removed from Wishlist', { description: 'Item removed from your wishlist.' });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(p => p._id === productId);
  }, [items]);

  const toggleWishlist = useCallback((product: Product) => {
    if (items.find(p => p._id === product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  }, [items, addToWishlist, removeFromWishlist]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
