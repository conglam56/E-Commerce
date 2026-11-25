import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AccountAvatar from './AccountAvatar';
import BrandWordmark from './BrandWordmark';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, cartItemCount, logout } = useAuth();
  const navigate = useNavigate();
  const prevCountRef = useRef(cartItemCount);
  const [badgePopping, setBadgePopping] = useState(false);

  useEffect(() => {
    if (cartItemCount > prevCountRef.current) {
      setBadgePopping(true);
      const timer = setTimeout(() => setBadgePopping(false), 360);
      prevCountRef.current = cartItemCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartItemCount;
  }, [cartItemCount]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex min-h-8 shrink-0 items-center rounded-full px-3 text-xs font-medium whitespace-nowrap transition-colors duration-200 active:scale-[0.97] motion-safe-transform sm:text-[13px] ${
      isActive
        ? 'bg-black/[0.07] font-semibold text-[#1D1D1F]'
        : 'text-[#515154] hover:bg-black/[0.04] hover:text-[#1D1D1F]'
    }`;

  return (
    <header className="glass-nav sticky top-0 z-40 border-b border-black/[0.07]">
      <div className="mx-auto flex min-h-12 max-w-7xl flex-wrap items-center justify-between gap-x-2 px-3 sm:min-h-[52px] sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="inline-flex min-h-10 items-center rounded-lg py-1 text-sm transition-opacity hover:opacity-80 sm:text-[15px]"
        >
          <BrandWordmark />
        </Link>

        {/* Primary Navigation */}
        <nav
          className={`no-scrollbar order-last basis-full items-center gap-1 overflow-x-auto border-t border-black/[0.05] py-1.5 lg:order-none lg:mr-auto lg:basis-auto lg:overflow-visible lg:border-0 lg:py-0 ${
            isAuthenticated ? 'flex' : 'hidden lg:flex'
          }`}
          aria-label="Điều hướng chính"
        >
          <NavLink to="/" end className={navLinkClass}>
            Cửa hàng
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
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/cart"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium text-[#1D1D1F] transition-colors duration-200 hover:bg-black/[0.06] active:scale-[0.97] motion-safe-transform sm:min-h-9.5 sm:px-3"
            aria-label={`Giỏ hàng (${cartItemCount} sản phẩm)`}
          >
            <ShoppingBag className="size-4 shrink-0 text-[#1D1D1F]" strokeWidth={1.85} aria-hidden="true" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            <span
              className={`inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold tabular-nums ${
                cartItemCount > 0
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-black/[0.08] text-[#1D1D1F]'
              } ${badgePopping ? 'animate-badge-pop' : ''}`}
            >
              {cartItemCount}
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-1 border-l border-black/[0.08] pl-1.5 sm:gap-1.5 sm:pl-2">
              <NavLink
                to="/profile"
                title="Thông tin cá nhân"
                aria-label={`Thông tin cá nhân của ${user.fullName || user.email}`}
                className="inline-flex min-h-9 min-w-9 items-center justify-center gap-2 rounded-full px-1.5 text-[#1D1D1F] transition-colors duration-200 hover:bg-black/[0.05] active:scale-[0.97] motion-safe-transform aria-[current=page]:bg-black/[0.07] sm:px-2"
              >
                <AccountAvatar user={user} />
                <span className="hidden max-w-36 truncate text-xs font-medium xl:inline">
                  {user.fullName || user.email}
                </span>
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                aria-label="Đăng xuất"
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-[#515154] transition-colors duration-200 hover:bg-black/[0.05] hover:text-[#1D1D1F] active:scale-[0.97] motion-safe-transform sm:text-[13px]"
              >
                <LogOut className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Link
                to="/login"
                className="inline-flex min-h-9 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap text-[#515154] transition-colors duration-200 hover:bg-black/[0.05] hover:text-[#1D1D1F] active:scale-[0.97] motion-safe-transform sm:px-3 sm:text-[13px]"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="inline-flex min-h-8.5 items-center rounded-full bg-[#1D1D1F] px-3 text-xs font-medium whitespace-nowrap text-white transition-colors duration-200 hover:bg-[#333336] active:scale-[0.97] motion-safe-transform sm:min-h-9 sm:px-3.5 sm:text-[13px]"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
