import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, ShoppingCart, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { mockProducts } from '../data/mockProducts';
import { formatVND } from '../lib/format';

export default function ProductDetailsPage() {
  const { id } = useParams();
  // Using mock for now, but should ideally fetch from API
  const [product, setProduct] = useState<any>(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    // Attempt API fetch first
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if(data && !data.error) setProduct(data);
        else throw new Error("Not found in API");
      })
      .catch(() => {
        // Fallback to mock
        const found = mockProducts.find(p => p.id === id);
        setProduct(found);
      });
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center font-bold text-xl uppercase tracking-tighter loading-spinner">Đang tải...</div>
      </div>
    );
  }

  const { name, brand, description, price, basePrice, specs, image, isNew, isHot, discountPct } = product;
  const currentPrice = price || (typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice);
  const oldPrice = discountPct > 0 ? (currentPrice * 100) / (100 - discountPct) : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-24">
      <nav className="border-b border-black/10 bg-white sticky top-0 z-40 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/products" className="flex items-center gap-2 font-bold hover:text-primary-neon hover:bg-black px-4 py-2 rounded-full transition-colors text-sm uppercase tracking-wider">
            <ArrowLeft size={16} /> Quay lại cửa hàng
          </Link>
          <div className="font-black text-xl tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis px-4">
            {name}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="bg-white rounded-[2rem] border border-black/5 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          {/* Left: Image gallery / Main Image */}
          <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center p-8 relative">
            {isHot && (
              <span className="absolute top-8 left-8  z-10 rounded-full bg-red-600 px-4 py-1 flex items-center text-xs font-black text-white shadow-lg animate-pulse uppercase">
                Mua nhiều
              </span>
            )}
            {isNew && (
              <span className="absolute top-8 left-8 z-10 rounded-full bg-primary-neon px-4 py-1 text-xs font-black text-black shadow-lg uppercase">
                Mới
              </span>
            )}
            {discountPct > 0 && (
              <span className="absolute top-8 right-8 z-10 rounded-full bg-black px-4 py-1 text-xs font-black text-primary-neon shadow-lg uppercase">
                -{discountPct}% Giảm
              </span>
            )}
            <img 
              src={image || `https://picsum.photos/seed/${id}/800/800`} 
              alt={name} 
              className="w-full max-w-md object-contain hover:scale-105 transition-transform duration-500 will-change-transform drop-shadow-2xl mix-blend-multiply" 
            />
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{brand}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight mb-4">{name}</h1>
            
            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl font-black text-primary-neon drop-shadow-[0_2px_1px_rgba(0,0,0,1)] [-webkit-text-stroke:1px_black]">{formatVND(currentPrice)}</span>
              {oldPrice > 0 && (
                <span className="text-lg text-gray-400 line-through font-bold mb-1">{formatVND(oldPrice)}</span>
              )}
            </div>

            <p className="text-gray-600 font-medium leading-relaxed mb-10 max-w-lg">
              {description || "Thiết bị ngoại vi cao cấp dành cho game thủ chuyên nghiệp. Thiết kế công thái học tối ưu hiệu suất thi đấu."}
            </p>

            {specs && Object.keys(specs).length > 0 && (
              <div className="mb-10 w-full border border-black/10 rounded-2xl overflow-hidden text-sm font-medium">
                <div className="bg-gray-100 p-4 border-b border-black/10 font-bold uppercase tracking-widest text-xs">Thông số kỹ thuật</div>
                {Object.entries(specs).map(([k, v], i) => (
                  <div key={k} className={`flex px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <span className="w-1/3 text-gray-500 capitalize">{k}</span>
                    <span className="w-2/3 font-bold text-black">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4 mt-auto">
              {/* Features list */}
              <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-green-700 mb-4">
                 <div className="flex items-center gap-1"><Check size={16} /> Còn hàng sẵn</div>
                 <div className="flex items-center gap-1"><Truck size={16} /> Giao Tốc Hành 2H</div>
                 <div className="flex items-center gap-1"><ShieldCheck size={16} /> Bảo Hành 24T</div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  addItem({ id: id!, name, price: currentPrice, image, category: product.category, quantity: 1 });
                }}
                className="w-full flex items-center justify-center gap-3 bg-black text-white hover:bg-primary-neon hover:text-black py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-primary-neon/20 hover:-translate-y-1"
              >
                <ShoppingCart size={24} /> Thêm Vào Giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
