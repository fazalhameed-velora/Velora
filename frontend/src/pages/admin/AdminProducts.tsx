import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Star, TrendingUp, Sparkles, Award } from 'lucide-react';
import { productAPI, categoryAPI, brandAPI } from '../../services/api';
import { Product, Category, Brand } from '../../types';
import { formatPrice, formatDate } from '../../utils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Modal, Badge } from '../../components/ui/Common';
import notify from '../../utils/notifications';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<any>({ name: '', description: '', price: '', stock: '', sku: '', category: '', brand: '', discount: '0', tags: '' });
  const [flags, setFlags] = useState({ isFeatured: false, isTrending: false, isNewArrival: false, isBestSeller: false });
  const [images, setImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, cats, brs] = await Promise.all([productAPI.getAll({ limit: '100' }) as any, categoryAPI.getAll() as any, brandAPI.getAll() as any]);
        setProducts(prods.data || []);
        setCategories(cats.data || []);
        setBrands(brs.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const openModal = (product?: Product) => {
    if (product) {
      setEditProduct(product);
      setForm({ name: product.name, description: product.description, price: product.price, stock: product.stock, sku: product.sku || '', category: product.category?._id || '', brand: product.brand?._id || '', discount: product.discount, tags: product.tags?.join(', ') || '' });
      setFlags({ isFeatured: product.isFeatured, isTrending: product.isTrending, isNewArrival: product.isNewArrival, isBestSeller: product.isBestSeller });
    } else {
      setEditProduct(null);
      setForm({ name: '', description: '', price: '', stock: '', sku: '', category: '', brand: '', discount: '0', tags: '' });
      setFlags({ isFeatured: false, isTrending: false, isNewArrival: false, isBestSeller: false });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => { if (form[k]) fd.append(k, String(form[k])); });
      // Add feature flags
      fd.append('isFeatured', String(flags.isFeatured));
      fd.append('isTrending', String(flags.isTrending));
      fd.append('isNewArrival', String(flags.isNewArrival));
      fd.append('isBestSeller', String(flags.isBestSeller));
      images.forEach(f => fd.append('images', f));

      if (editProduct) {
        await productAPI.update(editProduct._id, fd);
        notify.success('Product Updated', { description: 'Product has been updated successfully.' });
      } else {
        await productAPI.create(fd);
        notify.success('Product Created', { description: 'New product has been added to your catalog.' });
      }
      setShowModal(false);
      const res: any = await productAPI.getAll({ limit: '100' });
      setProducts(res.data || []);
    } catch (e: any) { notify.error('Operation Failed', { description: e.message }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      setProducts(products.filter(p => p._id !== id));
      notify.success('Product Deleted', { description: 'Product has been removed from your catalog.' });
    } catch (e: any) { notify.error('Operation Failed', { description: e.message }); }
  };

  const toggleFlag = async (productId: string, flag: 'isFeatured' | 'isTrending' | 'isNewArrival' | 'isBestSeller') => {
    // Optimistic update
    setProducts(products.map(p => 
      p._id === productId ? { ...p, [flag]: !p[flag] } : p
    ));
    try {
      const product = products.find(p => p._id === productId);
      if (!product) return;
      const fd = new FormData();
      fd.append(flag, String(!product[flag]));
      await productAPI.update(productId, fd);
    } catch (e: any) {
      // Revert on error
      setProducts(products.map(p => 
        p._id === productId ? { ...p, [flag]: !p[flag] } : p
      ));
      notify.error('Failed', { description: 'Could not update flag.' });
    }
  };

  const handleAutoTrending = async () => {
    try {
      const res: any = await productAPI.autoTrending({ topN: '10', minSoldCount: '1' });
      const data = res.data;
      notify.success('Auto-Trending Updated', { description: `${data.flagged} products flagged as trending based on sales.` });
      // Reload products to reflect changes
      const prods: any = await productAPI.getAll({ limit: '100' });
      setProducts(prods.data || []);
    } catch (e: any) {
      notify.error('Failed', { description: e.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Products ({products.length})</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAutoTrending} className="hidden sm:flex">
            <TrendingUp size={16} /> Auto-Trending
          </Button>
          <Button onClick={() => openModal()}><Plus size={16} /> Add Product</Button>
        </div>
      </div>

      <Input placeholder="Search products..." icon={<Search size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
                <th className="text-left py-3 px-4 text-surface-500 font-medium">Product</th>
                <th className="text-left py-3 px-4 text-surface-500 font-medium hidden sm:table-cell">Category</th>
                <th className="text-left py-3 px-4 text-surface-500 font-medium hidden md:table-cell">Price</th>
                <th className="text-left py-3 px-4 text-surface-500 font-medium">Stock</th>
                <th className="text-left py-3 px-4 text-surface-500 font-medium hidden lg:table-cell">Status</th>
                <th className="text-right py-3 px-4 text-surface-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6} className="py-4 px-4"><div className="h-8 skeleton" /></td></tr>)
              ) : filtered.map(product => (
                <tr key={product._id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]?.url || ''} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-surface-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-surface-600 dark:text-surface-400 hidden sm:table-cell">{product.category?.name}</td>
                  <td className="py-3 px-4 font-medium text-surface-900 dark:text-white hidden md:table-cell">{formatPrice(product.price)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={product.stock === 0 ? 'danger' : product.stock <= 5 ? 'warning' : 'success'}>{product.stock}</Badge>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => toggleFlag(product._id, 'isFeatured')}
                        className={`p-1.5 rounded-lg transition-colors ${product.isFeatured ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 hover:text-blue-500'}`}
                        title={product.isFeatured ? 'Remove Featured' : 'Mark as Featured'}
                      ><Star size={14} fill={product.isFeatured ? 'currentColor' : 'none'} /></button>
                      <button 
                        onClick={() => toggleFlag(product._id, 'isTrending')}
                        className={`p-1.5 rounded-lg transition-colors ${product.isTrending ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 hover:text-orange-500'}`}
                        title={product.isTrending ? 'Remove Trending' : 'Mark as Trending'}
                      ><TrendingUp size={14} /></button>
                      <button 
                        onClick={() => toggleFlag(product._id, 'isNewArrival')}
                        className={`p-1.5 rounded-lg transition-colors ${product.isNewArrival ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 hover:text-green-500'}`}
                        title={product.isNewArrival ? 'Remove New Arrival' : 'Mark as New Arrival'}
                      ><Sparkles size={14} /></button>
                      <button 
                        onClick={() => toggleFlag(product._id, 'isBestSeller')}
                        className={`p-1.5 rounded-lg transition-colors ${product.isBestSeller ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 hover:text-purple-500'}`}
                        title={product.isBestSeller ? 'Remove Best Seller' : 'Mark as Best Seller'}
                      ><Award size={14} /></button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/product/${product.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"><Eye size={14} /></a>
                      <button onClick={() => openModal(product)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(product._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <div className="space-y-4 sm:space-y-5">
          {/* Product Name */}
          <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              rows={3} 
              placeholder="Describe your product..."
              className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-surface-400"
            />
          </div>

          {/* Pricing Section */}
          <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">Pricing & Stock</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Price (PKR)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
              <Input label="Discount (%)" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="0" />
              <Input label="Stock Quantity" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
              <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Optional" />
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Category</label>
              <select 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })} 
                className="w-full h-12 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Brand</label>
              <select 
                value={form.brand} 
                onChange={(e) => setForm({ ...form, brand: e.target.value })} 
                className="w-full h-12 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <Input 
            label="Tags" 
            value={form.tags} 
            onChange={(e) => setForm({ ...form, tags: e.target.value })} 
            placeholder="featured, trending, new-arrival" 
          />

          {/* Product Flags */}
          <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">🏷️ Display Flags</p>
            <p className="text-xs text-surface-500 mb-4">These flags determine where products appear on the homepage.</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 cursor-pointer hover:border-primary-300 transition-colors">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={flags.isFeatured}
                    onChange={(e) => setFlags({ ...flags, isFeatured: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${flags.isFeatured ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-600'}`} />
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${flags.isFeatured ? 'translate-x-4' : ''}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">Featured</p>
                  <p className="text-xs text-surface-500">Show on homepage</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 cursor-pointer hover:border-primary-300 transition-colors">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={flags.isTrending}
                    onChange={(e) => setFlags({ ...flags, isTrending: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${flags.isTrending ? 'bg-orange-600' : 'bg-surface-300 dark:bg-surface-600'}`} />
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${flags.isTrending ? 'translate-x-4' : ''}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">Trending</p>
                  <p className="text-xs text-surface-500">Show in trending section</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 cursor-pointer hover:border-primary-300 transition-colors">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={flags.isNewArrival}
                    onChange={(e) => setFlags({ ...flags, isNewArrival: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${flags.isNewArrival ? 'bg-green-600' : 'bg-surface-300 dark:bg-surface-600'}`} />
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${flags.isNewArrival ? 'translate-x-4' : ''}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">New Arrival</p>
                  <p className="text-xs text-surface-500">Mark as new product</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 cursor-pointer hover:border-primary-300 transition-colors">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={flags.isBestSeller}
                    onChange={(e) => setFlags({ ...flags, isBestSeller: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${flags.isBestSeller ? 'bg-purple-600' : 'bg-surface-300 dark:bg-surface-600'}`} />
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${flags.isBestSeller ? 'translate-x-4' : ''}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">Best Seller</p>
                  <p className="text-xs text-surface-500">Mark as top selling</p>
                </div>
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Product Images</label>
            <div className="relative">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => setImages(Array.from(e.target.files || []))} 
                id="file-upload"
                className="sr-only" 
              />
              <label 
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all"
              >
                <svg className="w-10 h-10 mb-2 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Tap to upload images</p>
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">PNG, JPG up to 10MB</p>
              </label>
            </div>
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((file, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium">
                    {file.name}
                    <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="ml-1 hover:text-primary-900">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
          <Button variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto justify-center">
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving} className="w-full sm:w-auto justify-center">
            {editProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
