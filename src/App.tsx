import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, Mouse, Keyboard, Headset, Gamepad2, ShoppingBag, Sparkles, ShieldCheck, Truck, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockProducts } from './data/mockProducts';
import { formatVND } from './lib/format';
import { Product } from './types';

const stats = [
  { value: '50+', label: 'Thương hiệu nổi tiếng' },
  { value: '1500+', label: 'Thiết bị Gaming' },
  { value: 'TOP 1', label: 'Phân phối tại VN' },
  { value: '100K+', label: 'Game thủ tin dùng' },
];

const categories = [
  { name: 'Gaming Mouse', icon: <Mouse size={28} />, color: 'bg-black text-white', img: 'https://images.unsplash.com/photo-1521404172825-992a2a0ee1ce?auto=format&fit=crop&q=80&w=800' },
  { name: 'Mechanical Keyboard', icon: <Keyboard size={28} />, color: 'bg-primary-neon text-black', img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800' },
  { name: 'Audio & Headset', icon: <Headset size={28} />, color: 'bg-gray-100 text-black', img: 'https://images.unsplash.com/photo-1618335832729-23fcdce88065?auto=format&fit=crop&q=80&w=800' },
  { name: 'Gaming Console', icon: <Gamepad2 size={28} />, color: 'bg-black text-white', img: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=800' },
];

const benefits = [
  { icon: <Truck size={24} />, title: 'Giao Tốc Hành 2H', desc: 'Nội thành HCM & HN — hỗ trợ COD' },
  { icon: <ShieldCheck size={24} />, title: 'Bảo Hành 24 Tháng', desc: 'Chính hãng 1-1 trong 7 ngày đầu' },
  { icon: <Zap size={24} />, title: 'Test Pro 100%', desc: 'Kiểm tra kỹ trước khi giao' },
];

export default function App() {
  const [featured, setFeatured] = useState<Product[]>(mockProducts.slice(0, 4));

  useEffect(() => {
    fetch('/api/products?limit=4')
      .then((r) => r.json())
      .then((j) => {
        if (j?.data?.length) setFeatured(j.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="font-sans bg-white text-black w-full overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 px-6 md:px-10 py-4 border-b border-black/5 bg-white/70 backdrop-blur-xl flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary-neon flex items-center justify-center text-black">
            <Sparkles size={18} />
          </span>
          VEN<span className="opacity-30">TA</span>
        </Link>
        <div className="hidden md:flex gap-7 font-bold text-sm uppercase tracking-wide">
          <Link to="/" className="hover:text-primary-neon transition-colors">Giới thiệu</Link>
          <Link to="/products" className="hover:text-primary-neon transition-colors">Cửa hàng</Link>
          <Link to="/about" className="hover:text-primary-neon transition-colors">Về chúng tôi</Link>
          <Link to="/contact" className="hover:text-primary-neon transition-colors">Liên hệ</Link>
        </div>
        <Link to="/products" className="flex items-center gap-2 bg-black text-primary-neon px-5 py-2.5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-primary-neon hover:text-black transition-colors shadow-md">
          <ShoppingBag size={14} /> Vào shop
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative w-full min-h-screen flex items-center justify-center p-6 md:p-10 bg-black overflow-hidden pt-32">
        <div className="absolute inset-0 opacity-40 mix-blend-screen bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div className="absolute top-32 left-10 w-72 h-72 bg-primary-neon/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-neon/10 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary-neon/20 border border-primary-neon/40 text-primary-neon px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8"
          >
            <Star size={12} fill="currentColor" /> Top 1 Distributor Vietnam 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl xl:text-9xl font-black text-white uppercase tracking-tighter leading-none mb-6"
          >
            Lịch Sử Mới<br />
            <span className="text-primary-neon">Bắt Đầu Từ Đây</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-lg md:text-2xl font-medium mb-10 max-w-2xl mx-auto"
          >
            Nâng tầm trải nghiệm Gaming với trang thiết bị cao cấp nhất thế giới.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/products" className="inline-flex items-center gap-2 bg-primary-neon text-black font-black uppercase tracking-wider px-10 py-5 text-lg rounded-full hover:scale-105 transition-transform shadow-2xl shadow-primary-neon/20">
              Khám Phá Ngay <ArrowRight size={24} />
            </Link>
            <Link to="/about" className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-bold uppercase tracking-wider px-8 py-5 text-base rounded-full hover:bg-white hover:text-black transition-colors">
              Về Venta
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="bg-black text-white py-10 px-6 border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-neon text-black flex items-center justify-center shrink-0">
                {b.icon}
              </div>
              <div>
                <h4 className="font-black uppercase tracking-wide text-sm mb-1">{b.title}</h4>
                <p className="text-gray-400 text-sm font-medium">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 md:py-28 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter max-w-4xl mx-auto leading-tight mb-16">
          Thương Hiệu <span className="text-primary-neon px-3 bg-black rounded-lg inline-block transform -skew-x-6">Hàng Đầu Tại Việt Nam</span><br />
          Về Phân Phối Thiết Bị Gaming
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary-neon text-black flex items-center justify-center font-black text-2xl md:text-4xl shadow-[0_0_60px_rgba(200,252,49,0.5)] mb-4 hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <p className="font-bold text-sm uppercase tracking-wide max-w-[150px]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-light-bg py-24 px-6 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-2">[ Sản phẩm nổi bật ]</p>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                Hot Trend<br />Tháng Này
              </h2>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 font-black uppercase tracking-widest text-sm hover:text-primary-neon transition-colors">
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="group relative overflow-hidden rounded-3xl bg-white border border-black/5 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="aspect-square mb-4 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center mix-blend-multiply">
                  <img src={p.image} alt={p.name} className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform duration-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{p.category || 'Gaming Gear'}</span>
                <h3 className="font-bold text-black line-clamp-1 mb-2 mt-1">{p.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-black text-lg">{formatVND(p.price)}</span>
                  <span className="w-9 h-9 rounded-xl bg-black text-primary-neon flex items-center justify-center group-hover:bg-primary-neon group-hover:text-black transition-colors">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-6 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-2">[ Danh mục ]</p>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                Dòng Sản Phẩm<br />Chuyên Biệt
              </h2>
            </div>
            <p className="max-w-md text-text-secondary font-medium">
              Bộ sưu tập thiết bị ngoại vi gaming cao cấp, chọn lọc từ những thương hiệu uy tín nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                <Link
                  to="/products"
                  className={`group relative overflow-hidden rounded-3xl min-h-[280px] flex items-end p-8 ${cat.color} block h-full`}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                  <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="relative z-20 w-full flex justify-between items-end">
                    <div>
                      <div className="mb-4 text-white">{cat.icon}</div>
                      <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">{cat.name}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary-neon text-black flex items-center justify-center transform group-hover:translate-x-2 transition-transform">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Showcase */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-2">[ Trải nghiệm thị giác ]</p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12">
          Venta Showcase
        </h2>

        <div className="relative rounded-3xl overflow-hidden aspect-video bg-black group cursor-pointer">
          <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-primary-neon backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl shadow-primary-neon/40">
              <Play fill="black" size={36} className="text-black ml-2" />
            </div>
          </div>
          <h3 className="absolute bottom-10 left-10 text-white text-3xl md:text-5xl font-black tracking-tighter text-left">
            Beyond The<br />Setup
          </h3>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-neon py-24 px-6 text-black text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]"></div>
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter z-10 relative max-w-5xl mx-auto">
          Bản Lĩnh Sáng Tạo<br />Chọn Venta
        </h2>
        <p className="mt-8 mb-10 font-bold max-w-xl mx-auto z-10 relative text-lg">
          Hãy để đam mê tỏa sáng cùng các thiết bị chất lượng hàng đầu. Bắt đầu hành trình mua sắm ngay hôm nay!
        </p>
        <Link to="/products" className="z-10 relative inline-flex items-center gap-3 bg-black text-primary-neon px-12 py-5 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-2xl">
          Vào Cửa Hàng <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-12 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-primary-neon flex items-center justify-center text-black">
                <Sparkles size={18} />
              </span>
              VEN<span className="opacity-50">TA</span>
            </Link>
            <p className="text-sm font-medium max-w-sm leading-relaxed">
              Nhà phân phối thiết bị gaming, cosplay, decor cao cấp số 1 Việt Nam. Đồng hành cùng game thủ chinh phục đỉnh cao.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4 text-sm">Khám phá</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link to="/products" className="hover:text-primary-neon transition-colors">Sản phẩm</Link></li>
              <li><Link to="/about" className="hover:text-primary-neon transition-colors">Về Venta</Link></li>
              <li><Link to="/contact" className="hover:text-primary-neon transition-colors">Liên hệ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4 text-sm">Hỗ trợ</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link to="/policy" className="hover:text-primary-neon transition-colors">Chính sách bảo hành</Link></li>
              <li><Link to="/policy" className="hover:text-primary-neon transition-colors">Đổi trả</Link></li>
              <li><Link to="/contact" className="hover:text-primary-neon transition-colors">CSKH</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row justify-between items-center gap-3">
          <p>© 2026 Venta Vietnam. All rights reserved.</p>
          <p>Made with <span className="text-primary-neon">●</span> for gamers</p>
        </div>
      </footer>
    </div>
  );
}
