import React from 'react';
import AccountAvatar from '../components/AccountAvatar';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="mx-auto w-full max-w-xl space-y-5 px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Thông tin cá nhân</h1>
      <section aria-label="Hồ sơ tài khoản" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <AccountAvatar user={user} large />
        <dl className="mt-4 divide-y divide-slate-100 text-sm">
          <div className="grid gap-1 py-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <dt className="text-slate-600">Họ và tên</dt>
            <dd className="min-w-0 font-medium break-words text-slate-900">{user.fullName || 'Chưa có thông tin'}</dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <dt className="text-slate-600">Email</dt>
            <dd className="min-w-0 font-medium break-words text-slate-900">{user.email}</dd>
          </div>
          <div className="grid gap-1 py-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <dt className="text-slate-600">Vai trò</dt>
            <dd className="font-medium text-slate-900">{isAdmin ? 'Quản trị viên' : 'Khách hàng'}</dd>
          </div>
        </dl>
      </section>
      <ChangePasswordForm />
    </div>
  );
}
