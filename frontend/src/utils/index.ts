import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getDiscountedPrice(price: number, discount: number): number {
  if (discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
}

export function getStockStatus(stock: number): { label: string; color: string } {
  if (stock === 0) return { label: 'Out of Stock', color: 'text-red-500' };
  if (stock <= 5) return { label: `Only ${stock} left`, color: 'text-orange-500' };
  if (stock <= 20) return { label: 'Low Stock', color: 'text-yellow-500' };
  return { label: 'In Stock', color: 'text-green-500' };
}

export function generateWhatsAppMessage(data: {
  items: { name: string; quantity: number; price: number }[];
  shippingInfo: { name: string; phone: string; address: string; city: string; notes?: string };
  total: number;
}): string {
  const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
  let msg = `*📱 New Order - Velora*\n\n`;
  msg += `*Customer:* ${data.shippingInfo.name}\n`;
  msg += `*Phone:* ${data.shippingInfo.phone}\n`;
  msg += `*Address:* ${data.shippingInfo.address}, ${data.shippingInfo.city}\n`;
  if (data.shippingInfo.notes) msg += `*Notes:* ${data.shippingInfo.notes}\n`;
  msg += `\n*📦 Products:*\n`;
  data.items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`;
  });
  msg += `\n*💰 Grand Total: ${formatPrice(data.total)}*\n`;
  msg += `*🕐 Order Time: ${now}*\n`;
  return encodeURIComponent(msg);
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
}
