import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';

const statuses = {
  UNPAID: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  EXPIRED: 'Đã hết thời hạn thanh toán',
  REVIEW: 'Cần đối soát thanh toán với cửa hàng',
};

export default function OrderPayment({ order, allowPayment = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (order.paymentMethod !== 'VNPAY') return null;

  async function pay() {
    setBusy(true);
    setError('');
    try {
      const response = await axiosClient.post('/payments/vnpay/' + order.id);
      window.location.assign(response.data);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const awaiting = order.status === 'PENDING' && order.paymentStatus === 'UNPAID';
  return <div className="space-y-2 text-sm">
    <p>{order.status === 'CANCELLED' && order.paymentStatus === 'UNPAID'
      ? 'Chưa thanh toán' : statuses[order.paymentStatus]}</p>
    {awaiting && order.paymentExpiresAt && <p>
      Hạn thanh toán {new Date(order.paymentExpiresAt + 'Z').toLocaleString('vi-VN')}
    </p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {allowPayment && awaiting && <button type="button" disabled={busy} onClick={pay}
      className="shop-button shop-button-primary min-h-11 rounded-md bg-[var(--accent-primary)] px-4 text-white disabled:opacity-50">
      {busy ? 'Đang mở VNPay…' : 'Thanh toán VNPay Sandbox'}
    </button>}
  </div>;
}
