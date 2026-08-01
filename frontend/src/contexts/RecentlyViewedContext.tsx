import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Product } from '../types';

interface RecentlyViewedContextType {
  items: Product[];
  addToRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType>({
  items: [],
  addToRecentlyViewed: () => {},
  clearRecentlyViewed: () => {},
});

const RECENTLY_VIEWED_KEY = 'velora_recently_viewed';
const MAX_ITEMS = 12;

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  }, [items]);

  const addToRecentlyViewed = useCallback((product: Product) => {
    setItems(prev => {
      const filtered = prev.filter(p => p._id !== product._id);
      return [product, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ items, addToRecentlyViewed, clearRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);
