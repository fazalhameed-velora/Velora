import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, UserX, UserCheck, Shield, ShieldOff, MoreVertical, Eye, ShoppingBag, TrendingUp, Calendar } from 'lucide-react';
import { categoryAPI, brandAPI, couponAPI, bannerAPI, orderAPI, userAPI, productAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
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
        <div className="space-y-4 sm:space-y-5">
          <Input 
            label="Category Name" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            placeholder="Enter category name"
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              rows={3}
              placeholder="Describe this category..."
              className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-surface-400"
            />
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
          <Button variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto justify-center">Cancel</Button>
          <Button onClick={handleSave} isLoading={saving} className="w-full sm:w-auto justify-center">{editItem ? 'Update Category' : 'Create Category'}</Button>
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
        <div className="space-y-4 sm:space-y-5">
          <Input 
            label="Brand Name" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter brand name"
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              rows={3}
              placeholder="Describe this brand..."
              className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-surface-400"
            />
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
          <Button variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto justify-center">Cancel</Button>
          <Button onClick={handleSave} isLoading={saving} className="w-full sm:w-auto justify-center">{editItem ? 'Update Brand' : 'Create Brand'}</Button>
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

  const deleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this order? This cannot be undone.')) return;
    try { await orderAPI.delete(id); notify.success('Order Deleted', { description: 'Order has been permanently removed.' }); load(); } catch (e: any) { notify.error('Delete Failed', { description: e.message }); }
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
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 font-medium"
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          title="Delete order"
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
        <div className="space-y-4 sm:space-y-5">
          <Input 
            label="Coupon Code" 
            value={form.code} 
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} 
            placeholder="e.g., SUMMER20"
          />
          <Input 
            label="Description" 
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
            placeholder="Optional description"
          />
          
          {/* Discount Section */}
          <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">Discount Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Type</label>
                <select 
                  value={form.discountType} 
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })} 
                  className="w-full h-12 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <Input 
                label="Discount Value" 
                type="number" 
                value={form.discountValue} 
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })} 
                placeholder="0"
              />
            </div>
          </div>

          {/* Limits Section */}
          <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">Limits & Restrictions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input 
                label="Min Purchase" 
                type="number" 
                value={form.minPurchase} 
                onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} 
                placeholder="0"
              />
              <Input 
                label="Max Discount" 
                type="number" 
                value={form.maxDiscount} 
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} 
                placeholder="Optional"
              />
              <Input 
                label="Usage Limit" 
                type="number" 
                value={form.usageLimit} 
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} 
                placeholder="Unlimited"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
          <Button variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto justify-center">Cancel</Button>
          <Button onClick={handleSave} isLoading={saving} className="w-full sm:w-auto justify-center">{editItem ? 'Update Coupon' : 'Create Coupon'}</Button>
        </div>
      </Modal>
    </div>
  );
}

function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', position: 'hero', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const load = async () => { try { const res: any = await bannerAPI.getAll({ all: 'true' }); setBanners(res.data || []); } catch (e) { console.error(e); } };
  useEffect(() => { load(); }, []);

  const openModal = (item?: Banner) => {
    setEditItem(item || null);
    setForm(item ? { 
      title: item.title, 
      subtitle: item.subtitle || '', 
      position: item.position,
      startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : ''
    } : { title: '', subtitle: '', position: 'hero', startDate: '', endDate: '' });
    setImageFile(null);
    setImagePreview(item?.image?.url || null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const getSchedulingStatus = (banner: Banner) => {
    if (!banner.startDate && !banner.endDate) return { label: 'Always Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    const now = new Date();
    const start = banner.startDate ? new Date(banner.startDate) : null;
    const end = banner.endDate ? new Date(banner.endDate) : null;
    if (start && now < start) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    if (end && now > end) return { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    if (start && end) return { label: 'Active Period', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    return { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (form.title) fd.append('title', form.title);
      if (form.subtitle) fd.append('subtitle', form.subtitle);
      if (form.position) fd.append('position', form.position);
      if (form.startDate) fd.append('startDate', form.startDate);
      if (form.endDate) fd.append('endDate', form.endDate);
      if (imageFile) fd.append('images', imageFile);
      if (editItem) { await bannerAPI.update(editItem._id, fd); notify.success('Banner Updated', { description: 'Banner has been updated.' }); }
      else { await bannerAPI.create(fd); notify.success('Banner Created', { description: 'New banner has been added.' }); }
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
                {banner.image?.url ? (
                  <img src={banner.image.url} alt={banner.title} className="w-16 h-12 object-cover rounded-lg border border-surface-200 dark:border-surface-700" />
                ) : (
                  <div className={`w-16 h-12 rounded-lg ${positionColors[banner.position] || 'bg-surface-100 text-surface-600'} flex items-center justify-center font-bold text-sm`}>
                    {banner.title?.[0]?.toUpperCase() || 'B'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">{banner.title}</p>
                  <p className="text-sm text-surface-500">{banner.subtitle || 'No subtitle'}</p>
                  {(banner.startDate || banner.endDate) && (
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar size={12} className="text-surface-400" />
                      <span className="text-xs text-surface-400">
                        {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'Now'}
                        {' → '}
                        {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'No end'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{banner.position}</Badge>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSchedulingStatus(banner).color}`}>{getSchedulingStatus(banner).label}</span>
                {banner.startDate && <span className="text-xs text-surface-400 hidden sm:inline">{new Date(banner.startDate).toLocaleDateString()}</span>}
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
        <div className="space-y-4 sm:space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Banner Image</label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Banner preview" className="w-full h-40 object-cover rounded-xl border border-surface-200 dark:border-surface-700" />
                <button 
                  type="button" 
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <label 
                htmlFor="banner-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-surface-50 dark:bg-surface-800/50"
              >
                <input 
                  type="file" 
                  id="banner-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <svg className="w-10 h-10 text-surface-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-surface-500">Tap to upload banner image</p>
                <p className="text-xs text-surface-400 mt-1">Recommended: 1200x400px</p>
              </label>
            )}
          </div>
          <Input 
            label="Banner Title" 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })} 
            placeholder="Enter banner title"
          />
          <Input 
            label="Subtitle" 
            value={form.subtitle} 
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })} 
            placeholder="Optional subtitle"
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Position</label>
            <select 
              value={form.position} 
              onChange={(e) => setForm({ ...form, position: e.target.value })} 
              className="w-full h-12 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="hero">Hero (Homepage top)</option>
              <option value="promo">Promo (Content section)</option>
              <option value="sidebar">Sidebar</option>
            </select>
          </div>
          {/* Scheduling Section */}
          <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">📅 Schedule (Optional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Start Date" 
                type="date"
                value={form.startDate} 
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} 
                placeholder="When to start showing"
              />
              <Input 
                label="End Date" 
                type="date"
                value={form.endDate} 
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} 
                placeholder="When to stop showing"
              />
            </div>
            <p className="text-xs text-surface-500 mt-2">Leave empty to show banner always. Set dates to schedule when the banner should be active.</p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
          <Button variant="outline" onClick={() => setShowModal(false)} className="w-full sm:w-auto justify-center">Cancel</Button>
          <Button onClick={handleSave} isLoading={saving} className="w-full sm:w-auto justify-center">{editItem ? 'Update Banner' : 'Create Banner'}</Button>
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
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-lg">
                {selectedUser.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-white">{selectedUser.name}</p>
                <p className="text-sm text-surface-500">{selectedUser.email}</p>
              </div>
            </div>
            <Input 
              label="Name" 
              value={editForm.name} 
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
              placeholder="Enter user name"
            />
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        )}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
          <Button variant="outline" onClick={() => setShowEditModal(false)} className="w-full sm:w-auto justify-center">Cancel</Button>
          <Button onClick={handleUpdateUser} isLoading={saving} className="w-full sm:w-auto justify-center">Update User</Button>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete User">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">Warning: This action cannot be undone</p>
                <p className="text-sm text-red-500/80">{selectedUser.name}'s account and all data will be permanently deleted.</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="w-full sm:w-auto justify-center">Cancel</Button>
          <Button variant="danger" onClick={handleDeleteUser} isLoading={saving} className="w-full sm:w-auto justify-center">
            <Trash2 size={16} /> Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, productsRes, usersRes]: any[] = await Promise.all([
          orderAPI.getAll({ limit: '500' }),
          productAPI.getAll({ limit: '500' }),
          userAPI.getAll({ limit: '500' }),
        ]);
        
        const orders = ordersRes.data || [];
        const products = productsRes.data || [];
        const users = usersRes.data || [];
        
        // Calculate analytics
        const totalRevenue = orders
          .filter((o: any) => o.status !== 'cancelled')
          .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.filter((o: any) => o.status !== 'cancelled').length : 0;
        
        const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;
        const conversionRate = orders.length > 0 ? (deliveredOrders / orders.length) * 100 : 0;
        
        // Top selling products
        const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
        orders.forEach((order: any) => {
          order.items?.forEach((item: any) => {
            const id = item.product || item.name;
            if (!productSales[id]) productSales[id] = { name: item.name, count: 0, revenue: 0 };
            productSales[id].count += item.quantity;
            productSales[id].revenue += item.price * item.quantity;
          });
        });
        const topProducts = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        
        // Orders by status
        const statusCounts: Record<string, number> = {};
        orders.forEach((o: any) => {
          statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        });
        
        // Recent activity (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentOrders = orders.filter((o: any) => new Date(o.createdAt) > weekAgo);
        const recentRevenue = recentOrders
          .filter((o: any) => o.status !== 'cancelled')
          .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        
        // Monthly sales data for chart
        const monthlyData: Record<string, { revenue: number; orders: number }> = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        orders.filter((o: any) => o.status !== 'cancelled').forEach((o: any) => {
          const date = new Date(o.createdAt);
          const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          if (!monthlyData[key]) monthlyData[key] = { revenue: 0, orders: 0 };
          monthlyData[key].revenue += o.total || 0;
          monthlyData[key].orders += 1;
        });
        const monthlySales = Object.entries(monthlyData)
          .map(([month, data]) => ({ month, ...data }))
          .slice(-6); // Last 6 months
        
        setData({
          totalRevenue,
          avgOrderValue,
          conversionRate,
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: users.length,
          topProducts,
          statusCounts,
          recentOrders: recentOrders.length,
          recentRevenue,
          monthlySales,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 skeleton rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-surface-500 mt-1">Comprehensive insights into your store performance</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="h-10 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm font-medium"
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `Rs. ${data.totalRevenue.toLocaleString()}`, icon: TrendingUp, gradient: 'from-green-500 to-emerald-600' },
          { label: 'Avg Order Value', value: `Rs. ${Math.round(data.avgOrderValue).toLocaleString()}`, icon: ShoppingBag, gradient: 'from-primary-500 to-primary-600' },
          { label: 'Conversion Rate', value: `${data.conversionRate.toFixed(1)}%`, icon: TrendingUp, gradient: 'from-blue-500 to-indigo-600' },
          { label: 'Recent Orders (7d)', value: data.recentOrders.toString(), icon: ShoppingBag, gradient: 'from-purple-500 to-violet-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-5">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg mb-4`}>
              <stat.icon size={22} />
            </div>
            <p className="text-sm text-surface-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <h2 className="font-bold text-surface-900 dark:text-white mb-4">Top Selling Products</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((product: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      i === 1 ? 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      #{i + 1}
                    </div>
                    <span className="text-sm font-medium text-surface-900 dark:text-white truncate max-w-[150px]">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-surface-900 dark:text-white">Rs. {product.revenue.toLocaleString()}</p>
                    <p className="text-xs text-surface-500">{product.count} sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <h2 className="font-bold text-surface-900 dark:text-white mb-4">Orders by Status</h2>
          {Object.keys(data.statusCounts).length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.statusCounts).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      status === 'delivered' ? 'success' :
                      status === 'cancelled' ? 'danger' :
                      status === 'pending' ? 'warning' : 'info'
                    }>
                      {status}
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-surface-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <h2 className="font-bold text-surface-900 dark:text-white mb-4">Revenue by Month</h2>
          <div className="h-64">
            {data.monthlySales.length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-8">No sales data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#f3f4f6' }}
                    formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="url(#gradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5c7cfa" stopOpacity={1} />
                      <stop offset="100%" stopColor="#364fc7" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Orders by Status Pie Chart */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <h2 className="font-bold text-surface-900 dark:text-white mb-4">Orders by Status</h2>
          <div className="h-64">
            {Object.keys(data.statusCounts).length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-8">No orders yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(data.statusCounts).map(([status, count]) => ({
                      name: status,
                      value: count
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {Object.keys(data.statusCounts).map((status, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          status === 'delivered' ? '#22c55e' :
                          status === 'pending' ? '#eab308' :
                          status === 'cancelled' ? '#ef4444' :
                          status === 'shipped' ? '#3b82f6' :
                          status === 'confirmed' ? '#8b5cf6' :
                          status === 'packed' ? '#06b6d4' :
                          '#6b7280'
                        } 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-surface-600 dark:text-surface-400 capitalize">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              )}
          </div>
        </div>
      </div>

      {/* Top Products Bar Chart */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
        <h2 className="font-bold text-surface-900 dark:text-white mb-4">Top Products by Units Sold</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }}
                itemStyle={{ color: '#f3f4f6' }}
                formatter={(value: any) => [`${value} units`, 'Sold']}
              />
              <Bar dataKey="count" fill="#22c55e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
        <h2 className="font-bold text-surface-900 dark:text-white mb-4">Store Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: data.totalOrders },
            { label: 'Total Products', value: data.totalProducts },
            { label: 'Total Users', value: data.totalUsers },
            { label: 'Recent Revenue (7d)', value: `Rs. ${data.recentRevenue.toLocaleString()}` },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { AdminCategories, AdminBrands, AdminOrders, AdminCoupons, AdminBanners, AdminUsers, AdminAnalytics };

export default { AdminCategories, AdminBrands, AdminOrders, AdminCoupons, AdminBanners, AdminUsers, AdminAnalytics };
