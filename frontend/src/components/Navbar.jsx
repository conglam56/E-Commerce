import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Cpu,
  ShoppingCart,
  Package,
  ShieldCheck,
  LogOut,
  User,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, cartItemCount, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-slate-900 font-display font-extrabold text-lg tracking-tight cursor-pointer"
          >
            <span className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5" aria-hidden="true" />
            </span>
            <span>
              CORE<span className="text-blue-600">.TECH</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Điều hướng chính">
            <NavLink to="/" end className={navLinkClass}>
              <Layers className="w-4 h-4" aria-hidden="true" />
              Sản phẩm
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/orders" className={navLinkClass}>
                <Package className="w-4 h-4" aria-hidden="true" />
                Đơn hàng của tôi
              </NavLink>
            )}

            {isAdmin && (
              <>
                <NavLink to="/admin/products" className={navLinkClass}>
                  <ShieldCheck className="w-4 h-4 text-blue-500" aria-hidden="true" />
                  Quản trị SP
                </NavLink>
                <NavLink to="/admin/orders" className={navLinkClass}>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  Quản trị Đơn
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-medium transition-colors cursor-pointer"
            aria-label={`Giỏ hàng (${cartItemCount} sản phẩm)`}
          >
            <ShoppingCart className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            <span className="font-mono-num inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold rounded-full bg-blue-600 text-white">
              {cartItemCount}
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-medium text-slate-900 truncate max-w-[160px]">
                  {user?.email}
                </span>
                <span
                  className={`text-[10px] font-mono-num font-semibold px-1.5 py-0.5 rounded ${
                    isAdmin
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : 'CUSTOMER'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span className="hidden lg:inline">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" aria-hidden="true" />
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
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
