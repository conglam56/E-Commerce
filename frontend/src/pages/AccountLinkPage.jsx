import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const titles = {
  '/forgot-password': 'Quên mật khẩu',
  '/reset-password': 'Đặt lại mật khẩu',
  '/verify-email': 'Xác minh email',
};

function Field({ label, name, type, autoComplete }) {
  return (
    <label className="block space-y-1 text-sm font-medium">
      <span>{label}</span>
      <input className="shop-field block w-full rounded-lg border p-3" name={name} type={type}
        autoComplete={autoComplete} required minLength={type === 'password' ? 6 : undefined} />
    </label>
  );
}

export default function AccountLinkPage() {
  const { pathname, hash } = useLocation();
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const forgot = pathname === '/forgot-password';
  const reset = pathname === '/reset-password';
  const token = hash.slice(1);
  const missing = !forgot && !token && !message;

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setError('');
    setBusy(true);
    try {
      if (reset && fields.newPassword !== fields.confirmPassword) throw new Error('Mật khẩu xác nhận không khớp.');
      await axiosClient.post('/auth' + pathname, forgot ? fields : { ...fields, token });
      if (reset) logout();
      setMessage(forgot ? 'Nếu địa chỉ này đã được xác minh, bạn sẽ nhận được thư đặt lại mật khẩu.'
        : reset ? 'Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.' : 'Đã xác minh email.');
      if (!forgot) window.history.replaceState(window.history.state, '', pathname);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="shop-panel mx-auto my-10 max-w-md space-y-5 rounded-2xl border bg-white p-6">
      <h1 className="text-2xl font-bold">{titles[pathname]}</h1>
      {missing && <p role="alert">Liên kết thiếu mã. Hãy mở lại liên kết trong thư.</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {message && <p role="status">{message}</p>}
      {!message && !missing && <form onSubmit={submit} className="space-y-4">
        {forgot && <Field label="Email tài khoản" name="email" type="email" autoComplete="email" />}
        {reset && <>
          <Field label="Mật khẩu mới" name="newPassword" type="password" autoComplete="new-password" />
          <Field label="Xác nhận mật khẩu mới" name="confirmPassword" type="password" autoComplete="new-password" />
        </>}
        {!forgot && !reset && <p>Xác nhận địa chỉ {user?.email} cho tài khoản của bạn.</p>}
        <button disabled={busy} className="shop-button shop-button-primary rounded-lg px-4 py-2">
          {busy ? 'Đang xử lý…' : forgot ? 'Gửi liên kết' : titles[pathname]}
        </button>
      </form>}
      <Link className="inline-block underline" to={pathname === '/verify-email' ? '/profile' : '/login'}>
        {pathname === '/verify-email' ? 'Về hồ sơ' : 'Đăng nhập'}
      </Link>
    </section>
  );
}
