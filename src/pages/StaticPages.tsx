import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent text-text-primary font-sans flex flex-col relative">
      <div className="max-w-3xl mx-auto w-full px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-black mb-8 transition-colors">
          <ArrowLeft size={16} /> Quay lại trang chủ
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-6">Về Venta Vietnam</h1>
        <div className="prose prose-lg text-text-secondary">
          <p className="mb-4">
            Được thành lập vào năm 2024, Venta đã nhanh chóng trở thành điểm đến hàng đầu dành cho các game thủ chuyên nghiệp và những người đam mê công nghệ, cosplay, decor tại Việt Nam.
          </p>
          <p className="mb-4">
            Sứ mệnh của chúng tôi là mang lại những trải nghiệm gaming đỉnh cao nhất thông qua việc cung cấp các thiết bị ngoại vi chất lượng cao, từ bàn phím cơ, chuột gaming cho đến tai nghe độ trễ thấp từ các thương hiệu hàng đầu thế giới.
          </p>
          <p>
            Đội ngũ của Venta đều là những game thủ thực thụ. Vì thế, chúng tôi thấu hiểu từng nhu cầu khắt khe nhất của bạn. Mọi sản phẩm trước khi lên kệ đều được kiểm tra kỹ lưỡng bởi các chuyên gia.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="min-h-screen bg-transparent text-text-primary font-sans flex flex-col relative">
      <div className="max-w-3xl mx-auto w-full px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-black mb-8 transition-colors">
          <ArrowLeft size={16} /> Quay lại trang chủ
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-6">Liên Hệ CSKH</h1>
        <div className="rounded-3xl border border-black/5 bg-white/60 p-8 shadow-xl backdrop-blur-xl">
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Họ và Tên" className="rounded-2xl border border-black/10 bg-white/90 p-4 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm" />
            <input type="email" placeholder="Email của bạn" className="rounded-2xl border border-black/10 bg-white/90 p-4 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm" />
            <textarea placeholder="Nội dung cần hỗ trợ..." rows={5} className="rounded-2xl border border-black/10 bg-white/90 p-4 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm resize-none"></textarea>
            <button className="mt-4 rounded-2xl bg-black px-8 py-4 font-bold text-primary-neon hover:bg-black/80 transition-colors shadow-lg">Gửi Yêu Cầu Hỗ Trợ</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function PolicyPage() {
  return (
    <div className="min-h-screen bg-transparent text-text-primary font-sans flex flex-col relative">
      <div className="max-w-3xl mx-auto w-full px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-black mb-8 transition-colors">
          <ArrowLeft size={16} /> Quay lại trang chủ
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-6">Chính Sách Bán Hàng</h1>
        <div className="prose prose-lg text-text-secondary">
          <h3 className="text-xl font-bold text-black mb-2 mt-8">1. Chính Sách Bảo Hành</h3>
          <p className="mb-4">Tất cả sản phẩm tại Venta đều được bảo hành chính hãng từ 12-24 tháng tùy thuộc vào nhà sản xuất. Hỗ trợ đổi trả 1-1 trong 7 ngày đầu tiên nếu có lỗi do nhà sản xuất phần cứng.</p>
          
          <h3 className="text-xl font-bold text-black mb-2 mt-8">2. Hỗ Trợ Đổi Trả</h3>
          <p className="mb-4">Khách hàng được quyền đổi trả sản phẩm nguyên seal trong vòng 3 ngày kể từ khi nhận hàng. Phí vận chuyển chiều về sẽ do khách hàng tự chi trả.</p>

          <h3 className="text-xl font-bold text-black mb-2 mt-8">3. Bảo Mật Thông Tin</h3>
          <p>Mọi thông tin cá nhân của bạn, bao gồm địa chỉ nhà và chi tiết thanh toán, sẽ được xử lý bảo mật toàn diện qua hệ thống mã hóa SHA-256. Venta cam kết không bán thông tin cho bên thứ 3.</p>
        </div>
      </div>
    </div>
  );
}
