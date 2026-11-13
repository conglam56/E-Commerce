import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { formatCurrencyVND, formatDateTime } from '../utils/format';
import { NEXT_ORDER_STATUS, ORDER_STATUS, paymentLabel } from '../utils/orders';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const updatingRef = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    axiosClient
      .get('/admin/orders', {
        params: { page, size: 10, status: statusFilter || undefined },
      })
      .then((res) => {
        if (!active) return;
        if (page > 0 && page >= res.data.totalPages) {
          setPage(Math.max(0, res.data.totalPages - 1));
          return;
        }
        setOrders(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalOrders(res.data.totalElements);
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
  }, [page, statusFilter, reloadCount]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (updatingRef.current) return;
    updatingRef.current = true;
    setNotice(null);
    setUpdatingId(orderId);
    try {
      await axiosClient.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      setNotice({
        type: 'success',
        text: `Đã cập nhật đơn #${orderId.substring(0, 8).toUpperCase()} thành “${ORDER_STATUS[newStatus].label}”.`,
      });
      setReloadCount((count) => count + 1);
    } catch (err) {
      setNotice({
        type: 'error',
        text: err.message || 'Không thể cập nhật đơn hàng.',
      });
    } finally {
      updatingRef.current = false;
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#162c3c]">
            Quản lý đơn hàng
          </h1>
          <p className="mt-2 text-sm text-slate-600">{totalOrders} đơn hàng</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="order-filter"
            className="text-sm font-semibold text-slate-700"
          >
            Trạng thái
          </label>
          <select
            id="order-filter"
            value={statusFilter}
            disabled={updatingId !== null}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(0);
            }}
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {Object.entries(ORDER_STATUS).map(([value, status]) => (
              <option key={value} value={value}>
                {status.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={loading || updatingId !== null}
            onClick={() => setReloadCount((count) => count + 1)}
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-[#193d57] underline enabled:cursor-pointer disabled:opacity-40"
          >
            Làm mới
          </button>
        </div>
      </div>
      {notice && (
        <p
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-2 rounded-md border p-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}
        >
          {notice.type === 'error' ? (
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
          )}
          {notice.text}
        </p>
      )}
      {loading ? (
        <p role="status" className="py-10 text-center text-sm text-slate-600">
          Đang tải đơn hàng…
        </p>
      ) : loadError ? (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
          <p role="alert" className="text-sm text-red-800">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => setReloadCount((count) => count + 1)}
            className="min-h-11 cursor-pointer text-sm font-semibold underline"
          >
            Tải lại đơn hàng
          </button>
        </div>
      ) : orders.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-600">
          Chưa có đơn hàng trong mục này.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              aria-label={`Đơn ${order.id.substring(0, 8).toUpperCase()}`}
              className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_15rem]"
            >
              <div className="min-w-0 space-y-2">
                <h2 className="font-bold text-[#162c3c]">
                  Đơn #{order.id.substring(0, 8).toUpperCase()}
                </h2>
                <p className="text-xs text-slate-600">
                  {formatDateTime(order.createdAt)}
                </p>
                <p className="text-sm font-semibold">
                  {order.receiverName} · {order.phoneNumber}
                </p>
                <p className="break-words text-sm text-slate-600">
                  {order.shippingAddress}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <ul className="space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.productName} × {item.quantity}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-600">
                  {paymentLabel(order.paymentMethod)}
                </p>
                <strong className="block text-lg text-[#193d57] tabular-nums">
                  {formatCurrencyVND(order.totalAmount)}
                </strong>
              </div>
              <div className="space-y-3">
                <span
                  className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${ORDER_STATUS[order.status].className}`}
                >
                  {ORDER_STATUS[order.status].label}
                </span>
                <label htmlFor={`status-${order.id}`} className="sr-only">
                  Cập nhật đơn {order.id.substring(0, 8).toUpperCase()}
                </label>
                <select
                  id={`status-${order.id}`}
                  value={order.status}
                  disabled={
                    updatingId !== null ||
                    NEXT_ORDER_STATUS[order.status].length === 0
                  }
                  onChange={(event) =>
                    handleStatusChange(order.id, event.target.value)
                  }
                  className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-2 text-sm disabled:opacity-50"
                >
                  <option value={order.status}>
                    {updatingId === order.id
                      ? 'Đang cập nhật…'
                      : ORDER_STATUS[order.status].label}
                  </option>
                  {NEXT_ORDER_STATUS[order.status].map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS[status].label}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
          {totalPages > 1 && (
            <nav
              aria-label="Phân trang đơn hàng"
              className="flex items-center justify-center gap-3"
            >
              <button
                type="button"
                disabled={page === 0 || updatingId !== null}
                onClick={() => setPage(page - 1)}
                aria-label="Trang trước"
                className="inline-flex size-11 items-center justify-center rounded-md border border-slate-300 bg-white enabled:cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <span className="text-sm text-slate-600">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page + 1 >= totalPages || updatingId !== null}
                onClick={() => setPage(page + 1)}
                aria-label="Trang sau"
                className="inline-flex size-11 items-center justify-center rounded-md border border-slate-300 bg-white enabled:cursor-pointer disabled:opacity-40"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
