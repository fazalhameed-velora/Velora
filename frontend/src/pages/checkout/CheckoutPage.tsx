import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '../../contexts/CartContext';
import { orderAPI, couponAPI } from '../../services/api';
import { formatPrice, getDiscountedPrice, generateWhatsAppMessage } from '../../utils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import notify from '../../utils/notifications';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Your cart is empty</h1>
        <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
      </div>
    );
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res: any = await couponAPI.validate(couponCode);
      if (res.success) {
        const data = res.data;
        let disc = 0;
        if (data.discountType === 'percentage') {
          disc = Math.min(subtotal * data.discountValue / 100, data.maxDiscount || Infinity);
        } else {
          disc = Math.min(data.discountValue, subtotal);
        }
        setCouponDiscount(Math.round(disc));
        setCouponApplied(true);
        notify.success('Coupon Applied!', { description: `You saved ${formatPrice(Math.round(disc))} with this coupon.` });
      }
    } catch (e: any) {
      notify.error('Invalid Coupon', { description: e.message || 'This coupon code is not valid or has expired.' });
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  const shippingCost = 0; // Free shipping
  const total = subtotal - couponDiscount;

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true);
    try {
      const orderData = {
        items: items.map(i => ({ product: i.product._id, quantity: i.quantity })),
        shippingInfo: data,
        couponCode: couponApplied ? couponCode : undefined,
        total,
      };

      await orderAPI.create(orderData);

      const whatsappMsg = generateWhatsAppMessage({
        items: items.map(i => ({
          name: i.product.name,
          quantity: i.quantity,
          price: getDiscountedPrice(i.product.price, i.product.discount),
        })),
        shippingInfo: data,
        total,
      });

      const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923001234567';
      window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`, '_blank');

      clearCart();
      notify.success('Order Placed Successfully!', {
        description: 'Your order has been confirmed.',
        duration: 3000,
      });
      navigate('/order-confirmation', { state: { orderData: { total, items } } });
    } catch (e: any) {
      notify.error('Order Failed', {
        description: e.message || 'Unable to place your order. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Shipping Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
                <Input label="Phone Number" placeholder="03001234567" error={errors.phone?.message} {...register('phone')} />
                <div className="sm:col-span-2">
                  <Input label="Address" placeholder="Street address, area" error={errors.address?.message} {...register('address')} />
                </div>
                <Input label="City" placeholder="Karachi" error={errors.city?.message} {...register('city')} />
                <div className="sm:col-span-2">
                  <Input label="Notes (optional)" placeholder="Any special instructions" {...register('notes')} />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Order Items</h2>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.product._id} className="flex items-center gap-4 py-3 border-b border-surface-50 dark:border-surface-800 last:border-0">
                    <img src={item.product.images[0]?.url || 'https://placehold.co/60x60/1a1a2e/ffffff?text=P'} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{item.product.name}</p>
                      <p className="text-xs text-surface-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-surface-900 dark:text-white">{formatPrice(getDiscountedPrice(item.product.price, item.product.discount) * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Order Summary</h3>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="flex-1 h-10 px-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm focus:ring-2 focus:ring-primary-500" disabled={couponApplied} />
                {couponApplied ? (
                  <Button variant="ghost" size="sm" onClick={() => { setCouponApplied(false); setCouponDiscount(0); setCouponCode(''); }}>Remove</Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={applyCoupon}>Apply</Button>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Coupon Discount</span>
                    <span className="font-medium text-green-600">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Shipping</span>
                  <span className="font-medium text-green-600 dark:text-green-400">🚚 Free Shipping</span>
                </div>
              </div>
              <div className="border-t border-surface-100 dark:border-surface-800 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-bold text-surface-900 dark:text-white">Total</span>
                  <span className="font-bold text-xl text-surface-900 dark:text-white">{formatPrice(total)}</span>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={submitting}>
                Place Order via WhatsApp
              </Button>
              <p className="text-xs text-surface-500 text-center mt-3">
                You'll be redirected to WhatsApp to confirm your order
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
