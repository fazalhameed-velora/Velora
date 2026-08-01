import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { categoryAPI, brandAPI, couponAPI, bannerAPI, orderAPI, userAPI } from '../../services/api';
import { Category, Brand, Coupon, Banner } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Modal, Badge } from '../../components/ui/Common';
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
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Categories ({categories.length})</h1>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Category</Button>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium hidden sm:table-cell">Slug</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium hidden md:table-cell">Products</th>
              <th className="text-right py-3 px-4 text-surface-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="py-3 px-4 font-medium text-surface-900 dark:text-white">{cat.name}</td>
                  <td className="py-3 px-4 text-surface-500 hidden sm:table-cell">{cat.slug}</td>
                  <td className="py-3 px-4 hidden md:table-cell">{cat.productCount || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openModal(cat)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(cat._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={14} /></button>
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
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Brands ({brands.length})</h1>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Brand</Button>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium hidden sm:table-cell">Slug</th>
              <th className="text-right py-3 px-4 text-surface-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {brands.map(brand => (
                <tr key={brand._id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="py-3 px-4 font-medium text-surface-900 dark:text-white">{brand.name}</td>
                  <td className="py-3 px-4 text-surface-500 hidden sm:table-cell">{brand.slug}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openModal(brand)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(brand._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={14} /></button>
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

  const load = useCallback(async () => {
    try {
      const params: any = { limit: '100' };
      if (statusFilter) params.status = statusFilter;
      const res: any = await orderAPI.getAll(params);
      setOrders(res.data || []);
    } catch (e) { console.error(e); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try { await orderAPI.updateStatus(id, { status }); notify.success('Status Updated', { description: 'Order status has been changed.' }); load(); } catch (e: any) { notify.error('Operation Failed', { description: e.message }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm">
          <option value="">All Status</option>
          {['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Order ID</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Customer</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium hidden sm:table-cell">Items</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium hidden md:table-cell">Total</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Status</th>
              <th className="text-right py-3 px-4 text-surface-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="py-3 px-4 font-mono text-xs text-surface-500">{order._id.slice(-8)}</td>
                  <td className="py-3 px-4 text-surface-900 dark:text-white">{order.shippingInfo?.name}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">{order.items?.length} items</td>
                  <td className="py-3 px-4 font-bold hidden md:table-cell">Rs. {order.total?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>{order.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} className="text-xs px-2 py-1 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
                      {['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Coupons ({coupons.length})</h1>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Coupon</Button>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Code</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium hidden sm:table-cell">Type</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Value</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium hidden md:table-cell">Usage</th>
              <th className="text-right py-3 px-4 text-surface-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon._id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="py-3 px-4 font-mono font-bold text-surface-900 dark:text-white">{coupon.code}</td>
                  <td className="py-3 px-4 hidden sm:table-cell"><Badge variant="info">{coupon.discountType}</Badge></td>
                  <td className="py-3 px-4 font-medium">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `Rs. ${coupon.discountValue}`}</td>
                  <td className="py-3 px-4 hidden md:table-cell">{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openModal(coupon)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(coupon._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={14} /></button>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Banners ({banners.length})</h1>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Banner</Button>
      </div>
      <div className="space-y-3">
        {banners.map(banner => (
          <div key={banner._id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-surface-900 dark:text-white">{banner.title}</p>
              <p className="text-sm text-surface-500">{banner.subtitle} • <Badge>{banner.position}</Badge></p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openModal(banner)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500"><Edit size={14} /></button>
              <button onClick={() => handleDelete(banner._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={14} /></button>
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

  useEffect(() => {
    const load = async () => {
      try { const res: any = await userAPI.getAll({ limit: '100' }); setUsers(res.data || []); } catch (e) { console.error(e); }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Users ({users.length})</h1>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium hidden sm:table-cell">Email</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Role</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium hidden md:table-cell">Type</th>
            </tr></thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b border-surface-50 dark:border-surface-800 last:border-0">
                  <td className="py-3 px-4 font-medium text-surface-900 dark:text-white">{user.name}</td>
                  <td className="py-3 px-4 text-surface-500 hidden sm:table-cell">{user.email}</td>
                  <td className="py-3 px-4"><Badge variant={user.role === 'admin' ? 'info' : 'default'}>{user.role}</Badge></td>
                  <td className="py-3 px-4 hidden md:table-cell">{user.isGuest ? <Badge variant="warning">Guest</Badge> : <Badge variant="success">Registered</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
      <p className="text-surface-500">Detailed analytics coming soon. Check the Dashboard for current stats.</p>
    </div>
  );
}

export { AdminCategories, AdminBrands, AdminOrders, AdminCoupons, AdminBanners, AdminUsers, AdminAnalytics };
