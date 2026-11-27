import React, { useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import BrandWordmark from './components/BrandWordmark';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import AccountLinkPage from './pages/AccountLinkPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const footerLink =
  'inline-flex min-h-7 items-center text-xs text-[#515154] transition-colors duration-150 hover:text-[#1D1D1F] hover:underline underline-offset-4';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#F5F5F7] text-[#1D1D1F]">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-[#0066CC] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-white focus:shadow-lg"
          >
            Chuyển đến nội dung chính
          </a>

          <Navbar />

          <main id="main-content" className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<AccountLinkPage key="forgot" />} />
              <Route path="/reset-password" element={<AccountLinkPage key="reset" />} />
              <Route path="/verify-email" element={<ProtectedRoute><AccountLinkPage key="verify" /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <MyOrdersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminProductsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminOrdersPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="mt-16 border-t border-black/[0.08] bg-[#F5F5F7]">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
              <div className="border-b border-black/[0.08] pb-6 text-xs leading-relaxed text-[#6E6E73]">
                Giá hiển thị bằng VNĐ. Tình trạng còn hàng của từng thiết bị được đồng bộ trực tiếp từ hệ thống kho trước khi đặt đơn.
              </div>

              <div className="mt-7 grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-12">
                <div className="space-y-2.5">
                  <div className="text-sm">
                    <BrandWordmark compact />
                  </div>
                  <p className="max-w-sm text-xs leading-relaxed text-[#515154]">
                    Thiết bị công nghệ và phụ kiện chọn lọc cho công việc, sáng tạo và di chuyển mỗi ngày.
                  </p>
                </div>

                <div>
                  <h2 className="text-xs font-semibold text-[#1D1D1F]">Khám phá &amp; Mua sắm</h2>
                  <ul className="mt-2 space-y-1">
                    <li>
                      <Link to="/" className={footerLink}>
                        Tất cả sản phẩm
                      </Link>
                    </li>
                    <li>
                      <Link to="/cart" className={footerLink}>
                        Giỏ hàng
                      </Link>
                    </li>
                    <li>
                      <Link to="/orders" className={footerLink}>
                        Đơn hàng đã đặt
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xs font-semibold text-[#1D1D1F]">Tài khoản</h2>
                  <ul className="mt-2 space-y-1">
                    <li>
                      <Link to="/login" className={footerLink}>
                        Đăng nhập
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className={footerLink}>
                        Tạo tài khoản The Tech Shop
                      </Link>
                    </li>
                    <li>
                      <Link to="/profile" className={footerLink}>
                        Quản lý hồ sơ cá nhân
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2 border-t border-black/[0.08] pt-5 text-xs text-[#6E6E73] sm:flex-row sm:items-center sm:justify-between">
                <span>Bản quyền © {new Date().getFullYear()} The Tech Shop. Bảo lưu mọi quyền.</span>
                <span>Việt Nam</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
