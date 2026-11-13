import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandWordmark from './BrandWordmark';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, cartItemCount, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex min-h-10 items-center px-2 text-sm font-semibold underline-offset-4 hover:underline sm:px-3 ${
      isActive ? 'text-[#193d57] underline' : 'text-slate-600'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-2 px-4 sm:gap-x-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="inline-flex min-h-14 items-center text-base sm:text-xl"
        >
          <BrandWordmark />
        </Link>

        <nav
          className={`order-last basis-full flex-wrap items-center border-t border-slate-100 lg:order-none lg:mr-auto lg:basis-auto lg:border-0 ${
            isAuthenticated ? 'flex' : 'hidden lg:flex'
          }`}
          aria-label="Điều hướng chính"
        >
          <NavLink to="/" end className={navLinkClass}>
            Sản phẩm
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/orders" className={navLinkClass}>
              Đơn hàng
            </NavLink>
          )}
          {isAdmin && (
            <>
              <NavLink to="/admin/products" className={navLinkClass}>
                Quản lý sản phẩm
              </NavLink>
              <NavLink to="/admin/orders" className={navLinkClass}>
                Quản lý đơn hàng
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/cart"
            className="inline-flex min-h-11 items-center gap-1 rounded-md px-1.5 text-sm font-semibold text-[#193d57] hover:bg-slate-100 sm:gap-2 sm:px-2.5"
            aria-label={`Giỏ hàng (${cartItemCount} sản phẩm)`}
          >
            <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            <span className="inline-flex min-w-4 items-center justify-center rounded bg-[#e1ecf3] px-1 text-xs tabular-nums">
              {cartItemCount}
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
              <span className="hidden max-w-36 truncate text-xs text-slate-600 xl:inline" title={user?.email}>
                {user?.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                aria-label="Đăng xuất"
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center rounded-md px-1.5 text-xs font-semibold whitespace-nowrap text-slate-700 hover:bg-slate-100 sm:px-2.5 sm:text-sm"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="inline-flex min-h-10 items-center rounded-md border border-slate-200 px-2 text-xs font-semibold whitespace-nowrap text-[#193d57] hover:bg-slate-100 sm:px-3 sm:text-sm"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
