import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';
import { formatCurrencyVND } from '../utils/format';
import { paymentLabel } from '../utils/orders';

const inputClass =
  'min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-50';

export default function CheckoutPage() {
  const { cart, setCart, loadingCart } = useAuth();
  const [receiverName, setReceiverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    if (loadingCart) return;
    axiosClient
      .get('/cart')
      .then((res) => {
        if (active) setCart(res.data);
      })
      .catch((err) => {
        if (active) setLoadError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadingCart, reloadCount, setCart]);

  const handleCheckout = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      const res = await axiosClient.post('/orders/checkout', {
        receiverName: receiverName.trim(),
        phoneNumber: phoneNumber.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
      });
      setCreatedOrder(res.data);
      setCart({ ...cart, items: [], totalPrice: 0 });
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(
        err.message || 'Chưa đặt được hàng. Hãy kiểm tra giỏ hàng và thử lại.',
      );
      if (err.details && typeof err.details === 'object')
        setFieldErrors(err.details);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const items = cart?.items || [];
  if (createdOrder) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-1 size-7 shrink-0 text-emerald-700"
            aria-hidden="true"
          />
          <div>
            <h1 className="text-3xl font-bold text-[#162c3c]">
              Đã nhận đơn hàng
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Đơn #{createdOrder.id.substring(0, 8).toUpperCase()} đang chờ xác
              nhận.
            </p>
          </div>
        </div>
        <section
          aria-label="Thông tin đơn vừa đặt"
          className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-7"
        >
          <dl className="grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-600">Người nhận</dt>
              <dd className="mt-1 font-semibold">
                {createdOrder.receiverName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-600">Số điện thoại</dt>
              <dd className="mt-1 font-semibold">{createdOrder.phoneNumber}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-600">Địa chỉ giao hàng</dt>
              <dd className="mt-1 break-words">
                {createdOrder.shippingAddress}
              </dd>
            </div>
            <div>
              <dt className="text-slate-600">Thanh toán</dt>
              <dd className="mt-1">
                {paymentLabel(createdOrder.paymentMethod)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-600">Tổng tiền</dt>
              <dd className="mt-1 text-xl font-bold text-[#193d57] tabular-nums">
                {formatCurrencyVND(createdOrder.totalAmount)}
              </dd>
            </div>
          </dl>
          {createdOrder.paymentMethod === 'BANK_TRANSFER' && (
            <p className="rounded-md bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
              Đây là lựa chọn chuyển khoản mô phỏng trong bản demo. Không chuyển
              tiền cho đơn này.
            </p>
          )}
          <ul className="divide-y divide-slate-100 border-t border-slate-200">
            {createdOrder.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between gap-4 py-3 text-sm"
              >
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {formatCurrencyVND(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="inline-flex min-h-11 items-center rounded-md bg-[#193d57] px-4 text-sm font-semibold text-white hover:bg-[#285372]"
          >
            Xem đơn hàng của tôi
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-[#193d57] underline underline-offset-4"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  if (loading || loadingCart)
    return (
      <p
        role="status"
        className="px-4 py-16 text-center text-sm text-slate-600"
      >
        Đang tải giỏ hàng…
      </p>
    );
  if (loadError)
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[#193d57]">
          Chưa tải được giỏ hàng
        </h1>
        <p role="alert" className="text-sm text-slate-600">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => setReloadCount((count) => count + 1)}
          className="min-h-11 cursor-pointer rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold"
        >
          Thử lại
        </button>
      </div>
    );
  if (items.length === 0)
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#193d57]">
          Giỏ hàng đang trống
        </h1>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-md bg-[#193d57] px-4 text-sm font-semibold text-white"
        >
          Xem sản phẩm
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <Link
        to="/cart"
        className="inline-flex min-h-10 items-center gap-2 text-sm text-slate-600 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Về giỏ hàng
      </Link>
      <h1 className="text-3xl font-bold text-[#162c3c] sm:text-4xl">
        Đặt hàng
      </h1>
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p>{error}</p>
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="mt-2 list-inside list-disc">
                {Object.entries(fieldErrors).map(([key, value]) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <form
        onSubmit={handleCheckout}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-8"
      >
        <fieldset
          disabled={submitting}
          className="min-w-0 space-y-6 rounded-lg border border-slate-200 bg-white p-5 sm:p-7"
        >
          <legend className="sr-only">Thông tin nhận hàng và thanh toán</legend>
          <h2 className="text-lg font-bold text-[#162c3c]">
            Thông tin người nhận hàng
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="checkout-name"
                className="block text-sm font-semibold"
              >
                Họ và tên người nhận
              </label>
              <input
                id="checkout-name"
                autoComplete="shipping name"
                required
                maxLength={100}
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className={inputClass}
                aria-invalid={!!fieldErrors.receiverName}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="checkout-phone"
                className="block text-sm font-semibold"
              >
                Số điện thoại
              </label>
              <input
                id="checkout-phone"
                type="tel"
                autoComplete="shipping tel"
                inputMode="tel"
                required
                pattern="0[35789][0-9]{8}"
                title="Số điện thoại Việt Nam gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08 hoặc 09"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={inputClass}
                aria-invalid={!!fieldErrors.phoneNumber}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="checkout-address"
              className="block text-sm font-semibold"
            >
              Địa chỉ giao hàng
            </label>
            <textarea
              id="checkout-address"
              autoComplete="shipping street-address"
              required
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className={inputClass}
              aria-invalid={!!fieldErrors.shippingAddress}
              placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
            />
          </div>
          <fieldset className="space-y-3 border-t border-slate-200 pt-5">
            <legend className="px-0 pt-5 text-sm font-semibold">
              Cách thanh toán
            </legend>
            {[
              [
                'COD',
                'Thanh toán khi nhận hàng',
                'Trả tiền khi nhận được sản phẩm.',
              ],
              [
                'BANK_TRANSFER',
                'Chuyển khoản (mô phỏng)',
                'Dùng để demo lựa chọn thanh toán, không chuyển tiền.',
              ],
            ].map(([value, label, description]) => (
              <label
                key={value}
                className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-md border p-4 ${paymentMethod === value ? 'border-[#193d57] bg-[#f0f5f8]' : 'border-slate-200'}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === value}
                  onChange={() => setPaymentMethod(value)}
                  className="mt-1 accent-[#193d57]"
                />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                    {description}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        </fieldset>
        {/* Order Review */}
        <aside
          aria-labelledby="checkout-summary"
          className="min-w-0 space-y-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-6 lg:sticky lg:top-24"
        >
          <h2
            id="checkout-summary"
            className="text-lg font-bold text-[#162c3c]"
          >
            Đơn hàng của bạn
          </h2>
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <ProductImage
                  imageUrl={item.productImageUrl}
                  alt=""
                  className="size-14 shrink-0 object-contain"
                />
                <div className="min-w-0 text-sm">
                  <p className="font-semibold">{item.productName}</p>
                  <p className="mt-1 text-slate-600 tabular-nums">
                    {item.quantity} × {formatCurrencyVND(item.productPrice)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-semibold">Tổng cộng</span>
            <strong className="text-xl text-[#193d57] tabular-nums">
              {formatCurrencyVND(cart.totalPrice)}
            </strong>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-12 w-full rounded-md bg-[#193d57] px-4 text-sm font-semibold text-white enabled:cursor-pointer enabled:hover:bg-[#285372] disabled:opacity-40"
          >
            {submitting ? 'Đang đặt hàng…' : 'Xác nhận đặt hàng'}
          </button>
        </aside>
      </form>
    </div>
  );
}
