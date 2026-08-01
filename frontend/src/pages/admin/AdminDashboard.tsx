import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { DashboardData } from '../../types';
import { formatPrice, formatDate } from '../../utils';
import { Badge } from '../../components/ui/Common';

const statusColors: Record<string, any> = {
  pending: 'warning', confirmed: 'info', packed: 'info', shipped: 'default', delivered: 'success', cancelled: 'danger', returned: 'danger',
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res: any = await analyticsAPI.getDashboard();
        setData(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}</div>;

  if (!data) return null;

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(data.totalRevenue), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Total Orders', value: data.totalOrders, icon: ShoppingBag, color: 'bg-primary-500' },
    { label: 'Total Products', value: data.totalProducts, icon: Package, color: 'bg-blue-500' },
    { label: 'Total Users', value: data.totalUsers, icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-surface-500">{card.label}</span>
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-white`}>
                <card.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-surface-900 dark:text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
          </div>
          <div className="space-y-3">
            {data.recentOrders.slice(0, 5).map(order => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-surface-50 dark:border-surface-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{order.shippingInfo?.name || 'Guest'}</p>
                  <p className="text-xs text-surface-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-surface-900 dark:text-white">{formatPrice(order.total)}</p>
                  <Badge variant={statusColors[order.status] || 'default'}>{order.status}</Badge>
                </div>
              </div>
            ))}
            {data.recentOrders.length === 0 && <p className="text-sm text-surface-500 text-center py-4">No orders yet</p>}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-surface-900 dark:text-white">Top Selling Products</h2>
            <Link to="/admin/products" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
          </div>
          <div className="space-y-3">
            {data.topProducts.slice(0, 5).map((product, i) => (
              <div key={product._id} className="flex items-center gap-3 py-2 border-b border-surface-50 dark:border-surface-800 last:border-0">
                <span className="text-xs text-surface-500 font-bold w-5">#{i + 1}</span>
                <img src={product.images[0]?.url || ''} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-xs text-surface-500">{product.soldCount} sold</p>
                </div>
                <span className="text-sm font-bold text-surface-900 dark:text-white">{formatPrice(product.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" />
            <h2 className="font-bold text-surface-900 dark:text-white">Low Stock Alert</h2>
          </div>
          <div className="space-y-3">
            {data.lowStock.map(product => (
              <div key={product._id} className="flex items-center justify-between py-2 border-b border-surface-50 dark:border-surface-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{product.name}</p>
                  {product.sku && <p className="text-xs text-surface-500">SKU: {product.sku}</p>}
                </div>
                <Badge variant={product.stock === 0 ? 'danger' : 'warning'}>{product.stock} left</Badge>
              </div>
            ))}
            {data.lowStock.length === 0 && <p className="text-sm text-surface-500 text-center py-4">All products are well stocked</p>}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <h2 className="font-bold text-surface-900 dark:text-white mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {data.ordersByStatus.map(status => (
              <div key={status._id} className="flex items-center justify-between">
                <Badge variant={statusColors[status._id] || 'default'}>{status._id}</Badge>
                <span className="text-sm font-bold text-surface-900 dark:text-white">{status.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Sales */}
      {data.monthlySales.length > 0 && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <h2 className="font-bold text-surface-900 dark:text-white mb-4">Monthly Sales</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800">
                  <th className="text-left py-2 text-surface-500 font-medium">Month</th>
                  <th className="text-right py-2 text-surface-500 font-medium">Orders</th>
                  <th className="text-right py-2 text-surface-500 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlySales.map((sale, i) => (
                  <tr key={i} className="border-b border-surface-50 dark:border-surface-800 last:border-0">
                    <td className="py-2 text-surface-900 dark:text-white font-medium">{new Date(sale._id.year, sale._id.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                    <td className="py-2 text-right text-surface-600 dark:text-surface-400">{sale.orders}</td>
                    <td className="py-2 text-right text-surface-900 dark:text-white font-bold">{formatPrice(sale.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
