import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyVND, resolveProductImage } from '../utils/format';

export default function CartPage() {
  const { cart, setCart, refreshCart, loadingCart } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    setError('');
    setUpdatingItemId(itemId);
    try {
      const res = await axiosClient.put(`/cart/items/${itemId}`, {
        quantity: newQuantity,
      });
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err) {
      setError(err.message || 'Không thể cập nhật số lượng.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setError('');
    setUpdatingItemId(itemId);
    try {
      const res = await axiosClient.delete(`/cart/items/${itemId}`);
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err) {
      setError(err.message || 'Không thể xóa sản phẩm.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const items = cart?.items || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900">
            Giỏ hàng của bạn
          </h1>
          <p className="text-sm text-slate-500">
            Kiểm tra số lượng trước khi tiến hành thanh toán
          </p>
        </div>
        <Link
          to="/"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Tiếp tục mua sắm
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {loadingCart && items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
          Đang tải giỏ hàng...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-display font-bold text-slate-900">
              Giỏ hàng đang trống
            </h2>
            <p className="text-sm text-slate-500">
              Bạn chưa thêm sản phẩm công nghệ nào vào giỏ hàng.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            Khám phá sản phẩm
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Cart Items Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl divide-y divide-slate-200">
            {items.map((item) => {
              const subtotal = Number(item.productPrice || 0) * Number(item.quantity || 0);
              const isBusy = updatingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <Link
                      to={`/products/${item.productId}`}
                      className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0"
                    >
                      <img
                        src={resolveProductImage(null, item.productName)}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="space-y-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-display font-bold text-slate-900 hover:text-blue-600 text-sm sm:text-base"
                      >
                        {item.productName}
                      </Link>
                      <p className="font-mono-num text-xs text-slate-500">
                        Đơn giá: {formatCurrencyVND(item.productPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        aria-label="Giảm số lượng"
                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-l-lg disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <span className="font-mono-num px-3 py-1 text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        aria-label="Tăng số lượng"
                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-r-lg disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="text-right min-w-[115px]">
                      <span className="font-mono-num text-sm font-bold text-slate-900">
                        {formatCurrencyVND(subtotal)}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={`Xóa ${item.productName}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-display font-bold text-slate-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-2.5 text-sm border-t border-b border-slate-100 py-4">
              <div className="flex justify-between text-slate-600">
                <span>Tổng số mặt hàng</span>
                <span className="font-mono-num font-semibold text-slate-900">
                  {items.length} sản phẩm
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-600 font-semibold">Miễn phí</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Tổng thanh toán
              </span>
              <span className="font-mono-num text-xl font-extrabold text-blue-600">
                {formatCurrencyVND(cart?.totalPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Tiến hành đặt hàng
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
