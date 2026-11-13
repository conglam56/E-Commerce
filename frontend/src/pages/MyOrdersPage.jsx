import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import ProductImage from '../components/ProductImage';
import { formatCurrencyVND, formatDateTime } from '../utils/format';
import { ORDER_STATUS, paymentLabel } from '../utils/orders';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [confirmId, setConfirmId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [notice, setNotice] = useState('');
  const cancellingRef = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    axiosClient
      .get('/orders/my-orders')
      .then((res) => {
        if (active) setOrders(res.data);
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
  }, [reloadCount]);

  const handleCancelOrder = async (orderId) => {
    if (cancellingRef.current) return;
    cancellingRef.current = true;
    setCancellingId(orderId);
    setError('');
    setNotice('');
    try {
      const res = await axiosClient.put(`/orders/${orderId}/cancel`);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? res.data : order)),
      );
      setConfirmId(null);
      setNotice('Đã hủy đơn hàng.');
    } catch (err) {
      setError(err.message || 'Chưa hủy được đơn hàng. Hãy thử lại.');
    } finally {
      cancellingRef.current = false;
      setCancellingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-5 sm:px-6 sm:py-8">
      <Link
        to="/"
        className="inline-flex min-h-10 items-center gap-2 text-sm text-slate-600 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Tiếp tục mua sắm
      </Link>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold text-[#162c3c] sm:text-4xl">
          Đơn hàng của tôi
        </h1>
        <button
          type="button"
          disabled={loading || cancellingId !== null}
          onClick={() => setReloadCount((count) => count + 1)}
          className="min-h-10 rounded-md px-3 text-sm font-semibold text-[#193d57] underline underline-offset-4 enabled:cursor-pointer disabled:opacity-40"
        >
          Làm mới
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {notice}
        </p>
      )}
      {loading ? (
        <p role="status" className="py-10 text-center text-sm text-slate-600">
          Đang tải đơn hàng…
        </p>
      ) : loadError ? (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
          <p
            role="alert"
            className="flex items-center gap-2 text-sm text-red-800"
          >
            <AlertCircle className="size-4" aria-hidden="true" />
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => setReloadCount((count) => count + 1)}
            className="min-h-11 cursor-pointer text-sm font-semibold text-[#193d57] underline"
          >
            Tải lại đơn hàng
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white px-5 py-14 text-center">
          <h2 className="text-xl font-bold text-[#162c3c]">
            Bạn chưa có đơn hàng nào
          </h2>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-md bg-[#193d57] px-4 text-sm font-semibold text-white"
          >
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        orders.map((order) => {
          const badge = ORDER_STATUS[order.status];
          return (
            <article
              key={order.id}
              aria-label={`Đơn ${order.id.substring(0, 8).toUpperCase()}`}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-[#162c3c]">
                      Đơn #{order.id.substring(0, 8).toUpperCase()}
                    </h2>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <strong className="text-lg text-[#193d57] tabular-nums">
                  {formatCurrencyVND(order.totalAmount)}
                </strong>
              </header>
              {/* Order Items */}
              <ul className="divide-y divide-slate-100 px-4 sm:px-5">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-4">
                    <ProductImage
                      imageUrl={item.productImageUrl}
                      alt=""
                      className="size-14 shrink-0 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="text-sm font-semibold hover:underline"
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-xs text-slate-600">
                        Số lượng {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatCurrencyVND(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <footer className="space-y-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-semibold">Giao đến</dt>
                    <dd className="mt-1 break-words text-slate-600">
                      {order.receiverName} · {order.phoneNumber}
                      <br />
                      {order.shippingAddress}
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Thanh toán</dt>
                    <dd className="text-slate-600">
                      {paymentLabel(order.paymentMethod)}
                    </dd>
                  </div>
                </dl>
                {order.status === 'PENDING' &&
                  (confirmId === order.id ? (
                    <div className="space-y-2 rounded-md border border-slate-200 bg-white p-3">
                      <p className="text-sm font-semibold">
                        Bạn muốn hủy đơn này?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={cancellingId !== null}
                          onClick={() => handleCancelOrder(order.id)}
                          className="min-h-11 rounded-md bg-red-700 px-3 text-sm font-semibold text-white enabled:cursor-pointer disabled:opacity-40"
                        >
                          {cancellingId === order.id
                            ? 'Đang hủy…'
                            : 'Xác nhận hủy đơn'}
                        </button>
                        <button
                          type="button"
                          disabled={cancellingId !== null}
                          onClick={() => setConfirmId(null)}
                          className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-semibold enabled:cursor-pointer"
                        >
                          Giữ đơn hàng
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={cancellingId !== null}
                      onClick={() => setConfirmId(order.id)}
                      className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 enabled:cursor-pointer enabled:hover:bg-slate-100"
                    >
                      Hủy đơn
                    </button>
                  ))}
              </footer>
            </article>
          );
        })
      )}
    </div>
  );
}
