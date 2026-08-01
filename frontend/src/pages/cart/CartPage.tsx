import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatPrice, getDiscountedPrice } from '../../utils';
import Button from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Common';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, totalDiscount, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <EmptyState
          icon={<ShoppingBag size={64} />}
          title="Your cart is empty"
          description="Looks like you haven't added any products yet."
          action={<Link to="/shop"><Button>Start Shopping</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-8">Shopping Cart ({itemCount} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const price = getDiscountedPrice(item.product.price, item.product.discount);
            return (
              <div key={item.product._id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-4 sm:p-6 flex gap-4">
                <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                  <img src={item.product.images[0]?.url || 'https://placehold.co/120x120/1a1a2e/ffffff?text=Product'} alt={item.product.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/product/${item.product.slug}`} className="font-semibold text-surface-900 dark:text-white text-sm hover:text-primary-600 transition-colors line-clamp-1">{item.product.name}</Link>
                      {item.selectedColor && <p className="text-xs text-surface-500 mt-0.5">Color: {item.selectedColor}</p>}
                      {item.selectedStorage && <p className="text-xs text-surface-500">Storage: {item.selectedStorage}</p>}
                    </div>
                    <button onClick={() => removeFromCart(item.product._id)} className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-surface-200 dark:border-surface-700 rounded-lg">
                      <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-1.5 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-l-lg transition-colors"><Minus size={14} /></button>
                      <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-1.5 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-r-lg transition-colors"><Plus size={14} /></button>
                    </div>
                    <span className="font-bold text-surface-900 dark:text-white">{formatPrice(price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Subtotal</span>
                <span className="font-medium text-surface-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="font-medium text-green-600">-{formatPrice(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Shipping</span>
                <span className="font-medium text-surface-900 dark:text-white">{subtotal >= 5000 ? 'Free' : formatPrice(150)}</span>
              </div>
            </div>
            <div className="border-t border-surface-100 dark:border-surface-800 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-bold text-surface-900 dark:text-white">Total</span>
                <span className="font-bold text-xl text-surface-900 dark:text-white">{formatPrice(subtotal + (subtotal >= 5000 ? 0 : 150))}</span>
              </div>
            </div>
            <Link to="/checkout">
              <Button className="w-full" size="lg">
                Proceed to Checkout <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/shop" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4 font-medium">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
