import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, DollarSign, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { DashboardData } from '../../types';
import { formatPrice, formatDate } from '../../utils';
import { Badge } from '../../components/ui/Common';

const statusColors: Record<string, any> = {
  pending: 'warning', confirmed: 'info', packed: 'info', shipped: 'default', delivered: 'success', cancelled: 'danger', returned: 'danger',
};

const statusIcons: Record<string, any> = {
  pending: Clock, confirmed: CheckCircle, packed: Package, shipped: Truck, delivered: CheckCircle, cancelled: XCircle, returned: XCircle,
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 skeleton rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(data.totalRevenue),
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      bgLight: 'bg-green-50 dark:bg-green-900/20',
      change: '+12.5%',
      positive: true,
    },
    {
      label: 'Total Orders',
      value: data.totalOrders.toString(),
      icon: ShoppingBag,
      gradient: 'from-primary-500 to-primary-600',
      bgLight: 'bg-primary-50 dark:bg-primary-900/20',
      change: '+8.2%',
      positive: true,
    },
    {
      label: 'Total Products',
      value: data.totalProducts.toString(),
      icon: Package,
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      change: '+3.1%',
      positive: true,
    },
    {
      label: 'Total Users',
      value: data.totalUsers.toString(),
      icon: Users,
      gradient: 'from-purple-500 to-violet-600',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
      change: '+15.7%',
      positive: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-surface-500">
          <Clock size={16} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg`}>
                <card.icon size={22} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${card.positive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {card.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.change}
              </div>
            </div>
            <div>
              <p className="text-sm text-surface-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <ShoppingBag size={18} className="text-primary-600" />
              </div>
              <h2 className="font-bold text-surface-900 dark:text-white">Recent Orders</h2>
            </div>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentOrders.slice(0, 5).map(order => {
              const StatusIcon = statusIcons[order.status] || Clock;
              return (
                <div key={order._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                      <StatusIcon size={16} className="text-surface-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{order.shippingInfo?.name || 'Guest'}</p>
                      <p className="text-xs text-surface-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-surface-900 dark:text-white">{formatPrice(order.total)}</p>
                    <Badge variant={statusColors[order.status] || 'default'}>{order.status}</Badge>
                  </div>
                </div>
              );
            })}
            {data.recentOrders.length === 0 && (
              <div className="text-center py-8">
                <ShoppingBag size={40} className="mx-auto mb-3 text-surface-300 dark:text-surface-600" />
                <p className="text-sm text-surface-500">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-green-600" />
              </div>
              <h2 className="font-bold text-surface-900 dark:text-white">Top Selling Products</h2>
            </div>
            <Link to="/admin/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {data.topProducts.slice(0, 5).map((product, i) => (
              <div key={product._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  i === 1 ? 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300' :
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  #{i + 1}
                </div>
                <img src={product.images[0]?.url || ''} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-xs text-surface-500">{product.soldCount} sold</p>
                </div>
                <span className="text-sm font-bold text-surface-900 dark:text-white">{formatPrice(product.price)}</span>
              </div>
            ))}
            {data.topProducts.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp size={40} className="mx-auto mb-3 text-surface-300 dark:text-surface-600" />
                <p className="text-sm text-surface-500">No sales data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <AlertTriangle size={18} className="text-orange-600" />
              </div>
              <h2 className="font-bold text-surface-900 dark:text-white">Low Stock Alert</h2>
            </div>
            <Badge variant="warning">{data.lowStock.length} items</Badge>
          </div>
          <div className="space-y-3">
            {data.lowStock.slice(0, 5).map(product => (
              <div key={product._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                    <Package size={16} className="text-surface-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{product.name}</p>
                    {product.sku && <p className="text-xs text-surface-500">SKU: {product.sku}</p>}
                  </div>
                </div>
                <Badge variant={product.stock === 0 ? 'danger' : 'warning'}>
                  {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                </Badge>
              </div>
            ))}
            {data.lowStock.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
                <p className="text-sm text-surface-500">All products are well stocked</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Package size={18} className="text-blue-600" />
            </div>
            <h2 className="font-bold text-surface-900 dark:text-white">Orders by Status</h2>
          </div>
          <div className="space-y-3">
            {data.ordersByStatus.map(status => {
              const StatusIcon = statusIcons[status._id] || Clock;
              const percentage = data.totalOrders > 0 ? Math.round((status.count / data.totalOrders) * 100) : 0;
              return (
                <div key={status._id} className="p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon size={16} className="text-surface-500" />
                      <Badge variant={statusColors[status._id] || 'default'}>{status._id}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-surface-900 dark:text-white">{status.count}</span>
                      <span className="text-xs text-surface-500">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        status._id === 'delivered' ? 'bg-green-500' :
                        status._id === 'cancelled' ? 'bg-red-500' :
                        status._id === 'pending' ? 'bg-yellow-500' :
                        'bg-primary-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {data.ordersByStatus.length === 0 && (
              <div className="text-center py-8">
                <Package size={40} className="mx-auto mb-3 text-surface-300 dark:text-surface-600" />
                <p className="text-sm text-surface-500">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Sales */}
      {data.monthlySales.length > 0 && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-violet-600" />
            </div>
            <h2 className="font-bold text-surface-900 dark:text-white">Monthly Sales</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800">
                  <th className="text-left py-3 text-surface-500 font-medium">Month</th>
                  <th className="text-right py-3 text-surface-500 font-medium">Orders</th>
                  <th className="text-right py-3 text-surface-500 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlySales.map((sale, i) => (
                  <tr key={i} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-3 text-surface-900 dark:text-white font-medium">
                      {new Date(sale._id.year, sale._id.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="py-3 text-right text-surface-600 dark:text-surface-400">{sale.orders}</td>
                    <td className="py-3 text-right text-surface-900 dark:text-white font-bold">{formatPrice(sale.revenue)}</td>
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
