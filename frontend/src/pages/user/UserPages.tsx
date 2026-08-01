import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Heart, MapPin, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, orderAPI } from '../../services/api';
import { Order, Address } from '../../types';
import { formatPrice, formatDate } from '../../utils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Badge, EmptyState, Modal } from '../../components/ui/Common';
import notify from '../../utils/notifications';

function UserProfile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || '' });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile(form);
      await refreshUser();
      notify.success('Profile Updated', { description: 'Your profile has been saved successfully.' });
    } catch (e: any) { notify.error('Update Failed', { description: e.message }); }
    finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      await userAPI.deleteMyAccount();
      notify.success('Account Deleted', { description: 'Your account has been permanently deleted.' });
      logout();
      navigate('/');
    } catch (e: any) {
      notify.error('Delete Failed', { description: e.message });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirm('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Profile</h1>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="font-bold text-surface-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-surface-500">{user?.email}</p>
            {user?.isGuest && <Badge variant="warning" className="mt-1">Guest Account</Badge>}
          </div>
        </div>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03001234567" />
          <Button onClick={handleSave} isLoading={saving}>Save Changes</Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border-2 border-red-200 dark:border-red-900/50 p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
            <p className="text-sm text-surface-500">Permanent account deletion</p>
          </div>
        </div>
        <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
          Once you delete your account, there is no going back. All your data, orders, and preferences will be permanently removed.
        </p>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          <Trash2 size={16} /> Delete My Account
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteConfirm(''); }} title="Delete Account">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <AlertTriangle size={24} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-600 dark:text-red-400">This action is irreversible</p>
              <p className="text-sm text-red-500/80">Your account and all associated data will be permanently deleted.</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
              This will permanently delete:
            </p>
            <ul className="text-sm text-surface-500 space-y-1 ml-4 list-disc">
              <li>Your profile and account information</li>
              <li>Your order history</li>
              <li>Your saved addresses</li>
              <li>Your wishlist</li>
            </ul>
          </div>
          <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Type <span className="font-bold text-red-500">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              className="w-full h-10 px-3 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-surface-900 text-sm focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}>Cancel</Button>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== 'DELETE' || deleting}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Permanently Delete Account
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function UserOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const res: any = await orderAPI.getAll({ limit: '50' }); setOrders(res.data || []); } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const statusColors: Record<string, any> = {
    pending: 'warning', confirmed: 'info', packed: 'info', shipped: 'default', delivered: 'success', cancelled: 'danger', returned: 'danger',
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState icon={<Package size={48} />} title="No orders yet" description="Start shopping to see your orders here." action={<Link to="/shop"><Button>Shop Now</Button></Link>} />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-surface-500">Order #{order._id.slice(-8)}</p>
                  <p className="text-xs text-surface-400">{formatDate(order.createdAt)}</p>
                </div>
                <Badge variant={statusColors[order.status]}>{order.status}</Badge>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 flex-shrink-0">
                    <img src={item.image || 'https://placehold.co/40x40/1a1a2e/ffffff?text=P'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-medium text-surface-900 dark:text-white truncate max-w-[120px]">{item.name}</p>
                      <p className="text-xs text-surface-500">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                <span className="text-sm text-surface-500">{order.items.length} items</span>
                <span className="font-bold text-surface-900 dark:text-white">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserWishlist() {
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try { const res: any = await userAPI.getWishlist(); setWishlist(res.data || []); } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const toggleWishlist = async (productId: string) => {
    try {
      await userAPI.toggleWishlist(productId);
      setWishlist(wishlist.filter(p => p._id !== productId));
      notify.success('Removed from Wishlist', { description: 'Item has been removed from your wishlist.' });
    } catch (e: any) { notify.error('Remove Failed', { description: e.message }); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Wishlist</h1>
      {wishlist.length === 0 ? (
        <EmptyState icon={<Heart size={48} />} title="Wishlist is empty" description="Save products you love for later." action={<Link to="/shop"><Button>Browse Products</Button></Link>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map(product => (
            <div key={product._id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-4">
              <img src={product.images?.[0]?.url || ''} alt="" className="w-full aspect-square object-cover rounded-xl mb-3" />
              <Link to={`/product/${product.slug}`} className="font-medium text-surface-900 dark:text-white text-sm hover:text-primary-600 line-clamp-1">{product.name}</Link>
              <p className="text-sm font-bold text-surface-900 dark:text-white mt-1">{formatPrice(product.price)}</p>
              <Button variant="ghost" size="sm" className="mt-2 text-red-500" onClick={() => toggleWishlist(product._id)}>Remove</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserAddresses() {
  const { user, refreshUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ label: 'Home', name: '', phone: '', address: '', city: '', isDefault: false });

  const handleAdd = async () => {
    try {
      await userAPI.addAddress(form);
      await refreshUser();
      setShowModal(false);
      notify.success('Address Added', { description: 'Your new address has been saved.' });
    } catch (e: any) { notify.error('Failed to Add Address', { description: e.message }); }
  };

  const handleDelete = async (id: string) => {
    try { await userAPI.deleteAddress(id); await refreshUser(); notify.success('Address Deleted', { description: 'Address has been removed.' }); } catch (e: any) { notify.error('Failed to Delete Address', { description: e.message }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Addresses</h1>
        <Button onClick={() => setShowModal(true)}><MapPin size={16} /> Add Address</Button>
      </div>
      {(!user?.addresses || user.addresses.length === 0) ? (
        <EmptyState icon={<MapPin size={48} />} title="No addresses saved" description="Add an address for faster checkout." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {user.addresses.map((addr: Address) => (
            <div key={addr._id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-4">
              <div className="flex items-start justify-between mb-2">
                <Badge>{addr.label}</Badge>
                {addr.isDefault && <Badge variant="success">Default</Badge>}
              </div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">{addr.name}</p>
              <p className="text-sm text-surface-500">{addr.phone}</p>
              <p className="text-sm text-surface-500">{addr.address}, {addr.city}</p>
              <Button variant="ghost" size="sm" className="mt-3 text-red-500" onClick={() => addr._id && handleDelete(addr._id)}>Delete</Button>
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Address">
        <div className="space-y-4">
          <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home, Office" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded border-surface-300 text-primary-600" />
            <span className="text-sm text-surface-700 dark:text-surface-300">Set as default</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Save Address</Button>
        </div>
      </Modal>
    </div>
  );
}

export { UserProfile, UserOrders, UserWishlist, UserAddresses };
