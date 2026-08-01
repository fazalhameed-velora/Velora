import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { productAPI, categoryAPI, brandAPI } from '../../services/api';
import { Product, Category, Brand, Pagination } from '../../types';
import ProductCard from '../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { cn, formatPrice } from '../../utils';
import Button from '../../components/ui/Button';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.getAll('category') || []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(searchParams.getAll('brand') || []);
  const [selectedRating, setSelectedRating] = useState(Number(searchParams.get('rating')) || 0);
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [cats, brandsRes] = await Promise.all([categoryAPI.getAll() as any, brandAPI.getAll() as any]);
        setCategories(cats.data || []);
        setBrands(brandsRes.data || []);
      } catch (e) { console.error(e); }
    };
    loadFilters();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: searchParams.get('page') || '1', limit: '12' };
      if (selectedCategories.length) params.category = selectedCategories[0];
      if (selectedBrands.length) params.brand = selectedBrands.join(',');
      if (priceRange[0] > 0) params.minPrice = String(priceRange[0]);
      if (priceRange[1] < 500000) params.maxPrice = String(priceRange[1]);
      if (selectedRating) params.rating = String(selectedRating);
      if (inStockOnly) params.inStock = 'true';
      params.sort = sortBy;
      Array.from(searchParams.entries()).forEach(([key, val]) => {
        if (['isFeatured', 'isTrending', 'isNewArrival', 'isBestSeller', 'search', 'tags'].includes(key)) {
          params[key] = val;
        }
      });

      const res: any = await productAPI.getAll(params);
      setProducts(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [searchParams, selectedCategories, selectedBrands, priceRange, selectedRating, inStockOnly, sortBy]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    if (selectedCategories.length) params.set('category', selectedCategories[0]); else params.delete('category');
    if (selectedBrands.length) params.set('brand', selectedBrands.join(',')); else params.delete('brand');
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0])); else params.delete('minPrice');
    if (priceRange[1] < 500000) params.set('maxPrice', String(priceRange[1])); else params.delete('maxPrice');
    if (selectedRating) params.set('rating', String(selectedRating)); else params.delete('rating');
    if (inStockOnly) params.set('inStock', 'true'); else params.delete('inStock');
    params.set('sort', sortBy);
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 500000]);
    setSelectedRating(0);
    setInStockOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  const pageTitle = searchParams.get('isFeatured') ? 'Featured Products'
    : searchParams.get('isTrending') ? 'Trending Products'
    : searchParams.get('isNewArrival') ? 'New Arrivals'
    : searchParams.get('isBestSeller') ? 'Best Sellers'
    : 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">{pageTitle}</h1>
          <p className="text-surface-500 text-sm mt-1">{pagination.total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); }} className="h-10 px-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:ring-2 focus:ring-primary-500">
            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={cn('w-64 flex-shrink-0 space-y-6', showFilters ? 'block' : 'hidden lg:block')}>
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-surface-900 dark:text-white text-sm">Categories</h3>
              {selectedCategories.length > 0 && <button onClick={() => setSelectedCategories([])} className="text-xs text-primary-600">Clear</button>}
            </div>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat._id)}
                    onChange={(e) => setSelectedCategories(e.target.checked ? [cat._id] : [])}
                    className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-white transition-colors">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-4">
            <h3 className="font-semibold text-surface-900 dark:text-white text-sm mb-4">Price Range</h3>
            <div className="space-y-3">
              <input type="range" min="0" max="500000" step="1000" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full accent-primary-600" />
              <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <span>{formatPrice(priceRange[0])}</span>
                <span>-</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-surface-900 dark:text-white text-sm">Brands</h3>
              {selectedBrands.length > 0 && <button onClick={() => setSelectedBrands([])} className="text-xs text-primary-600">Clear</button>}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map(brand => (
                <label key={brand._id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand._id)}
                    onChange={(e) => setSelectedBrands(e.target.checked ? [...selectedBrands, brand._id] : selectedBrands.filter(b => b !== brand._id))}
                    className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-white transition-colors">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-4">
            <h3 className="font-semibold text-surface-900 dark:text-white text-sm mb-4">Rating</h3>
            <div className="flex gap-2">
              {[4, 3, 2, 1].map(r => (
                <button key={r} onClick={() => setSelectedRating(selectedRating === r ? 0 : r)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all', selectedRating === r ? 'bg-primary-600 text-white border-primary-600' : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-primary-300')}>
                  {r}★+
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">In Stock Only</span>
            </label>
          </div>

          <div className="flex gap-2">
            <Button onClick={applyFilters} className="flex-1">Apply</Button>
            <Button variant="outline" onClick={clearFilters}>Clear</Button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-surface-500 text-lg mb-4">No products found</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {products.map(product => <ProductCard key={product._id} product={product} />)}
              </div>
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button key={i} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(i + 1)); setSearchParams(p); }} className={cn('w-10 h-10 rounded-xl text-sm font-medium transition-all', pagination.page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-primary-300')}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
