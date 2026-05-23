import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, ShoppingCart, ShieldCheck, Truck, Sparkles, Plus, Minus, Heart, Share2, Flame } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { mockProducts } from '../data/mockProducts';
import { formatVND } from '../lib/format';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const addRecentlyViewed = useUserStore((s) => s.addRecentlyViewed);

  useEffect(() => {
    setQuantity(1);
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setProduct(data);
          addRecentlyViewed({
            id: data.id,
            name: data.name,
            category: data.category,
            price: data.price || data.basePrice,
            image: data.image,
            specs: data.specs || {},
          });
        } else throw new Error('Not in API');
      })
      .catch(() => {
        const found = mockProducts.find((p) => p.id === id);
        if (found) {
          setProduct(found);
          addRecentlyViewed(found);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <div className="text-center font-black text-xl uppercase tracking-widest text-text-secondary">Đang tải...</div>
      </div>
    );
  }

  const { name, brand, description, price, basePrice, specs, image, isNew, isHot, discountPct } = product;
  const currentPrice = price ?? (typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice ?? 0);
  const oldPrice = discountPct > 0 ? (currentPrice * 100) / (100 - discountPct) : 0;
  const category: string = product.category || 'Gaming Gear';

  const related = mockProducts.filter((p) => p.category === category && p.id !== id).slice(0, 3);

  const handleAdd = () => {
    addItem({ id: id!, name, price: currentPrice, image, category, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="min-h-screen bg-light-bg text-black font-sans pb-24">
      {/* Nav */}
      <nav className="border-b border-black/5 bg-white/70 sticky top-0 z-40 px-6 py-4 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/products" className="flex items-center gap-2 font-bold hover:text-primary-neon transition-colors text-sm uppercase tracking-wider">
            <ArrowLeft size={16} /> Quay lại cửa hàng
          </Link>
          <Link to="/" className="text-xl font-black tracking-tighter flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary-neon flex items-center justify-center text-black">
              <Sparkles size={14} />
            </span>
            VEN<span className="opacity-30">TA</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {/* Breadcrumb */}
        <div className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-black">Trang chủ</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black">Cửa hàng</Link>
          <span>/</span>
          <span className="text-black">{category}</span>
        </div>

        {/* Main */}
        <div className="bg-white rounded-[2rem] border border-black/5 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative bg-light-bg flex items-center justify-center p-8 lg:p-16 min-h-[500px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,252,49,0.15)_0%,transparent_60%)]"></div>
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
              {isHot && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-lg uppercase">
                  <Flame size={12} /> Hot
                </span>
              )}
              {isNew && (
                <span className="rounded-full bg-primary-neon px-3 py-1 text-xs font-black text-black shadow-lg uppercase">
                  Mới
                </span>
              )}
              {discountPct > 0 && (
                <span className="rounded-full bg-black px-3 py-1 text-xs font-black text-primary-neon shadow-lg uppercase">
                  -{discountPct}%
                </span>
              )}
            </div>
            <img
              src={image || `https://picsum.photos/seed/${id}/800/800`}
              alt={name}
              className="w-full max-w-md object-contain hover:scale-105 transition-transform duration-500 will-change-transform drop-shadow-2xl mix-blend-multiply relative z-10"
            />
          </div>

          {/* Info */}
          <div className="p-8 lg:p-12 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-text-secondary bg-light-bg border border-black/5 px-3 py-1.5 rounded-full">{brand || 'Venta'}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">/ {category}</span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-black tracking-tighter leading-tight mb-4">{name}</h1>

            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl lg:text-5xl font-black text-black">{formatVND(currentPrice)}</span>
              {oldPrice > 0 && (
                <span className="text-lg text-text-secondary line-through font-bold mb-1.5">{formatVND(oldPrice)}</span>
              )}
            </div>
            {discountPct > 0 && (
              <p className="text-sm font-bold text-red-600 mb-6">Tiết kiệm {formatVND(oldPrice - currentPrice)} ({discountPct}%)</p>
            )}
            {discountPct === 0 && <div className="mb-6"></div>}

            <p className="text-text-secondary font-medium leading-relaxed mb-8">
              {description || 'Thiết bị ngoại vi cao cấp dành cho game thủ chuyên nghiệp. Thiết kế công thái học tối ưu hiệu suất thi đấu.'}
            </p>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center rounded-2xl border border-black/10 bg-white shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-black/5 rounded-l-2xl transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-black">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-3 hover:bg-black/5 rounded-r-2xl transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-3 bg-black text-primary-neon hover:bg-primary-neon hover:text-black py-4 rounded-2xl font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-primary-neon/30 hover:-translate-y-0.5"
              >
                {added ? (
                  <><Check size={20} /> Đã thêm</>
                ) : (
                  <><ShoppingCart size={20} /> Thêm vào giỏ</>
                )}
              </button>
              <button className="p-4 rounded-2xl border border-black/10 bg-white hover:bg-black hover:text-primary-neon transition-colors shadow-sm" title="Yêu thích">
                <Heart size={18} />
              </button>
              <button className="p-4 rounded-2xl border border-black/10 bg-white hover:bg-black hover:text-primary-neon transition-colors shadow-sm" title="Chia sẻ">
                <Share2 size={18} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <TrustBadge icon={<Check size={18} />} label="Còn hàng" />
              <TrustBadge icon={<Truck size={18} />} label="Giao 2H" />
              <TrustBadge icon={<ShieldCheck size={18} />} label="BH 24T" />
            </div>

            {/* Specs */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="border border-black/5 rounded-2xl overflow-hidden bg-light-bg">
                <div className="px-4 py-3 border-b border-black/5 font-black uppercase tracking-widest text-xs text-text-secondary">Thông số kỹ thuật</div>
                {Object.entries(specs).map(([k, v], i) => (
                  <div key={k} className={`flex px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-light-bg'}`}>
                    <span className="w-1/3 text-text-secondary font-medium">{k}</span>
                    <span className="w-2/3 font-bold text-black">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-2">[ Sản phẩm tương tự ]</p>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Có thể bạn thích</h2>
              </div>
              <Link to="/products" className="text-sm font-bold uppercase tracking-widest hover:text-primary-neon transition-colors">
                Xem thêm →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p: Product) => <ProductCard key={p.id} {...p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-2xl bg-primary-neon/10 border border-primary-neon/30">
      <span className="text-black">{icon}</span>
      <span className="text-xs font-black uppercase tracking-wider">{label}</span>
    </div>
  );
}
