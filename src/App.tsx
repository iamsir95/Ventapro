import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowRight, Play, Gamepad2, Mouse, Keyboard, Headset } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { value: "50+", label: "Thương hiệu nổi tiếng" },
  { value: "1500+", label: "Thiết bị Gaming" },
  { value: "TOP 1", label: "Phân phối tại VN" },
  { value: "100K+", label: "Game thủ tin dùng" },
];

const categories = [
  { name: "Gaming Mouse", icon: <Mouse size={32} />, color: "bg-black text-white", img: "https://images.unsplash.com/photo-1521404172825-992a2a0ee1ce?auto=format&fit=crop&q=80&w=600" },
  { name: "Mechanical Keyboard", icon: <Keyboard size={32} />, color: "bg-primary-neon text-black", img: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600" },
  { name: "Audio & Headset", icon: <Headset size={32} />, color: "bg-gray-100 text-black", img: "https://images.unsplash.com/photo-1618335832729-23fcdce88065?auto=format&fit=crop&q=80&w=600" },
  { name: "Gaming Console", icon: <Gamepad2 size={32} />, color: "bg-black text-white", img: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=600" },
];

export default function App() {
  return (
    <div className="font-sans bg-white text-black w-full overflow-hidden">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <Link to="/" className="text-2xl font-black tracking-tighter">
          VEN<span className="text-primary-neon bg-black px-1 ml-1 rounded">TA</span>
        </Link>
        <div className="hidden md:flex gap-6 font-bold text-sm tracking-wide uppercase">
          <Link to="/" className="hover:text-primary-neon transition-colors">Giới thiệu</Link>
          <Link to="/products" className="hover:text-primary-neon transition-colors">Cửa Hàng</Link>
          <a href="#" className="hover:text-primary-neon transition-colors">Tin tức</a>
          <a href="#" className="hover:text-primary-neon transition-colors">Hỗ trợ</a>
        </div>
        <Link to="/products" className="bg-black text-white px-6 py-2 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-primary-neon hover:text-black transition-colors">
          Cửa Hàng
        </Link>
      </nav>

      {/* Hero Banner */}
      <section className="relative w-full min-h-[60vh] md:min-h-[80vh] flex items-center justify-center p-8 bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-40 mix-blend-screen bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6"
          >
            Lịch Sử Mới <br/>
            <span className="text-primary-neon">Bắt Đầu Từ Đây</span>
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-gray-300 text-lg md:text-2xl font-medium mb-10 max-w-2xl mx-auto"
          >
            Nâng tầm trải nghiệm Gaming với trang thiết bị cao cấp nhất thế giới.
          </motion.p>
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
          >
            <Link to="/products" className="inline-flex items-center gap-2 bg-primary-neon text-black font-black uppercase tracking-wider px-10 py-5 text-lg rounded-full hover:scale-105 transition-transform">
              Khám Phá Ngay <ArrowRight size={24} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section with Floating Yellow Bubbles (like Arena image) */}
      <section className="py-20 md:py-32 px-4 relative max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter max-w-4xl mx-auto leading-tight mb-20">
          Thương Hiệu <span className="text-primary-neon px-2 bg-black rounded-lg inline-block transform -skew-x-6">Hàng Đầu Tại Việt Nam</span> <br/>
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
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary-neon text-black flex items-center justify-center font-black text-2xl md:text-4xl shadow-[0_0_40px_rgba(200,252,49,0.4)] mb-4">
                {stat.value}
              </div>
              <p className="font-bold text-sm uppercase tracking-wide max-w-[150px]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Training Programs / Product Categories equivalent */}
      <section className="bg-gray-50 py-24 px-4 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">[ Danh mục thiết bị ]</p>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                Các Dòng Sản Phẩm <br/> Nổi Bật
              </h2>
            </div>
            <p className="max-w-md text-gray-600 font-medium">
              Khám phá các bộ sưu tập thiết bị ngoại vi chơi game cao cấp được chọn lọc kỹ càng từ những thương hiệu uy tín nhất.
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
                  className={`group relative overflow-hidden rounded-3xl min-h-[300px] flex items-end p-8 ${cat.color} block h-full`}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                  <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="relative z-20 w-full flex justify-between items-end">
                    <div>
                      <div className="mb-4">{cat.icon}</div>
                      <h3 className="text-2xl md:text-3xl font-black tracking-tight">{cat.name}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transform group-hover:translate-x-2 transition-transform">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">[ Trải nghiệm thị giác ]</p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12">
          VENTA SHOWCASE
        </h2>
        
        <div className="relative rounded-3xl overflow-hidden aspect-video bg-black group cursor-pointer">
          <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play fill="white" size={40} className="text-white ml-2" />
            </div>
          </div>
          <h3 className="absolute bottom-10 left-10 text-white text-4xl font-black tracking-tighter">Beyond The <br/> Setup</h3>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="bg-primary-neon py-24 px-4 text-black text-center relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]"></div>
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter z-10 w-full break-words max-w-5xl">
          BẢN LĨNH SÁNG TẠO <br/> CHỌN VENTA
        </h2>
        <p className="mt-8 mb-10 font-bold max-w-xl mx-auto z-10 text-lg">
          Hãy để đam mê tỏa sáng cùng các thiết bị chất lượng hàng đầu. Bắt đầu hành trình mua sắm ngay hôm nay!
        </p>
        <Link to="/products" className="z-10 bg-black text-white px-12 py-5 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-2xl">
          Vào Cửa Hàng
        </Link>
      </section>
      
      {/* Thin Footer */}
      <footer className="bg-black text-gray-400 py-6 px-8 flex flex-col md:flex-row justify-between items-center text-xs font-bold uppercase tracking-widest">
        <p>Copyright © 2026 Venta. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link to="/products" className="hover:text-primary-neon transition-colors">Sản Phẩm</Link>
          <a href="#" className="hover:text-primary-neon transition-colors">Điều khoản</a>
          <a href="#" className="hover:text-primary-neon transition-colors">Chính sách</a>
        </div>
      </footer>
    </div>
  );
}
