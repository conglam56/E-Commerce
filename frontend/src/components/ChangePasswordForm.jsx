import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';

const fields = [
  { name: 'currentPassword', label: 'Mật khẩu hiện tại', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'Mật khẩu mới', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Xác nhận mật khẩu mới', autoComplete: 'new-password' },
];
const emptyPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' };

function validatePasswords({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  if (!currentPassword.trim()) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';

  if (!newPassword.trim()) {
    errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
  } else if (newPassword.length < 6) {
    errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
  } else if (new TextEncoder().encode(newPassword).length > 72) {
    errors.newPassword = 'Mật khẩu mới vượt quá 72 byte UTF-8.';
  } else if (newPassword === currentPassword) {
    errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
  }

  if (!confirmPassword.trim()) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
  }
  return errors;
}

export default function ChangePasswordForm() {
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const validationErrors = validatePasswords(passwords);

  const markTouched = (name) => setTouched((current) => ({ ...current, [name]: true }));

  const handleChange = ({ target: { name, value } }) => {
    setPasswords((current) => ({ ...current, [name]: value }));
    markTouched(name);
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setSuccess(false);
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
    const firstInvalid = fields.find(({ name }) => validationErrors[name]);
    if (firstInvalid) {
      event.currentTarget.elements.namedItem(firstInvalid.name).focus();
      return;
    }

    setSubmitting(true);
    try {
      await axiosClient.put('/auth/password', passwords);
      setPasswords(emptyPasswords);
      setTouched({});
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="change-password-heading" className="shop-panel rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 id="change-password-heading" className="text-lg font-bold text-[var(--text-primary)]">Đổi mật khẩu</h2>
      <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-4" aria-busy={submitting}>
        {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        {success && <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Đã đổi mật khẩu.</p>}
        {fields.map(({ name, label, autoComplete }) => {
          const id = `change-${name}`;
          const fieldError = touched[name] && validationErrors[name];
          const description = name === 'newPassword' ? `${id}-hint` : undefined;
          return (
            <div key={name}>
              <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
              <input
                id={id}
                name={name}
                type="password"
                autoComplete={autoComplete}
                required
                disabled={submitting}
                value={passwords[name]}
                onChange={handleChange}
                onBlur={() => markTouched(name)}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? `${id}-error` : description}
                className="shop-field min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-focus)] disabled:bg-slate-50 aria-invalid:border-red-600"
              />
              {fieldError ? (
                <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-700">{fieldError}</p>
              ) : description && <p id={description} className="mt-1 text-xs text-[var(--text-secondary)]">Tối thiểu 6 ký tự.</p>}
            </div>
          );
        })}
        <button type="submit" disabled={submitting} className="shop-button shop-button-primary inline-flex min-h-11 items-center rounded-md bg-[var(--accent-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60">
          {submitting ? 'Đang lưu…' : 'Lưu mật khẩu mới'}
        </button>
      </form>
    </section>
  );
}
