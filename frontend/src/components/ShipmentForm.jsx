import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function ShipmentForm({ order, onSaved }) {
  const [carrier, setCarrier] = useState(order.shippingCarrier || '');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!['CONFIRMED', 'SHIPPED'].includes(order.status)) return null;

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await axiosClient.put('/admin/orders/' + order.id + '/shipment', { carrier: carrier.trim(), trackingNumber });
      onSaved(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={save} className="space-y-2 border-t border-slate-200 pt-3 text-sm">
    <label className="block space-y-1">
      <span>Hãng vận chuyển</span>
      <input required maxLength={80} value={carrier} onChange={event => setCarrier(event.target.value)}
        className="shop-field min-h-11 w-full rounded-md border border-slate-300 px-3" />
    </label>
    <label className="block space-y-1">
      <span>Mã vận đơn</span>
      <input required maxLength={100} pattern="[A-Za-z0-9_\-]+" value={trackingNumber}
        onChange={event => setTrackingNumber(event.target.value)}
        className="shop-field min-h-11 w-full rounded-md border border-slate-300 px-3" />
    </label>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <button type="submit" disabled={busy}
      className="shop-button min-h-11 rounded-md border border-slate-300 px-3 disabled:opacity-50">
      {busy ? 'Đang lưu…' : 'Lưu vận đơn'}
    </button>
  </form>;
}
