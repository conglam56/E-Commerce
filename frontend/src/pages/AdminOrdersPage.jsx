import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { formatCurrencyVND, formatDateTime } from '../utils/format';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const query = statusFilter
        ? `/admin/orders?page=0&size=50&status=${statusFilter}`
        : '/admin/orders?page=0&size=50';
      const res = await axiosClient.get(query);
      setOrders(res?.data?.content || []);
    } catch (err) {
      setNotice({
        type: 'error',
        text: err.message || 'Không thể tải danh sách đơn hàng.',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setNotice(null);
    setUpdatingId(orderId);
    try {
      const res = await axiosClient.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (res?.data) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? res.data : o))
        );
        setNotice({
          type: 'success',
          text: `Đã cập nhật đơn #${orderId.substring(0, 8).toUpperCase()} sang trạng thái ${newStatus}.`,
        });
      }
    } catch (err) {
      setNotice({
        type: 'error',
        text: err.message || 'Không thể đổi trạng thái đơn hàng.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900">
            Quản trị Đơn hàng
          </h1>
          <p className="text-sm text-slate-500">
            Xác nhận thanh toán, điều phối vận chuyển và hoàn kho tự động khi hủy đơn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Lọc trạng thái:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-800 cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {notice && (
        <div
          role="alert"
          className={`p-4 rounded-xl border flex items-center gap-2.5 text-sm ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3.5 px-4">Mã đơn</th>
                <th className="py-3.5 px-4">Khách hàng / Địa chỉ</th>
                <th className="py-3.5 px-4">Sản phẩm</th>
                <th className="py-3.5 px-4 text-right">Tổng tiền</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Không có đơn hàng nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isTerminal =
                    order.status === 'DELIVERED' ||
                    order.status === 'CANCELLED';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-mono-num font-bold text-slate-900 block">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDateTime(order.createdAt)}
                        </span>
                        <span className="mt-1 inline-block px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono-num text-slate-700">
                          {order.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="font-semibold text-slate-900">
                          {order.receiverName} ({order.phoneNumber})
                        </div>
                        <div className="text-xs text-slate-500">
                          {order.shippingAddress}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <ul className="space-y-1 text-xs text-slate-700">
                          {(order.items || []).map((item) => (
                            <li key={item.id}>
                              • {item.productName}{' '}
                              <strong className="font-mono-num">
                                ×{item.quantity}
                              </strong>
                            </li>
                          ))}
                        </ul>
                      </td>

                      <td className="py-3.5 px-4 align-top text-right font-mono-num font-bold text-blue-600">
                        {formatCurrencyVND(order.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4 align-top text-center">
                        <select
                          value={order.status}
                          disabled={isTerminal || updatingId === order.id}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          aria-label={`Đổi trạng thái đơn ${order.id}`}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono-num font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
