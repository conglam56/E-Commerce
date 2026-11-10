import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { formatCurrencyVND, formatDateTime } from '../utils/format';

const STATUS_BADGE = {
  PENDING: {
    label: 'Chờ xác nhận',
    cls: 'bg-amber-100 text-amber-800 border-amber-200',
    Icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    cls: 'bg-blue-100 text-blue-800 border-blue-200',
    Icon: CheckCircle2,
  },
  SHIPPED: {
    label: 'Đang giao hàng',
    cls: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Icon: Truck,
  },
  DELIVERED: {
    label: 'Giao thành công',
    cls: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    cls: 'bg-red-100 text-red-800 border-red-200',
    Icon: XCircle,
  },
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    axiosClient
      .get('/orders/my-orders')
      .then((res) => {
        setOrders(res?.data || []);
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải danh sách đơn hàng.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCancelOrder = async (orderId) => {
    setError('');
    setCancellingId(orderId);
    try {
      const res = await axiosClient.put(`/orders/${orderId}/cancel`);
      if (res?.data) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? res.data : o))
        );
      }
    } catch (err) {
      setError(err.message || 'Không thể hủy đơn hàng.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900">
            Đơn hàng của tôi
          </h1>
          <p className="text-sm text-slate-500">
            Theo dõi trạng thái xử lý và lịch sử mua sắm
          </p>
        </div>
        <Link
          to="/"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Mua thêm sản phẩm
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

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
          Đang tải lịch sử đơn hàng...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <Package className="w-6 h-6" aria-hidden="true" />
          </div>
          <p className="text-base font-display font-bold text-slate-900">
            Bạn chưa có đơn hàng nào
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold"
          >
            Bắt đầu mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = STATUS_BADGE[order.status] || STATUS_BADGE.PENDING;
            const StatusIcon = badge.Icon;
            const shortCode = order.id.substring(0, 8).toUpperCase();

            return (
              <article
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono-num text-sm font-bold text-slate-900">
                        Đơn #{shortCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-xs font-semibold ${badge.cls}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Đặt lúc: {formatDateTime(order.createdAt)} • Thanh toán:{' '}
                      <span className="font-semibold text-slate-700">
                        {order.paymentMethod}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">
                        Tổng tiền
                      </span>
                      <span className="font-mono-num text-base font-extrabold text-blue-600">
                        {formatCurrencyVND(order.totalAmount)}
                      </span>
                    </div>

                    {order.status === 'PENDING' && (
                      <button
                        type="button"
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {cancellingId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-slate-100">
                  {(order.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="py-2.5 flex items-center justify-between text-sm"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">
                          {item.productName}
                        </span>
                        <span className="ml-2 font-mono-num text-xs text-slate-500">
                          × {item.quantity}
                        </span>
                      </div>
                      <span className="font-mono-num font-medium text-slate-800">
                        {formatCurrencyVND(
                          Number(item.price || 0) * Number(item.quantity || 0)
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                  <span>
                    Giao tới: <strong>{order.receiverName}</strong> ({order.phoneNumber}) —{' '}
                    {order.shippingAddress}
                  </span>
                  {order.paymentInstruction && (
                    <span className="text-blue-700 font-medium">
                      {order.paymentInstruction}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
