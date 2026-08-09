import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Headphones, Watch, Battery, Shield, Cable, Zap, Star, ChevronRight, Truck, RotateCcw, Headset, ShoppingBag, Clock } from 'lucide-react';
import { productAPI, categoryAPI, brandAPI, bannerAPI } from '../../services/api';
import { Product, Category, Brand, Banner } from '../../types';
import ProductCard from '../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { useRecentlyViewed } from '../../contexts/RecentlyViewedContext';
import { motion } from 'framer-motion';

const categoryIcons: Record<string, any> = {
  'Mobile Phones': Smartphone, 'Chargers': Zap, 'Earbuds': Headphones, 'Headphones': Headphones,
  'Smart Watches': Watch, 'Covers': Shield, 'Tempered Glass': Shield, 'Cables': Cable,
  'Power Banks': Battery, 'Accessories': ShoppingBag,
};

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { items: recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    const load = async () => {
      try {
        const [featured, trending, newest, cats, brandsRes, bannersRes] = await Promise.all([
          productAPI.getAll({ isFeatured: 'true', limit: '8' }) as any,
          productAPI.getAll({ isTrending: 'true', limit: '8' }) as any,
          productAPI.getAll({ isNewArrival: 'true', limit: '8' }) as any,
          categoryAPI.getAll() as any,
          brandAPI.getAll() as any,
          bannerAPI.getAll({ all: 'true' }) as any,
        ]);
        setFeaturedProducts(featured.data || []);
        setTrendingProducts(trending.data || []);
        setNewProducts(newest.data || []);
        setCategories(cats.data || []);
        setBrands(brandsRes.data || []);
        setBanners(bannersRes.data || []);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Separate banners by position (backend already filters by isActive for public API)
  // Filter banners by position and scheduling status
  const isBannerScheduled = (banner: Banner) => {
    const now = new Date();
    const start = banner.startDate ? new Date(banner.startDate) : null;
    const end = banner.endDate ? new Date(banner.endDate) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };
  const heroBanners = banners.filter(b => b.position === 'hero' && isBannerScheduled(b));
  const promoBanners = banners.filter(b => b.position === 'promo' && isBannerScheduled(b));
  const sidebarBanners = banners.filter(b => b.position === 'sidebar' && isBannerScheduled(b));

  const trustFeatures = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over Rs. 5,000' },
    { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
    { icon: Shield, title: 'Warranty', desc: 'Genuine products with warranty' },
    { icon: Headset, title: '24/7 Support', desc: 'Dedicated customer support' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-primary-600 to-indigo-700 text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div {...fadeIn}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Welcome to Velora
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
                Discover the Future of{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                    Tech
                  </span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-yellow-300/20 -skew-x-3 rounded" />
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-blue-100/90 mb-8 max-w-lg leading-relaxed">
                Premium mobile phones, accessories, and gadgets from the world's top brands. Quality guaranteed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-7 py-3.5 rounded-xl font-bold transition-all hover:shadow-xl hover:shadow-white/20 active:scale-[0.98] text-sm sm:text-base"
                >
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link
                  to="/shop?isFeatured=true"
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-7 py-3.5 rounded-xl font-bold transition-all backdrop-blur-sm border border-white/20 text-sm sm:text-base"
                >
                  View Featured
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/15">
                <div>
                  <p className="text-2xl font-bold">10K+</p>
                  <p className="text-sm text-blue-200/80">Products Sold</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="text-sm text-blue-200/80">Customer Rating</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-bold">50+</p>
                  <p className="text-sm text-blue-200/80">Top Brands</p>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn} className="hidden lg:flex justify-center">
              <div className="relative">
                {/* Main circle */}
                <div className="w-80 h-80 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                  <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                    <Smartphone size={100} className="text-white/90" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -top-3 -right-3 bg-white rounded-2xl p-3.5 shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star size={16} className="fill-yellow-500 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-surface-900">4.9 Rating</p>
                      <p className="text-[10px] text-surface-500">12K+ reviews</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-3 -left-3 bg-white rounded-2xl p-3.5 shadow-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Truck size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-surface-900">Free Delivery</p>
                      <p className="text-[10px] text-surface-500">Orders over 5K</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -right-10 bg-white rounded-2xl p-3.5 shadow-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-surface-900">Warranty</p>
                      <p className="text-[10px] text-surface-500">Guaranteed</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trustFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 flex-shrink-0">
                  <feature.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-surface-900 dark:text-white">{feature.title}</h4>
                  <p className="text-xs text-surface-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Shop by Category</h2>
            <p className="text-surface-500 mt-1">Find exactly what you need</p>
          </div>
          <Link to="/shop" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map(cat => {
            const Icon = categoryIcons[cat.name] || ShoppingBag;
            return (
              <motion.div key={cat._id} variants={fadeIn}>
                <Link to={`/shop?category=${cat._id}`} className="group block bg-white dark:bg-surface-900 rounded-2xl p-4 sm:p-6 border border-surface-100 dark:border-surface-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg transition-all duration-300 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-semibold text-sm text-surface-900 dark:text-white mb-1">{cat.name}</h3>
                  <p className="text-xs text-surface-500">{cat.productCount || 0} products</p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Featured Products</h2>
            <p className="text-surface-500 mt-1">Handpicked just for you</p>
          </div>
          <Link to="/shop?isFeatured=true" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading
            ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
            : featuredProducts.map(product => <ProductCard key={product._id} product={product} />)
          }
        </div>
      </section>

      {/* Dynamic Banners */}
      {promoBanners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="space-y-4">
            {promoBanners.map(banner => (
              <div
                key={banner._id}
                className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 max-w-xl">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3">{banner.title}</h2>
                  {banner.subtitle && <p className="text-primary-100 mb-6">{banner.subtitle}</p>}
                  {banner.link ? (
                    <Link to={banner.link} className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors active:scale-[0.98]">
                      Shop Now <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors active:scale-[0.98]">
                      Shop Now <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
                {banner.image?.url && (
                  <img
                    src={banner.image.url}
                    alt={banner.image.alt || banner.title}
                    className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Trending Now</h2>
            <p className="text-surface-500 mt-1">What everyone is buying</p>
          </div>
          <Link to="/shop?isTrending=true" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading
            ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            : trendingProducts.slice(0, 4).map(product => <ProductCard key={product._id} product={product} />)
          }
        </div>
      </section>

      {/* Brands */}
      {brands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white text-center mb-8">Top Brands</h2>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {brands.map(brand => (
              <Link key={brand._id} to={`/shop?brand=${brand._id}`} className="bg-white dark:bg-surface-900 rounded-xl px-6 py-3 border border-surface-100 dark:border-surface-800 hover:border-primary-300 hover:shadow-md transition-all text-center">
                <span className="font-semibold text-surface-700 dark:text-surface-300">{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">New Arrivals</h2>
              <p className="text-surface-500 mt-1">Fresh picks for you</p>
            </div>
            <Link to="/shop?isNewArrival=true" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newProducts.slice(0, 4).map(product => <ProductCard key={product._id} product={product} />)}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <Clock size={20} className="text-surface-600 dark:text-surface-400" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Recently Viewed</h2>
                <p className="text-surface-500 mt-0.5">Continue where you left off</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.slice(0, 4).map(product => <ProductCard key={product._id} product={product} />)}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'How long does shipping take?', a: 'Standard shipping takes 2-5 business days across Pakistan. Free shipping on orders over Rs. 5,000.' },
            { q: 'Do you offer warranties?', a: 'Yes! All products come with manufacturer warranty. Duration varies by product.' },
            { q: 'What is your return policy?', a: 'We offer a 7-day return policy for unused products in original packaging.' },
            { q: 'How can I track my order?', a: 'You will receive a WhatsApp message with your order status updates.' },
          ].map((faq, i) => (
            <details key={i} className="bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800 overflow-hidden group">
              <summary className="px-6 py-4 cursor-pointer font-medium text-surface-900 dark:text-white hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors list-none flex items-center justify-between">
                {faq.q}
                <ChevronRight size={16} className="text-surface-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-4 text-surface-600 dark:text-surface-400 text-sm">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
