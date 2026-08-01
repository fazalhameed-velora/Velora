export interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: Brand;
  category: Category;
  description: string;
  shortDescription?: string;
  specifications: { key: string; value: string }[];
  features: string[];
  images: { url: string; alt: string; thumbnail?: string }[];
  gallery: { url: string; alt: string }[];
  price: number;
  discount: number;
  stock: number;
  sku?: string;
  rating: number;
  numReviews: number;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  warranty?: string;
  color: string[];
  storage: string[];
  ram: string[];
  weight?: string;
  dimensions?: string;
  battery?: string;
  processor?: string;
  display?: string;
  camera?: string;
  connectivity: string[];
  accessoriesIncluded: string[];
  soldCount: number;
  viewCount: number;
  discountedPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; alt: string };
  icon?: string;
  parent?: string;
  isActive: boolean;
  order: number;
  productCount: number;
  subcategories?: Category[];
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: { url: string; alt: string };
  description?: string;
  website?: string;
  isActive: boolean;
  productCount: number;
}

export interface Order {
  _id: string;
  user?: User;
  guestId?: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCost: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  whatsappSent: boolean;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface User {
  _id: string;
  clerkId?: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isGuest: boolean;
  addresses: Address[];
  wishlist: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  _id?: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image?: { url: string; alt: string };
  link?: string;
  position: string;
  order: number;
  isActive: boolean;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  product: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpful: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface DashboardData {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalCategories: number;
  totalRevenue: number;
  monthlySales: { _id: { year: number; month: number }; revenue: number; orders: number }[];
  recentOrders: Order[];
  topProducts: Product[];
  lowStock: Product[];
  ordersByStatus: { _id: string; count: number }[];
}
