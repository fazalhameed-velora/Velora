import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, UserX, UserCheck, Shield, ShieldOff, MoreVertical, Eye, ShoppingBag, TrendingUp } from 'lucide-react';
import { categoryAPI, brandAPI, couponAPI, bannerAPI, orderAPI, userAPI } from '../../services/api';
import { Category, Brand, Coupon, Banner } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Modal, Badge, Tabs } from '../../components/ui/Common';
import notify from '../../utils/notifications';

function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res: any = await categoryAPI.getAll();
      setCategories(res.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (item?: Category) => {
    setEditItem(item || null);
    setForm(item ? { name: item.name, description: item.description || '' } : { name: '', description: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await categoryAPI.update(editItem._id, form);
        notify.success('Category Updated', { description: 'Category has been updated successfully.' });
      } else {
        await categoryAPI.create(form);
        notify.success('Category Created', { description: 'New category has been added.' });
      }
      setShowModal(false);
      load();
    } catch (e: any) { notify.error('Operation Failed', { description: e.message }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try { await categoryAPI.delete(id); load(); notify.success('Deleted', { description: 'Item has been removed.' }); } catch (e: any) { notify.error('Operation Failed', { description: e.message }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Categories</h1>
          <p className="text-sm text-surface-500 mt-1">{categories.length} categories total</p>
        </div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Category</Button>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
                <th className="text-left py-3 px-4 text-surface-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-surface-500 font-medium hidden sm:table-cell">Slug</th>
                <th className="text-left py-3 px-4 text-surface-500 font-medium hidden md:table-cell">Products</th>
                <th className="text-right py-3 px-4 text-surface-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 font-bold text-sm">
                        {cat.name?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <span className="font-medium text-surface-900 dark:text-white">{cat.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-surface-500 hidden sm:table-cell">{cat.slug}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded-lg text-xs font-medium">{cat.productCount || 0}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openModal(cat)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(cat._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>{editItem ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
}

function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res: any = await brandAPI.getAll(); setBrands(res.data || []); } catch (e) { console.error(e); }
  };
  useEffect(() => { load(); }, []);

  const openModal = (item?: Brand) => {
    setEditItem(item || null);
    setForm(item ? { name: item.name, description: item.description || '' } : { name: '', description: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) { await brandAPI.update(editItem._id, form); notify.success('Brand Updated', { description: 'Brand has been updated.' }); }
      else { await brandAPI.create(form); notify.success('Brand Created', { description: 'New brand has been added.' }); }
      setShowModal(false); load();
    } catch (e: any) { notify.error('Operation Failed', { description: e.message }); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete?')) return;
    try { await brandAPI.delete(id); load(); notify.success('Deleted', { description: 'Item has been removed.' }); } catch (e: any) { notify.error('Operation Failed', { description: e.message }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Brands</h1>
          <p className="text-sm text-surface-500 mt-1">{brands.length} brands total</p>
        </div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Brand</Button>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
                <th className="text-left py-3 px-4 text-surface-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-surface-500 font-medium hidden sm:table-cell">Slug</th>
                <th className="text-right py-3 px-4 text-surface-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(brand => (
                <tr key={brand._id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {brand.name?.[0]?.toUpperCase() || 'B'}
                      </div>
                      <span className="font-medium text-surface-900 dark:text-white">{brand.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-surface-500 hidden sm:table-cell">{brand.slug}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openModal(brand)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(brand._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Brand' : 'Add Brand'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>{editItem ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: '100' };
      if (statusFilter) params.status = statusFilter;
      const res: any = await orderAPI.getAll(params);
      setOrders(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try { await orderAPI.updateStatus(id, { status }); notify.success('Status Updated', { description: 'Order status has been changed.' }); load(); } catch (e: any) { notify.error('Operation Failed', { description: e.message }); }
  };

  const statusOptions = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Orders</h1>
          <p className="text-sm text-surface-500 mt-1">{orders.length} orders{statusFilter ? ` with status "${statusFilter}"` : ''}</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm font-medium"
        >
          <option value="">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-surface-500 mt-3">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-surface-500">
            <ShoppingBag size={48} className="mx-auto mb-3 text-surface-300 dark:text-surface-600" />
            <p className="font-medium">No orders found</p>
            <p className="text-sm mt-1">Orders will appear here when customers place them</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
                  <th className="text-left py-3 px-4 text-surface-500 font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 text-surface-500 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-surface-500 font-medium hidden sm:table-cell">Items</th>
                  <th className="text-left py-3 px-4 text-surface-500 font-medium hidden md:table-cell">Total</th>
                  <th className="text-left py-3 px-4 text-surface-500 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-surface-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">#{order._id.slice(-8)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{order.shippingInfo?.name || 'Guest'}</p>
                        <p className="text-xs text-surface-500 sm:hidden">{order.items?.length} items</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className="px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded-lg text-xs font-medium">{order.items?.length} items</span>
                    </td>
                    <td className="py-3 px-4 font-bold hidden md:table-cell">Rs. {order.total?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>{order.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 font-medium"
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ code: '', description: '', discountType: 'percentage', discountValue: '', minPurchase: '', maxDiscount: '', usageLimit: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => { try { const res: any = await couponAPI.getAll(); setCoupons(res.data || []); } catch (e) { console.error(e); } };
  useEffect(() => { load(); }, []);

  const openModal = (item?: Coupon) => {
    setEditItem(item || null);
    setForm(item ? { code: item.code, description: item.description || '', discountType: item.discountType, discountValue: String(item.discountValue), minPurchase: String(item.minPurchase), maxDiscount: item.maxDiscount ? String(item.maxDiscount) : '', usageLimit: item.usageLimit ? String(item.usageLimit) : '' } : { code: '', description: '', discountType: 'percentage', discountValue: '', minPurchase: '', maxDiscount: '', usageLimit: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form, discountValue: Number(form.discountValue), minPurchase: Number(form.minPurchase), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined, usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined };
      if (editItem) { await couponAPI.update(editItem._id, data); notify.success('Coupon Updated', { description: 'Coupon has been updated.' }); }
      else { await couponAPI.create(data); notify.success('Coupon Created', { description: 'New coupon has been created.' }); }
      setShowModal(false); load();
    } catch (e: any) { notify.error('Operation Failed', { description: e.message }); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete?')) return;
    try { await couponAPI.delete(id); load(); notify.success('Deleted', { description: 'Item has been removed.' }); } catch (e: any) { notify.error('Operation Failed', { description: e.message }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Coupons</h1>
          <p className="text-sm text-surface-500 mt-1">{coupons.length} coupons total</p>
        </div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Coupon</Button>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
                <th className="text-left py-3 px-4 text-surface-500 font-medium">Code</th>
                <th className="text-left py-3 px-4 text-surface-500 font-medium hidden sm:table-cell">Type</th>
                <th className="text-left py-3 px-4 text-surface-500 font-medium">Value</th>
                <th className="text-left py-3 px-4 text-surface-500 font-medium hidden md:table-cell">Usage</th>
                <th className="text-right py-3 px-4 text-surface-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon._id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-surface-900 dark:text-white bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg text-xs">{coupon.code}</span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell"><Badge variant="info">{coupon.discountType}</Badge></td>
                  <td className="py-3 px-4 font-medium">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `Rs. ${coupon.discountValue}`}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="text-sm font-medium">{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openModal(coupon)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(coupon._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Coupon' : 'Add Coupon'}>
        <div className="space-y-4">
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Type</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <Input label="Discount Value" type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Min Purchase" type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} />
            <Input label="Max Discount" type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
            <Input label="Usage Limit" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>{editItem ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
}

function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', position: 'hero' });
  const [saving, setSaving] = useState(false);

  const load = async () => { try { const res: any = await bannerAPI.getAll({ all: 'true' }); setBanners(res.data || []); } catch (e) { console.error(e); } };
  useEffect(() => { load(); }, []);

  const openModal = (item?: Banner) => {
    setEditItem(item || null);
    setForm(item ? { title: item.title, subtitle: item.subtitle || '', position: item.position } : { title: '', subtitle: '', position: 'hero' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) { await bannerAPI.update(editItem._id, form); notify.success('Banner Updated', { description: 'Banner has been updated.' }); }
      else { await bannerAPI.create(form); notify.success('Banner Created', { description: 'New banner has been added.' }); }
      setShowModal(false); load();
    } catch (e: any) { notify.error('Operation Failed', { description: e.message }); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete?')) return;
    try { await bannerAPI.delete(id); load(); notify.success('Deleted', { description: 'Item has been removed.' }); } catch (e: any) { notify.error('Operation Failed', { description: e.message }); }
  };

  const positionColors: Record<string, string> = {
    hero: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    promo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    sidebar: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Banners</h1>
          <p className="text-sm text-surface-500 mt-1">{banners.length} banners total</p>
        </div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Banner</Button>
      </div>
      <div className="space-y-3">
        {banners.map(banner => (
          <div key={banner._id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${positionColors[banner.position] || 'bg-surface-100 text-surface-600'} flex items-center justify-center font-bold text-sm`}>
                  {banner.title?.[0]?.toUpperCase() || 'B'}
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">{banner.title}</p>
                  <p className="text-sm text-surface-500">{banner.subtitle || 'No subtitle'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{banner.position}</Badge>
                <div className="flex gap-1">
                  <button onClick={() => openModal(banner)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(banner._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Banner' : 'Add Banner'}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Position</label>
            <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm">
              <option value="hero">Hero</option>
              <option value="promo">Promo</option>
              <option value="sidebar">Sidebar</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={saving}>{editItem ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'user' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { limit: '200' };
      const res: any = await userAPI.getAll(params);
      setUsers(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u => {
    const matchesSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, role: user.role });
    setShowEditModal(true);
  };

  const openDelete = (user: any) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleUpdateUser = async () => {
    setSaving(true);
    try {
      await userAPI.update(selectedUser._id, editForm);
      notify.success('User Updated', { description: `${selectedUser.name}'s profile has been updated.` });
      setShowEditModal(false);
      load();
    } catch (e: any) { notify.error('Update Failed', { description: e.message }); }
    finally { setSaving(false); }
  };

  const handleDeleteUser = async () => {
    setSaving(true);
    try {
      await userAPI.delete(selectedUser._id);
      notify.success('User Deleted', { description: `${selectedUser.name} has been removed.` });
      setShowDeleteModal(false);
      load();
    } catch (e: any) { notify.error('Delete Failed', { description: e.message }); }
    finally { setSaving(false); }
  };

  const handleToggleRole = async (user: any) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await userAPI.update(user._id, { role: newRole });
      notify.success('Role Changed', { description: `${user.name} is now ${newRole}.` });
      load();
    } catch (e: any) { notify.error('Operation Failed', { description: e.message }); }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    regular: users.filter(u => u.role === 'user').length,
    guests: users.filter(u => u.isGuest).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Users</h1>
          <p className="text-sm text-surface-500 mt-1">{filtered.length} users found</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400', border: 'border-primary-200 dark:border-primary-800' },
          { label: 'Admins', value: stats.admins, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
          { label: 'Regular Users', value: stats.regular, color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
          { label: 'Guests', value: stats.guests, color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} border ${stat.border} rounded-xl p-4`}>
            <p className="text-sm font-medium opacity-70">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm font-medium"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-surface-500 mt-3">Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-surface-500">
            <UserX size={48} className="mx-auto mb-3 text-surface-300 dark:text-surface-600" />
            <p className="font-medium">No users found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
                  <th className="text-left py-3 px-4 text-surface-500 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-surface-500 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-4 text-surface-500 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-surface-500 font-medium hidden md:table-cell">Type</th>
                  <th className="text-left py-3 px-4 text-surface-500 font-medium hidden lg:table-cell">Joined</th>
                  <th className="text-right py-3 px-4 text-surface-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user._id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-surface-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-surface-500 sm:hidden truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-surface-500 hidden sm:table-cell">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                        {user.role === 'admin' && <Shield size={12} className="mr-1" />}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {user.isGuest ? (
                        <Badge variant="warning">Guest</Badge>
                      ) : (
                        <Badge variant="success">Registered</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-surface-500 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleRole(user)}
                          className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"
                          title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                        >
                          {user.role === 'admin' ? <ShieldOff size={14} /> : <Shield size={14} />}
                        </button>
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"
                          title="Edit user"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => openDelete(user)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-lg">
                {selectedUser.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-white">{selectedUser.name}</p>
                <p className="text-sm text-surface-500">{selectedUser.email}</p>
              </div>
            </div>
            <Input label="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} isLoading={saving}>Update User</Button>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete User">
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                Are you sure you want to delete <strong>{selectedUser.name}</strong>? This will permanently remove their account and all associated data.
              </p>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteUser} isLoading={saving}>
            <Trash2 size={16} /> Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-surface-500 mt-1">Detailed analytics and insights coming soon.</p>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
          <TrendingUp size={32} className="text-primary-500" />
        </div>
        <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">Analytics Dashboard</h3>
        <p className="text-surface-500 max-w-md mx-auto">
          Comprehensive analytics including sales trends, customer insights, conversion rates, and more will be available here soon.
        </p>
      </div>
    </div>
  );
}

export { AdminCategories, AdminBrands, AdminOrders, AdminCoupons, AdminBanners, AdminUsers, AdminAnalytics };
