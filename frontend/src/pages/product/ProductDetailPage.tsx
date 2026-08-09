import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Truck, Shield, RotateCcw, ChevronRight, Minus, Plus, Share2, Heart, Zap } from 'lucide-react';
import { productAPI } from '../../services/api';
import { Product } from '../../types';
import { formatPrice, getDiscountedPrice, getStockStatus } from '../../utils';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useRecentlyViewed } from '../../contexts/RecentlyViewedContext';
import ProductCard from '../../components/ui/ProductCard';
import Button from '../../components/ui/Button';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'reviews'>('specs');
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res: any = await productAPI.getBySlug(slug);
        setProduct(res.data.product);
        setRelated(res.data.related || []);
        if (res.data.product.color?.length) setSelectedColor(res.data.product.color[0]);
        if (res.data.product.storage?.length) setSelectedStorage(res.data.product.storage[0]);
        addToRecentlyViewed(res.data.product);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 skeleton w-32" />
            <div className="h-8 skeleton w-3/4" />
            <div className="h-6 skeleton w-1/3" />
            <div className="h-10 skeleton w-1/4" />
            <div className="h-24 skeleton" />
            <div className="h-12 skeleton rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Product Not Found</h1>
        <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium">← Back to Shop</Link>
      </div>
    );
  }

  const discounted = getDiscountedPrice(product.price, product.discount);
  const stock = getStockStatus(product.stock);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-500 mb-6">
        <Link to="/" className="hover:text-surface-700">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="hover:text-surface-700">Shop</Link>
        <ChevronRight size={14} />
        {product.category && (
          <>
            <Link to={`/shop?category=${product.category._id}`} className="hover:text-surface-700">{product.category.name}</Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="text-surface-900 dark:text-white truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-surface-50 dark:bg-surface-800 rounded-2xl overflow-hidden mb-4">
            <img
              src={product.images[selectedImage]?.url || 'https://placehold.co/600x600/1a1a2e/ffffff?text=Product'}
              alt={product.images[selectedImage]?.alt || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-primary-500' : 'border-transparent hover:border-surface-300'}`}>
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-sm text-primary-600 font-medium mb-2">{product.brand.name}</p>}
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-surface-300'} />
              ))}
            </div>
            <span className="text-sm text-surface-500">{product.rating} ({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-surface-900 dark:text-white">{formatPrice(discounted)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-surface-400 line-through">{formatPrice(product.price)}</span>
                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold px-2 py-0.5 rounded-lg">-{product.discount}%</span>
              </>
            )}
          </div>

          <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed mb-6">{product.shortDescription || product.description}</p>

          <div className={`text-sm font-medium mb-6 ${stock.color}`}>{stock.label}</div>

          {/* Color Selection */}
          {product.color?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Color: <span className="text-surface-900 dark:text-white">{selectedColor}</span></p>
              <div className="flex gap-2">
                {product.color.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedColor === c ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'border-surface-200 dark:border-surface-700 hover:border-surface-400'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Storage Selection */}
          {product.storage?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Storage: <span className="text-surface-900 dark:text-white">{selectedStorage}</span></p>
              <div className="flex gap-2">
                {product.storage.map(s => (
                  <button key={s} onClick={() => setSelectedStorage(s)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedStorage === s ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'border-surface-200 dark:border-surface-700 hover:border-surface-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Quantity:</span>
            <div className="flex items-center border border-surface-200 dark:border-surface-700 rounded-xl">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-l-xl transition-colors"><Minus size={16} /></button>
              <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-r-xl transition-colors"><Plus size={16} /></button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button size="lg" className="w-full sm:flex-1" onClick={() => addToCart(product, quantity, selectedColor, selectedStorage)} disabled={product.stock === 0}>
              <ShoppingCart size={18} />
              {isInCart(product._id) ? 'Update Cart' : 'Add to Cart'}
            </Button>
            <Button
              size="lg"
              className="w-full sm:flex-1"
              onClick={() => {
                addToCart(product, quantity, selectedColor, selectedStorage);
                window.location.href = '/checkout';
              }}
              disabled={product.stock === 0}
            >
              <Zap size={18} />
              Buy Now
            </Button>
          </div>
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3 rounded-xl border-2 transition-all ${isInWishlist(product._id) ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-surface-200 dark:border-surface-700 text-surface-400 hover:border-red-300 hover:text-red-400'}`}
            >
              <Heart size={20} className={isInWishlist(product._id) ? 'fill-current' : ''} />
            </button>
            <Button variant="outline" size="lg" onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}>
              <Share2 size={18} />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[{ icon: Truck, label: 'Free Shipping' }, { icon: Shield, label: product.warranty || 'Warranty' }, { icon: RotateCcw, label: '7-Day Return' }].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-center">
                <f.icon size={18} className="text-primary-600" />
                <span className="text-[11px] text-surface-600 dark:text-surface-400">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="border-t border-surface-100 dark:border-surface-800 pt-6">
            <div className="flex gap-4 mb-4">
              {(['specs', 'features', 'reviews'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`text-sm font-medium pb-2 border-b-2 transition-all ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-surface-500 hover:text-surface-700'}`}>
                  {tab === 'specs' ? 'Specifications' : tab === 'features' ? 'Features' : `Reviews (${product.numReviews})`}
                </button>
              ))}
            </div>

            {activeTab === 'specs' && (
              <div className="space-y-2">
                {product.specifications?.map((spec, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-surface-50 dark:border-surface-800 text-sm">
                    <span className="text-surface-500">{spec.key}</span>
                    <span className="font-medium text-surface-900 dark:text-white">{spec.value}</span>
                  </div>
                ))}
                {product.processor && <div className="flex justify-between py-2 border-b border-surface-50 dark:border-surface-800 text-sm"><span className="text-surface-500">Processor</span><span className="font-medium text-surface-900 dark:text-white">{product.processor}</span></div>}
                {product.display && <div className="flex justify-between py-2 border-b border-surface-50 dark:border-surface-800 text-sm"><span className="text-surface-500">Display</span><span className="font-medium text-surface-900 dark:text-white">{product.display}</span></div>}
                {product.battery && <div className="flex justify-between py-2 border-b border-surface-50 dark:border-surface-800 text-sm"><span className="text-surface-500">Battery</span><span className="font-medium text-surface-900 dark:text-white">{product.battery}</span></div>}
                {product.camera && <div className="flex justify-between py-2 border-b border-surface-50 dark:border-surface-800 text-sm"><span className="text-surface-500">Camera</span><span className="font-medium text-surface-900 dark:text-white">{product.camera}</span></div>}
              </div>
            )}

            {activeTab === 'features' && (
              <ul className="space-y-2">
                {product.features?.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {(product as any).reviews?.length > 0 ? (product as any).reviews.map((review: any) => (
                  <div key={review._id} className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold">{review.user?.name?.[0] || 'U'}</div>
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{review.user?.name}</p>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-surface-300'} />)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400">{review.comment}</p>
                  </div>
                )) : <p className="text-sm text-surface-500">No reviews yet. Be the first to review!</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
