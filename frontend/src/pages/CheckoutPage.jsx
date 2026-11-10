import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Truck,
  QrCode,
  ArrowRight,
  Package,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyVND } from '../utils/format';

export default function CheckoutPage() {
  const { cart, refreshCart } = useAuth();
  const navigate = useNavigate();

  const [receiverName, setReceiverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const items = cart?.items || [];

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await axiosClient.post('/orders/checkout', {
        receiverName: receiverName.trim(),
        phoneNumber: phoneNumber.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
      });
      if (res?.data) {
        setCreatedOrder(res.data);
        await refreshCart();
      }
    } catch (err) {
      setError(err.message || 'Không thể hoàn tất đơn hàng.');
      if (err.details && typeof err.details === 'object') {
        setFieldErrors(err.details);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (createdOrder) {
    const shortCode = createdOrder.id.substring(0, 8).toUpperCase();
    const qrUrl = `https://img.vietqr.io/image/MB-123456789-compact2.png?amount=${Math.round(
      Number(createdOrder.totalAmount || 0)
    )}&addInfo=${encodeURIComponent(`DH ${shortCode}`)}`;

    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono-num uppercase font-bold text-emerald-700">
                ĐẶT HÀNG THÀNH CÔNG • TRẠNG THÁI {createdOrder.status}
              </span>
              <h1 className="text-2xl font-display font-extrabold text-slate-900">
                Mã đơn hàng #{shortCode}
              </h1>
              <p className="text-sm text-slate-600">
                Tồn kho sản phẩm đã được trừ tự động và giỏ hàng đã được làm mới.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Người nhận</span>
              <span className="font-semibold text-slate-900">
                {createdOrder.receiverName} ({createdOrder.phoneNumber})
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Tổng thanh toán</span>
              <span className="font-mono-num font-bold text-blue-600">
                {formatCurrencyVND(createdOrder.totalAmount)}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-slate-500 block">Địa chỉ giao hàng</span>
              <span className="font-medium text-slate-800">
                {createdOrder.shippingAddress}
              </span>
            </div>
          </div>

          {createdOrder.paymentMethod === 'BANK_TRANSFER' && (
            <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-center gap-6">
              <img
                src={qrUrl}
                alt="Mã QR chuyển khoản VietQR MBBank"
                className="w-44 h-44 rounded-lg border border-slate-200 bg-white p-2 object-contain shrink-0"
              />
              <div className="space-y-2 text-sm">
                <div className="inline-flex items-center gap-1.5 text-blue-700 font-bold">
                  <QrCode className="w-4 h-4" aria-hidden="true" />
                  <span>Hướng dẫn chuyển khoản VietQR</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {createdOrder.paymentInstruction}
                </p>
                <p className="text-xs text-slate-500">
                  Quét mã QR bằng ứng dụng ngân hàng để tự động điền số tiền và nội dung chuyển khoản.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/orders"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            >
              <Package className="w-4 h-4" aria-hidden="true" />
              Xem đơn hàng của tôi
            </Link>
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold"
            >
              Tiếp tục mua hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-base font-semibold text-slate-800">
          Giỏ hàng của bạn đang trống, không thể thanh toán.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
        >
          Quay về trang sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-display font-extrabold text-slate-900 mb-6">
        Thanh toán & Đặt hàng
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">{error}</p>
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
                {Object.entries(fieldErrors).map(([k, v]) => (
                  <li key={k}>{v}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={handleCheckout}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
      >
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-display font-bold text-slate-900">
            Thông tin người nhận hàng
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="checkout-name"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Họ và tên người nhận
              </label>
              <input
                id="checkout-name"
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="checkout-phone"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Số điện thoại (10 số VN)
              </label>
              <input
                id="checkout-phone"
                type="tel"
                required
                pattern="^(0[35789])[0-9]{8}$"
                title="Số điện thoại Việt Nam gồm 10 chữ số (bắt đầu bằng 03, 05, 07, 08, 09)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0912345678"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 font-mono-num focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="checkout-address"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Địa chỉ giao hàng chi tiết
            </label>
            <textarea
              id="checkout-address"
              rows={3}
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-2 space-y-3">
            <span className="block text-sm font-semibold text-slate-800">
              Phương thức thanh toán
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === 'COD'
                    ? 'border-blue-600 bg-blue-50/40'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1"
                />
                <div className="text-sm">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    Thanh toán khi nhận hàng (COD)
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kiểm tra nguyên seal trước khi thanh toán tiền mặt
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-blue-600 bg-blue-50/40'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BANK_TRANSFER"
                  checked={paymentMethod === 'BANK_TRANSFER'}
                  onChange={() => setPaymentMethod('BANK_TRANSFER')}
                  className="mt-1"
                />
                <div className="text-sm">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    Chuyển khoản ngân hàng (VietQR)
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sinh mã QR tự động kèm số tiền và nội dung đơn hàng
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Review */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-display font-bold text-slate-900">
            Sản phẩm đặt mua ({items.length})
          </h2>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between gap-2 text-xs"
              >
                <div className="truncate">
                  <p className="font-semibold text-slate-800 truncate">
                    {item.productName}
                  </p>
                  <p className="text-slate-500 font-mono-num">
                    SL: {item.quantity} × {formatCurrencyVND(item.productPrice)}
                  </p>
                </div>
                <span className="font-mono-num font-bold text-slate-900 shrink-0">
                  {formatCurrencyVND(
                    Number(item.productPrice || 0) * Number(item.quantity || 0)
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-700">
              Tổng thanh toán
            </span>
            <span className="font-mono-num text-xl font-extrabold text-blue-600">
              {formatCurrencyVND(cart?.totalPrice)}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            {submitting ? 'Đang xử lý đơn hàng...' : 'Xác nhận đặt hàng'}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Quay lại chỉnh sửa giỏ hàng
          </button>
        </div>
      </form>
    </div>
  );
}
