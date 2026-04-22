import React from 'react';
import { useCartStore } from '../store/cartStore';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { formatVND } from '../lib/format';

export function CartDrawer({ isOpen, onClose, onCheckout }: { isOpen: boolean, onClose: () => void, onCheckout: () => void }) {
  const { items, updateQuantity, removeItem } = useCartStore();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-md transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-[120] w-full max-w-md flex flex-col border-l border-black/5 bg-white/70 backdrop-blur-2xl transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-[100%]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 p-6 bg-white/40">
          <h2 className="flex items-center gap-2 text-xl font-black text-black tracking-tight uppercase">
            <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-primary-neon">
              <ShoppingBag size={16} />
            </span>
            GIỎ HÀNG THIẾT BỊ
          </h2>
          <button onClick={onClose} className="rounded-full w-8 h-8 flex items-center justify-center bg-white border border-black/5 shadow-sm text-black hover:bg-black/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-text-secondary">
              <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={32} className="text-black/20" />
              </div>
              <p className="font-bold text-lg text-black mb-1">Giỏ hàng đang trống.</p>
              <p className="text-sm">Hãy trang bị một vài thiết bị để bắt đầu.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-black/5 pb-6">
                  <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-sm mix-blend-multiply">
                    <img src={item.image || 'https://picsum.photos/seed/gear/100'} alt={item.name} className="h-3/4 w-3/4 object-contain" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <h4 className="line-clamp-2 text-base font-bold text-black leading-tight">{item.name}</h4>
                      <p className="mt-1 text-sm font-black text-primary-neon bg-black inline-block px-2 py-0.5 rounded-md">{formatVND(item.price)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center rounded-xl border border-black/10 bg-white shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-black hover:bg-black/5 rounded-l-xl transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-black">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-black hover:bg-black/5 rounded-r-xl transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 bg-red-50 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                        title="Xoá món đồ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className="border-t border-black/5 bg-white/60 p-6 backdrop-blur-xl">
            <div className="mb-4 flex justify-between text-lg font-black text-black">
              <span>Tạm tính</span>
              <span className="text-black">{formatVND(subtotal)}</span>
            </div>
            <p className="mb-6 text-sm text-text-secondary font-medium">Thuế và phí vận chuyển sẽ được tính tại bước thanh toán.</p>
            <button 
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="w-full rounded-2xl bg-black py-4 font-bold text-primary-neon text-lg transition-all hover:-translate-y-1 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 uppercase"
            >
              Thanh Toán Ngay
            </button>
          </div>
        )}
      </div>
    </>
  );
}
