import React, { useEffect, useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { CheckCircle2, ChevronRight, Check, X, CreditCard, Wallet, Truck, ArrowLeft } from 'lucide-react';
import { formatVND } from '../lib/format';
import { getSession } from '../lib/authClient';

type PayMethod = 'CARD' | 'VNPAY' | 'MOMO' | 'COD';

export function CheckoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>('CARD');
  const [session, setSession] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [shipping, setShipping] = useState({ firstName: '', lastName: '', email: '', address: '', city: '', zip: '' });

  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipFee = subtotal > 150 ? 0 : 5;
  const total = subtotal + tax + shipFee;

  useEffect(() => {
    if (isOpen) {
      getSession().then(setSession);
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateStep = (s: number) => {
    if (s === 1) {
      return shipping.firstName && shipping.lastName && shipping.email && shipping.address && shipping.city;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }
    setStep((s) => Math.min(s + 1, 4) as 1 | 2 | 3 | 4);
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3 | 4);

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const orderItems = items.map((item) => ({ variantId: item.id, quantity: item.quantity }));
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id || session?.user?.email || 'guest-' + Date.now(),
          items: orderItems,
          paymentMethod: payMethod === 'CARD' || payMethod === 'COD' ? null : payMethod,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setOrderId(result.order?.id || '');
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
          return;
        }
        setStep(4);
        clearCart();
      } else {
        alert(`Lỗi đặt hàng: ${result.error || 'Server error'}`);
      }
    } catch (e) {
      alert('Không thể kết nối đến máy chủ thanh toán.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl border border-black/5 bg-white/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        {step < 4 && (
          <button onClick={onClose} className="absolute right-5 top-5 w-9 h-9 flex items-center justify-center rounded-full bg-white text-black hover:bg-black/5 border border-black/5 shadow-sm transition-colors">
            <X size={18} />
          </button>
        )}

        <h2 className="mb-6 text-2xl md:text-3xl font-black uppercase tracking-tighter text-black">
          {step === 4 ? 'Đặt hàng thành công' : 'Thanh toán an toàn'}
        </h2>

        {step < 4 && <StepIndicator step={step} />}

        <div className="min-h-[320px]">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="mb-4 text-lg font-black uppercase tracking-wide flex items-center gap-2">
                <Truck size={18} /> Thông tin giao hàng
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Họ" value={shipping.firstName} onChange={(v) => setShipping({ ...shipping, firstName: v })} />
                <Input placeholder="Tên" value={shipping.lastName} onChange={(v) => setShipping({ ...shipping, lastName: v })} />
                <Input placeholder="Email liên hệ" type="email" col2 value={shipping.email} onChange={(v) => setShipping({ ...shipping, email: v })} />
                <Input placeholder="Địa chỉ" col2 value={shipping.address} onChange={(v) => setShipping({ ...shipping, address: v })} />
                <Input placeholder="Thành phố / Tỉnh" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                <Input placeholder="Mã bưu điện" value={shipping.zip} onChange={(v) => setShipping({ ...shipping, zip: v })} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="mb-4 text-lg font-black uppercase tracking-wide flex items-center gap-2">
                <CreditCard size={18} /> Phương thức thanh toán
              </h3>
              <div className="flex flex-col gap-3">
                <PayOption active={payMethod === 'CARD'} onClick={() => setPayMethod('CARD')} icon={<CreditCard size={20} />} title="Thẻ Tín Dụng / Ghi Nợ" desc="Visa, Mastercard, JCB" />
                <PayOption active={payMethod === 'VNPAY'} onClick={() => setPayMethod('VNPAY')} icon={<Wallet size={20} />} title="VNPay QR" desc="Quét QR qua app ngân hàng" />
                <PayOption active={payMethod === 'MOMO'} onClick={() => setPayMethod('MOMO')} icon={<Wallet size={20} />} title="Ví MoMo" desc="Thanh toán qua ví MoMo" />
                <PayOption active={payMethod === 'COD'} onClick={() => setPayMethod('COD')} icon={<Truck size={20} />} title="COD - Thanh toán khi nhận" desc="Phí COD: miễn phí nội thành" />
              </div>

              {payMethod === 'CARD' && (
                <div className="mt-4 grid grid-cols-2 gap-3 p-5 border border-black/10 rounded-2xl bg-white">
                  <input placeholder="Số thẻ (0000 0000 0000 0000)" className="col-span-2 rounded-xl border border-black/10 bg-white p-3.5 outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 font-medium" />
                  <input placeholder="MM/YY" className="rounded-xl border border-black/10 bg-white p-3.5 outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 font-medium" />
                  <input placeholder="CVC" className="rounded-xl border border-black/10 bg-white p-3.5 outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 font-medium" />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="mb-4 text-lg font-black uppercase tracking-wide">Tổng kết đơn hàng</h3>
              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <div className="max-h-48 overflow-y-auto mb-4 border-b border-black/5 pb-4 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-text-secondary font-medium">{item.quantity}× {item.name}</span>
                      <span className="font-bold whitespace-nowrap ml-3">{formatVND(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm">
                  <Row label="Tạm tính" value={formatVND(subtotal)} />
                  <Row label="Thuế VAT (8%)" value={formatVND(tax)} />
                  <Row label="Phí vận chuyển" value={shipFee === 0 ? 'MIỄN PHÍ' : formatVND(shipFee)} highlight={shipFee === 0} />
                  <div className="mt-4 pt-4 border-t border-black/5 flex justify-between text-xl font-black">
                    <span>Tổng tiền</span>
                    <span>{formatVND(total)}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-4 font-medium">
                Bằng việc đặt hàng, bạn đồng ý với <a href="/policy" className="underline font-bold">Điều khoản & Chính sách</a> của Venta.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-500">
              <div className="mb-6 rounded-full bg-primary-neon/20 p-5">
                <CheckCircle2 size={64} className="text-black" />
              </div>
              <h2 className="mb-2 text-3xl md:text-4xl font-black uppercase tracking-tighter">Hoàn tất!</h2>
              <p className="text-text-secondary font-medium mb-2 max-w-sm">Thiết bị của bạn đang được đóng gói và sẽ sớm có mặt tại địa chỉ giao hàng.</p>
              {orderId && (
                <p className="text-xs text-text-secondary font-mono mb-8">Mã đơn: <span className="text-black font-bold">{orderId}</span></p>
              )}
              <button onClick={onClose} className="rounded-2xl bg-black px-10 py-4 font-black text-primary-neon hover:bg-primary-neon hover:text-black transition-colors shadow-lg uppercase tracking-wide">
                Tiếp tục mua sắm
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {step < 4 && (
          <div className="mt-8 flex justify-between border-t border-black/5 pt-6">
            {step > 1 ? (
              <button onClick={handleBack} className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold bg-white border border-black/10 shadow-sm hover:bg-black/5 transition-colors">
                <ArrowLeft size={16} /> Quay lại
              </button>
            ) : <div />}
            <button
              onClick={step === 3 ? handlePlaceOrder : handleNext}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-2xl bg-primary-neon px-8 py-3 font-black text-black shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 uppercase tracking-wide"
            >
              {isLoading ? 'Đang xử lý...' : step === 3 ? 'Đặt hàng' : 'Tiếp tục'}
              {!isLoading && step < 3 && <ChevronRight size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  const labels = ['Giao hàng', 'Thanh toán', 'Xác nhận'];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative px-2">
        <div className="absolute top-5 left-2 right-2 h-[3px] bg-black/5 z-0 rounded-full"></div>
        <div className="absolute top-5 left-2 h-[3px] bg-black z-0 transition-all duration-300 rounded-full" style={{ width: `${((Math.min(step, 3) - 1) / 2) * 95}%` }}></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] transition-all bg-white ${step >= s ? 'border-black text-black' : 'border-black/10 text-text-secondary'} ${step === s ? 'shadow-md scale-110 bg-primary-neon border-black' : ''}`}>
              {step > s ? <Check size={18} /> : <span className="text-sm font-black">{s}</span>}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${step >= s ? 'text-black' : 'text-text-secondary'}`}>{labels[s - 1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ placeholder, type = 'text', col2, value, onChange }: { placeholder: string; type?: string; col2?: boolean; value: string; onChange: (v: string) => void }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${col2 ? 'col-span-2' : 'col-span-1'} rounded-2xl border border-black/10 bg-white p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm font-medium`}
    />
  );
}

function PayOption({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
        active ? 'border-black bg-primary-neon/20 shadow-md' : 'border-black/10 bg-white hover:border-black/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${active ? 'bg-black text-primary-neon' : 'bg-light-bg text-black'}`}>
          {icon}
        </div>
        <div>
          <p className="font-black text-black text-sm">{title}</p>
          <p className="text-xs text-text-secondary font-medium">{desc}</p>
        </div>
      </div>
      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-black bg-white' : 'border-black/20'}`}>
        {active && <div className="h-2.5 w-2.5 rounded-full bg-black"></div>}
      </div>
    </button>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-text-secondary font-medium">
      <span>{label}</span>
      <span className={`${highlight ? 'text-primary-neon bg-black px-2 rounded font-black' : 'text-black font-bold'}`}>{value}</span>
    </div>
  );
}
