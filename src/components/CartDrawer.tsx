import React from 'react';
import { useCartStore } from '../store/cartStore';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatVND } from '../lib/format';

export function CartDrawer({ isOpen, onClose, onCheckout }: { isOpen: boolean; onClose: () => void; onCheckout: () => void }) {
  const { items, updateQuantity, removeItem } = useCartStore();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShipThreshold = 150;
  const freeShipDelta = Math.max(0, freeShipThreshold - subtotal);
  const freeShipPct = Math.min(100, (subtotal / freeShipThreshold) * 100);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-md transition-opacity" onClick={onClose} />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-[120] w-full max-w-md flex flex-col border-l border-black/5 bg-white/85 backdrop-blur-2xl transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-[100%]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 p-6 bg-white/40">
          <h2 className="flex items-center gap-3 text-xl font-black text-black tracking-tight uppercase">
            <span className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-primary-neon">
              <ShoppingBag size={18} />
            </span>
            Giỏ hàng <span className="text-text-secondary text-sm font-bold">({items.length})</span>
          </h2>
          <button onClick={onClose} className="rounded-full w-9 h-9 flex items-center justify-center bg-white border border-black/5 shadow-sm text-black hover:bg-black/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Free ship bar */}
        {items.length > 0 && (
          <div className="px-6 pt-4">
            {freeShipDelta > 0 ? (
              <p className="text-xs font-bold text-text-secondary mb-2">
                Thêm <span className="text-black font-black">{formatVND(freeShipDelta)}</span> để được <span className="text-primary-neon bg-black px-2 py-0.5 rounded">FREESHIP</span>
              </p>
            ) : (
              <p className="text-xs font-black uppercase tracking-widest text-black mb-2 flex items-center gap-2">
                <span className="bg-primary-neon px-2 py-0.5 rounded">FREESHIP</span> Đơn của bạn được miễn phí vận chuyển!
              </p>
            )}
            <div className="h-2 rounded-full bg-black/5 overflow-hidden">
              <div className="h-full bg-primary-neon rounded-full transition-all" style={{ width: `${freeShipPct}%` }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-text-secondary">
              <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={32} className="text-black/20" />
              </div>
              <p className="font-black text-lg text-black mb-1 uppercase">Giỏ hàng trống</p>
              <p className="text-sm mb-6">Hãy chọn thiết bị để bắt đầu hành trình pro của bạn.</p>
              <button onClick={onClose} className="px-6 py-3 rounded-2xl bg-black text-primary-neon font-bold hover:bg-primary-neon hover:text-black transition-colors">
                Khám phá ngay
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border border-black/5 bg-light-bg mix-blend-multiply">
                    <img src={item.image || 'https://picsum.photos/seed/gear/100'} alt={item.name} className="h-3/4 w-3/4 object-contain" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <h4 className="line-clamp-2 text-sm font-bold text-black leading-tight mb-1">{item.name}</h4>
                      <p className="text-sm font-black text-black">{formatVND(item.price)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-xl border border-black/10 bg-white">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-black hover:bg-black/5 rounded-l-xl transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-black hover:bg-black/5 rounded-r-xl transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors" title="Xoá">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="border-t border-black/5 bg-white/60 p-6 backdrop-blur-xl space-y-3">
            <div className="flex justify-between text-text-secondary font-medium text-sm">
              <span>Tạm tính</span>
              <span className="font-bold text-black">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-black border-t border-black/5 pt-3">
              <span>Tổng</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-black py-4 font-black text-primary-neon text-base transition-all hover:bg-primary-neon hover:text-black shadow-xl uppercase tracking-wider"
            >
              Thanh toán <ArrowRight size={18} />
            </button>
            <p className="text-xs text-text-secondary text-center font-medium">Thuế VAT và phí vận chuyển sẽ được tính ở bước thanh toán.</p>
          </div>
        )}
      </div>
    </>
  );
}
