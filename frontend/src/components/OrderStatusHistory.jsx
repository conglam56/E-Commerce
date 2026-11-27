import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { ORDER_STATUS } from '../utils/orders';
import { formatDateTime } from '../utils/format';

export default function OrderStatusHistory({ orderId }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState(null);
  const [page, setPage] = useState(0);
  const [reloadCount, setReloadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError('');
    axiosClient.get('/admin/orders/' + orderId + '/history', { params: { page, size: 20 } })
      .then(response => { if (active) setHistory(response.data); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, orderId, page, reloadCount]);

  return <details onToggle={event => setOpen(event.currentTarget.open)} className="border-t border-slate-200 pt-3 text-sm">
    <summary className="min-h-11 cursor-pointer py-3 font-semibold">Lịch sử trạng thái</summary>
    {open && <div className="space-y-3" aria-busy={loading}>
      {loading ? <p role="status">Đang tải lịch sử…</p> : error ? <div className="space-y-2">
        <p role="alert" className="text-red-700">{error}</p>
        <button type="button" className="min-h-11 underline" onClick={() => setReloadCount(count => count + 1)}>Thử lại</button>
      </div> : history && <>
        <ol className="space-y-3">{history.content.map(entry => <li key={entry.id} className="space-y-1 border-l-2 border-slate-200 pl-3">
          <p>{entry.baseline ? 'Trạng thái khi bật lịch sử' : entry.fromStatus ? ORDER_STATUS[entry.fromStatus].label : 'Tạo đơn'}
            {' → '}{ORDER_STATUS[entry.toStatus].label}</p>
          <time dateTime={entry.changedAt} className="block text-xs text-[var(--text-secondary)]">{formatDateTime(entry.changedAt)}</time>
        </li>)}</ol>
        {history.content.length === 0 && <p>Chưa có bản ghi.</p>}
        {history.totalPages > 1 && <nav aria-label="Phân trang lịch sử" className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)} className="min-h-11 underline disabled:opacity-40">Mới hơn</button>
          <span>{page + 1} / {history.totalPages}</span>
          <button type="button" disabled={page + 1 >= history.totalPages} onClick={() => setPage(value => value + 1)} className="min-h-11 underline disabled:opacity-40">Cũ hơn</button>
        </nav>}
      </>}
    </div>}
  </details>;
}
