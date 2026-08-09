import React from 'react';
import { cn } from '../../utils';
import { Product } from '../../types';
import { formatPrice, getDiscountedPrice } from '../../utils';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Zap } from 'lucide-react';
import Button from './Button';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const discounted = getDiscountedPrice(product.price, product.discount);
  const inCart = isInCart(product._id);
  const inWishlist = isInWishlist(product._id);

  return (
    <div className={cn('group relative bg-white dark:bg-surface-900 rounded-2xl overflow-hidden border border-surface-100 dark:border-surface-800 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300', className)}>
      <Link to={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-surface-50 dark:bg-surface-800">
          <img
            src={product.images[0]?.url || 'https://placehold.co/400x400/1a1a2e/ffffff?text=Product'}
            alt={product.images[0]?.alt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              -{product.discount}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="absolute top-3 right-3 bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              NEW
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={cn(
              'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg',
              inWishlist
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white/90 dark:bg-surface-800/90 text-surface-400 hover:text-red-500 backdrop-blur-sm',
              product.isNewArrival && !inWishlist && 'top-14'
            )}
          >
            <Heart size={16} className={inWishlist ? 'fill-current' : ''} />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-surface-300'} />
          ))}
          <span className="text-xs text-surface-500 ml-1">({product.numReviews})</span>
        </div>

        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-sm line-clamp-2 mb-1 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="text-xs text-surface-500 mb-2">{product.brand.name}</p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-surface-900 dark:text-white">{formatPrice(discounted)}</span>
          {product.discount > 0 && (
            <span className="text-sm text-surface-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant={inCart ? 'secondary' : 'primary'}
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
          >
            <ShoppingCart size={14} />
            {inCart ? 'In Cart' : 'Add to Cart'}
          </Button>
          <button
            className="w-full h-8 px-3 text-sm font-medium rounded-xl inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
              navigate('/checkout');
            }}
          >
            <Zap size={14} className="animate-pulse" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
