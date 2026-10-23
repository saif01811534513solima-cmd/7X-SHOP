import React from 'react';
import { Star, ShoppingBag, Eye, Zap } from 'lucide-react';
import { Product } from '../types';
import { useShopStore } from '../services/store';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickBuy?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickBuy,
}) => {
  const store = useShopStore();
  const t = store.t();

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const displayName = store.language === 'bn' ? product.nameBn : product.nameEn;

  return (
    <div className="group relative bg-white border border-slate-200/90 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
      {/* Top Media Container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelect(product)}>
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.nameEn}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-sm">
            7X SHOP
          </div>
        )}

        {/* Quiet Discount Tag (sharp square or subtle ribbon, no rounded pill candy) */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm shadow-xs tracking-tight">
            -{discountPercent}%
          </div>
        )}

        {/* Hot / Featured subtle badge */}
        {product.isHot && (
          <div className="absolute top-2.5 right-2.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
            Hot
          </div>
        )}

        {/* Quick view overlay hover action */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={e => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="p-2.5 bg-white text-slate-900 rounded-lg shadow hover:bg-slate-50 transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata without static pills - cleanly separated text */}
          <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-1.5 font-medium">
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{product.category}</span>
            {product.stock <= 5 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-red-600 font-semibold">
                  {store.language === 'bn' ? `মাত্র ${product.stock}টি বাকি` : `Only ${product.stock} left`}
                </span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelect(product)}
            className="text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {displayName}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-800">{product.rating}</span>
            <span className="text-[11px] text-slate-600">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                {store.formatPrice(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-slate-600 line-through">
                  {store.formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => store.addToCart(product, 1)}
              className="p-2 text-slate-700 hover:text-white bg-slate-100 hover:bg-slate-900 rounded-lg transition"
              title={t.addToCart}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            {onQuickBuy && (
              <button
                onClick={() => onQuickBuy(product)}
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">{t.buyNow}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
