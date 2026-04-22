import React, { useState } from 'react';
import { signIn } from '../lib/authClient';

export function LoginModal({ isOpen, onClose, onLoginSuccess }: { isOpen: boolean, onClose: () => void, onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (isReset) {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message || 'Nếu email đã đăng ký, hệ thống sẽ gửi một liên kết.');
      return;
    }

    if (isRegister) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const error = await res.json();
        setMessage(error.error || 'Đăng ký thất bại');
        return;
      }
      setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
      setIsRegister(false);
      return;
    }

    // Login (Credentials)
    try {
        const res = await signIn('credentials', { email, password });
        if (res && res.ok) {
            onLoginSuccess();
            onClose();
        } else {
            setMessage('Thông tin đăng nhập không hợp lệ');
        }
    } catch (e) {
      setMessage('Lỗi kết nối tới máy chủ');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black font-sans text-black tracking-tight uppercase">
            {isReset ? 'Khôi phục mật khẩu' : isRegister ? 'Tạo Tài Khoản' : 'Đăng Nhập'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black border border-black/5 shadow-sm hover:bg-black/5 transition-colors">✕</button>
        </div>

        {message && (
          <div className="mb-4 rounded-xl bg-black px-4 py-3 text-sm font-medium text-primary-neon shadow-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Địa chỉ Email" 
            required 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white/80 p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm"
          />
          {!isReset && (
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white/80 p-3.5 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm"
            />
          )}

          <button type="submit" className="w-full rounded-2xl bg-primary-neon py-3.5 font-bold text-black border border-black/5 hover:brightness-110 shadow-md transition-all hover:-translate-y-0.5 mt-2 uppercase">
            {isReset ? 'Gửi liên kết khôi phục' : isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
          </button>
        </form>

        {!isReset && !isRegister && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="relative flex items-center mb-2">
              <div className="flex-grow border-t border-black/10"></div>
              <span className="mx-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Hoặc tiếp tục với</span>
              <div className="flex-grow border-t border-black/10"></div>
            </div>
            
            <button type="button" onClick={() => signIn('google')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-3 hover:bg-black/5 transition-colors text-black text-sm font-semibold shadow-sm">
               Google
            </button>
            <button onClick={() => signIn('github')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-3 hover:bg-black/5 transition-colors text-black text-sm font-semibold shadow-sm">
               GitHub
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 text-center text-sm font-medium text-text-secondary">
          {!isReset && (
             <button onClick={() => setIsReset(true)} className="hover:text-black">Quên mật khẩu?</button>
          )}
          {isReset ? (
             <button onClick={() => {setIsReset(false); setMessage('');}} className="hover:text-black">Quay lại đăng nhập</button>
          ) : (
            <button onClick={() => {setIsRegister(!isRegister); setMessage('');}} className="hover:text-black">
              {isRegister ? 'Đã có tài khoản? Đăng nhập' : "Chưa có tài khoản? Đăng ký ngay"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
