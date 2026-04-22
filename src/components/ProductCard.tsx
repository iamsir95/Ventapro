import React from 'react';
import { ShoppingCart, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { formatVND } from '../lib/format';
import { Product } from '../types';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/cartStore';

export function ProductCard(props: Product) {
  const { name, category, price, discountPct = 0, isNew, isHot, image, specs } = props;
  const finalPrice = discountPct > 0 ? price * (1 - discountPct / 100) : price;
  const addRecentlyViewed = useUserStore(state => state.addRecentlyViewed);
  const addItem = useCartStore(state => state.addItem);

  const handleView = () => addRecentlyViewed(props);
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating when click add to cart
    e.stopPropagation();
    addItem({ id: props.id, name, category, price: finalPrice, quantity: 1, image });
  };

  return (
    <Link 
      to={`/products/${props.id}`}
      onClick={handleView}
      className="group cursor-pointer relative flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white/60 p-6 transition-all duration-500 hover:border-black/10 hover:shadow-xl hover:-translate-y-1 backdrop-blur-md h-full"
    >
      {/* Badges */}
      <div className="absolute right-5 top-5 z-10 flex flex-col gap-2">
        {isHot && (
          <span className="rounded-lg px-3 py-1 font-black text-[10px] uppercase text-white bg-black shadow-md">
            HOT
          </span>
        )}
        {isNew && (
          <span className="rounded-lg px-3 py-1 font-black text-[10px] uppercase text-black bg-primary-neon shadow-md">
            MỚI
          </span>
        )}
        {discountPct > 0 && (
          <span className="rounded-lg bg-black px-3 py-1 font-black text-[10px] uppercase text-white shadow-md">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Image Placeholder with border styling from mockup */}
      <div className="relative mb-6 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-white mix-blend-multiply shadow-sm border border-black/5">
        <img
          src={image}
          alt={name}
          className="z-10 h-3/4 w-3/4 object-contain transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <h3 className="mb-1 text-lg font-bold text-black transition-colors leading-tight">
          {name}
        </h3>
        <span className="mb-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {category}
        </span>

        {/* Specs snippet */}
        <div className="mb-6 flex flex-wrap gap-2 text-[11px] text-text-secondary font-medium">
          {Object.entries(specs).slice(0, 3).map(([key, value]) => (
            <span key={key} className="bg-black/5 px-2.5 py-1 rounded-md">
              <span className="text-black/50">{key}:</span> <span className="text-black">{value as React.ReactNode}</span>
            </span>
          ))}
        </div>

        {/* Price & Action */}
        <div className="mt-auto flex items-end justify-between pt-4 border-t border-black/5 relative">
          <div className="flex flex-col justify-end">
            <div className="font-black text-xl text-black">
              {formatVND(finalPrice)}
            </div>
            {discountPct > 0 && (
              <span className="text-sm font-medium text-text-secondary line-through opacity-60">
                {formatVND(price)}
              </span>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-black text-primary-neon transition-all duration-300 hover:bg-primary-neon hover:text-black hover:scale-105 shadow-md"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
}
