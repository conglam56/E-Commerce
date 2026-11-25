import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandWordmark from '../components/BrandWordmark';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const validationErrors = {
    fullName: fullName.trim() ? '' : 'Vui lòng nhập họ và tên.',
    email: !email.trim()
      ? 'Vui lòng nhập email.'
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? '' : 'Email không hợp lệ.',
    password: !password.trim()
      ? 'Vui lòng nhập mật khẩu.'
      : password.length < 6 ? 'Mật khẩu phải có ít nhất 6 ký tự.' : '',
    confirmPassword: !confirmPassword.trim()
      ? 'Vui lòng xác nhận mật khẩu.'
      : password !== confirmPassword ? 'Mật khẩu xác nhận không khớp.' : '',
  };

  const handleChange = (field, setValue) => (event) => {
    setValue(event.target.value);
    setTouched((current) => ({ ...current, [field]: true }));
    setError('');
  };

  const handleBlur = (event) => {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    const firstInvalidField = Object.keys(validationErrors).find((field) => validationErrors[field]);
    if (firstInvalidField) {
      e.currentTarget.elements.namedItem(firstInvalidField).focus();
      return;
    }
    setSubmitting(true);
    try {
      await register(fullName.trim(), email.trim(), password, confirmPassword);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Không thể đăng ký tài khoản.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-start justify-center px-4 py-10 sm:py-16">
      <div className="shop-panel w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
        <div className="mb-6 space-y-1.5">
          <BrandWordmark />
          <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">Đăng ký tài khoản</h1>
          <p className="text-sm text-[var(--text-secondary)]">Tạo tài khoản để đặt hàng và xem lại đơn đã mua.</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="reg-fullname"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Họ và tên
            </label>
            <input
              id="reg-fullname"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={handleChange('fullName', setFullName)}
              onBlur={handleBlur}
              aria-invalid={Boolean(touched.fullName && validationErrors.fullName)}
              aria-describedby={touched.fullName && validationErrors.fullName ? 'reg-fullname-error' : undefined}
              placeholder="Nguyễn Văn A"
              className="shop-field w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-focus)] focus:border-transparent"
            />
            {touched.fullName && validationErrors.fullName && (
              <p id="reg-fullname-error" role="alert" className="mt-1.5 text-sm text-red-700">{validationErrors.fullName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Địa chỉ Email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={handleChange('email', setEmail)}
              onBlur={handleBlur}
              aria-invalid={Boolean(touched.email && validationErrors.email)}
              aria-describedby={touched.email && validationErrors.email ? 'reg-email-error' : undefined}
              placeholder="name@example.com"
              className="shop-field w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-focus)] focus:border-transparent"
            />
            {touched.email && validationErrors.email && (
              <p id="reg-email-error" role="alert" className="mt-1.5 text-sm text-red-700">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Mật khẩu
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={handleChange('password', setPassword)}
              onBlur={handleBlur}
              aria-invalid={Boolean(touched.password && validationErrors.password)}
              aria-describedby={touched.password && validationErrors.password ? 'reg-password-error' : undefined}
              placeholder="Tối thiểu 6 ký tự"
              className="shop-field w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-focus)] focus:border-transparent"
            />
            {touched.password && validationErrors.password && (
              <p id="reg-password-error" role="alert" className="mt-1.5 text-sm text-red-700">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-confirm"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Xác nhận mật khẩu
            </label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={handleChange('confirmPassword', setConfirmPassword)}
              onBlur={handleBlur}
              aria-invalid={Boolean(touched.confirmPassword && validationErrors.confirmPassword)}
              aria-describedby={touched.confirmPassword && validationErrors.confirmPassword ? 'reg-confirm-error' : undefined}
              placeholder="Nhập lại mật khẩu"
              className="shop-field w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-focus)] focus:border-transparent"
            />
            {touched.confirmPassword && validationErrors.confirmPassword && (
              <p id="reg-confirm-error" role="alert" className="mt-1.5 text-sm text-red-700">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="shop-button shop-button-primary w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            {submitting ? 'Đang khởi tạo...' : 'Đăng ký ngay'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-hover)]"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

