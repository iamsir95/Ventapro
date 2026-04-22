import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { formatVND } from '../lib/format';

export function CheckoutModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // Giả sử thuế VAT 8% hoặc tính sẵn vào giá
  const shipping = subtotal > 150 ? 0 : 5; // Shipping $5 (tương đương 125,000đ)
  const total = subtotal + tax + shipping;

  if (!isOpen) return null;

  const handleNext = () => setStep((s) => Math.min(s + 1, 4) as 1 | 2 | 3 | 4);
  const handleBack = () => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3 | 4);

  const handlePlaceOrder = async () => {
    setIsLoading(true);

    try {
      // Chuẩn bị dữ liệu định dạng { variantId, quantity }
      const orderItems = items.map(item => ({
        variantId: item.id, // Trong thực tế variantId sẽ nằm sâu hơn, ta giả lập item.id là variantId
        quantity: item.quantity
      }));

      // Gọi API POST tới Backend Order Service (Với userId giả lập do đây là bản preview không auth bắt buộc)
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'mock-user-123', // Demo fallback
          items: orderItems
        })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setIsLoading(false);
        setStep(4);
        clearCart();
      } else {
        alert(`Lỗi đặt hàng: ${result.error || 'Server error'}`);
        setIsLoading(false);
      }
    } catch (error) {
      alert('Không thể kết nối đến máy chủ thanh toán.');
      setIsLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="mb-8 flex items-center justify-between relative px-2">
      <div className="absolute top-1/2 left-0 h-[3px] w-full -translate-y-1/2 bg-black/5 z-0 rounded-full"></div>
      <div 
        className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 bg-black z-0 transition-all duration-300 rounded-full" 
        style={{ width: `${((Math.min(step, 3) - 1) / 2) * 100}%` }}
      ></div>

      {[1, 2, 3].map(s => (
        <div key={s} className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] transition-all bg-white ${
          step >= s ? 'border-black text-black' : 'border-black/5 text-text-secondary'
        } ${step === s ? 'shadow-md scale-110' : ''}`}>
          {step > s ? <Check size={18} /> : <span className="text-sm font-bold">{s}</span>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl mt-12 mb-12 rounded-3xl border border-black/5 bg-white/70 p-8 shadow-2xl backdrop-blur-xl">
        {step < 4 && (
          <button onClick={onClose} className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-black/5 border border-black/5 shadow-sm transition-colors">✕</button>
        )}

        <h2 className="mb-6 text-2xl font-black uppercase tracking-tight text-black">
          {step === 4 ? 'Thanh toán thành công' : 'Thanh Toán An Toàn'}
        </h2>

        {step < 4 && <StepIndicator />}

        <div className="min-h-[300px]">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="mb-4 text-lg font-bold text-black">1. Thông tin giao hàng</h3>
              <form className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Họ" required className="col-span-1 rounded-2xl border border-black/10 bg-white/90 p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm" />
                <input type="text" placeholder="Tên" required className="col-span-1 rounded-2xl border border-black/10 bg-white/90 p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm" />
                <input type="email" placeholder="Email liên hệ" required className="col-span-2 rounded-2xl border border-black/10 bg-white/90 p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm" />
                <input type="text" placeholder="Địa chỉ đường" required className="col-span-2 rounded-2xl border border-black/10 bg-white/90 p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm" />
                <input type="text" placeholder="Thành phố / Tỉnh" required className="col-span-1 rounded-2xl border border-black/10 bg-white/90 p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm" />
                <input type="text" placeholder="Mã bưu điện" required className="col-span-1 rounded-2xl border border-black/10 bg-white/90 p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm" />
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="mb-4 text-lg font-bold text-black">2. Phương thức thanh toán</h3>
              <div className="flex flex-col gap-4">
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-black bg-primary-neon/20 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-5 w-5 rounded-full border-4 border-black bg-white"></div>
                    <span className="font-bold text-black">Thẻ Tín Dụng / Ghi Nợ (Credit Card)</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-10 rounded bg-black/10"></div>
                    <div className="h-6 w-10 rounded bg-black/10"></div>
                  </div>
                </label>
                
                <div className="grid grid-cols-2 gap-4 p-5 border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md shadow-sm">
                  <input type="text" placeholder="Số thẻ (0000 0000 0000 0000)" className="col-span-2 rounded-xl border border-black/10 bg-white p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 font-medium shadow-sm" />
                  <input type="text" placeholder="MM/YY" className="col-span-1 rounded-xl border border-black/10 bg-white p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 font-medium shadow-sm" />
                  <input type="text" placeholder="CVC" className="col-span-1 rounded-xl border border-black/10 bg-white p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 font-medium shadow-sm" />
                </div>
                
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-black/10 bg-white p-5 hover:border-black/30 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border border-black/20"></div>
                    <span className="font-bold text-black">Thanh toán VNPay / MoMo (Đang cập nhật)</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="mb-4 text-lg font-bold text-black">3. Tổng kết & Xác nhận đơn hàng</h3>
              <div className="rounded-auth border border-black/5 bg-white/60 p-6 rounded-3xl shadow-sm backdrop-blur-md">
                <div className="max-h-40 overflow-y-auto mb-4 border-b border-black/5 pb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between mb-2 text-sm">
                      <span className="text-text-secondary font-medium">{item.quantity}x {item.name}</span>
                      <span className="text-black font-bold">{formatVND(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 text-sm font-medium">
                  <div className="flex justify-between text-text-secondary">
                    <span>Tạm tính</span><span className="text-black font-bold">{formatVND(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Thuế VAT (8%)</span><span className="text-black font-bold">{formatVND(tax)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Phí vận chuyển</span><span className="text-black font-bold">{shipping === 0 ? 'MIỄN PHÍ' : formatVND(shipping)}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-black/5 flex justify-between text-xl font-black text-black">
                    <span>Thành tiền</span><span>{formatVND(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-500">
              <div className="mb-6 rounded-full bg-primary-neon/20 p-4">
                <CheckCircle2 size={64} className="text-black" />
              </div>
              <h2 className="mb-2 text-3xl font-black text-black">HOÀN TẤT ĐẶT HÀNG</h2>
              <p className="mb-8 text-text-secondary font-medium">Thiết bị của bạn đang được đóng gói giao tới.<br/>Một email xác nhận đã được gửi đi.</p>
              <button 
                onClick={onClose}
                className="rounded-2xl bg-black px-8 py-3.5 font-bold text-primary-neon hover:bg-black/80 transition-colors shadow-lg"
              >
                Trở về cửa hàng
              </button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="mt-8 flex justify-between border-t border-black/5 pt-6">
            {step > 1 ? (
              <button onClick={handleBack} className="px-6 py-3 rounded-2xl font-bold bg-white border border-black/10 shadow-sm text-black hover:bg-black/5 transition-colors">
                Quay lại
              </button>
            ) : <div></div>}
            
            <button 
              onClick={step === 3 ? handlePlaceOrder : handleNext} 
              disabled={isLoading}
              className="flex items-center gap-2 rounded-2xl bg-primary-neon px-8 py-3 font-bold text-black shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:translate-y-0"
            >
              {isLoading ? 'Đang xử lý...' : step === 3 ? 'Đặt Hàng Khóa Dữ Liệu' : 'Tiếp tục'}
              {step < 3 && <ChevronRight size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
