import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { formatCurrencyVND } from '../utils/format';
import { ORDER_STATUS } from '../utils/orders';

const buttonClass = 'shop-button min-h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold disabled:opacity-40';

export default function AdminDashboardPage() {
  const [report, setReport] = useState(null);
  const [page, setPage] = useState(0);
  const [reloadCount, setReloadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([
      axiosClient.get('/admin/operations'),
      axiosClient.get('/admin/operations/low-stock', { params: { page, size: 20 } }),
    ]).then(([summary, stock]) => {
      if (!active) return;
      if (page > 0 && page >= stock.data.totalPages) {
        setPage(Math.max(0, stock.data.totalPages - 1));
        return;
      }
      setReport({ summary: summary.data, stock: stock.data });
    }).catch(err => {
      if (active) setError(err.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [page, reloadCount]);

  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-bold">Tổng quan cửa hàng</h1>
      <button type="button" className={buttonClass} disabled={loading} onClick={() => setReloadCount(count => count + 1)}>
        Làm mới
      </button>
    </header>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {loading ? <p role="status" className="py-10 text-sm">Đang tải số liệu…</p> : !error && report && <>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="shop-panel space-y-2 rounded-lg border border-slate-200 bg-white p-5">
          <dt className="text-sm text-[var(--text-secondary)]">Doanh thu đơn đã giao</dt>
          <dd className="text-2xl font-semibold tabular-nums">{formatCurrencyVND(report.summary.deliveredRevenue)}</dd>
          <dd className="text-xs text-[var(--text-secondary)]">Tổng giá trị toàn bộ đơn ở trạng thái đã giao.</dd>
        </div>
        <div className="shop-panel space-y-2 rounded-lg border border-slate-200 bg-white p-5">
          <dt className="text-sm text-[var(--text-secondary)]">Đơn đã giao</dt>
          <dd className="text-2xl font-semibold tabular-nums">{report.summary.deliveredOrders}</dd>
        </div>
        <div className="shop-panel space-y-2 rounded-lg border border-slate-200 bg-white p-5">
          <dt className="text-sm text-[var(--text-secondary)]">Sản phẩm sắp hết hàng</dt>
          <dd className="text-2xl font-semibold tabular-nums">{report.summary.lowStockProducts}</dd>
          <dd className="text-xs text-[var(--text-secondary)]">Tồn kho từ {report.summary.lowStockThreshold} trở xuống, gồm cả hết hàng.</dd>
        </div>
      </dl>
      <section className="shop-panel space-y-4 rounded-lg border border-slate-200 bg-white p-5" aria-labelledby="order-count-heading">
        <div className="flex flex-wrap justify-between gap-3">
          <h2 id="order-count-heading" className="text-lg font-semibold">Đơn hàng theo trạng thái</h2>
          <Link to="/admin/orders" className="text-sm underline underline-offset-4">Quản lý đơn hàng</Link>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(ORDER_STATUS).map(([status, definition]) => <div key={status} className="space-y-1">
            <dt className="text-sm text-[var(--text-secondary)]">{definition.label}</dt>
            <dd className="text-xl font-semibold tabular-nums">{report.summary.orderCounts.find(item => item.status === status)?.count || 0}</dd>
          </div>)}
        </dl>
      </section>
      <section className="shop-panel space-y-4 rounded-lg border border-slate-200 bg-white p-5" aria-labelledby="low-stock-heading">
        <div className="flex flex-wrap justify-between gap-3">
          <h2 id="low-stock-heading" className="text-lg font-semibold">Tồn kho cần bổ sung</h2>
          <Link to="/admin/products" className="text-sm underline underline-offset-4">Quản lý sản phẩm</Link>
        </div>
        {report.stock.content.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">Chưa có sản phẩm cần bổ sung tồn kho.</p> :
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-200">
                <th scope="col" className="py-3 pr-4 font-semibold">Sản phẩm</th>
                <th scope="col" className="py-3 text-right font-semibold">Tồn kho</th>
              </tr></thead>
              <tbody>{report.stock.content.map(product => <tr key={product.id} className="border-b border-slate-100">
                <td className="py-3 pr-4"><Link className="underline underline-offset-4" to={'/products/' + product.id}>{product.name}</Link></td>
                <td className="py-3 text-right font-semibold tabular-nums">{product.quantity === 0 ? 'Hết hàng' : product.quantity}</td>
              </tr>)}</tbody>
            </table>
          </div>}
        {report.stock.totalPages > 1 && <nav aria-label="Phân trang tồn kho" className="flex items-center justify-end gap-3">
          <button type="button" className={buttonClass} disabled={page === 0} onClick={() => setPage(value => value - 1)}>Trang trước</button>
          <span className="text-sm">{page + 1} / {report.stock.totalPages}</span>
          <button type="button" className={buttonClass} disabled={page + 1 >= report.stock.totalPages} onClick={() => setPage(value => value + 1)}>Trang sau</button>
        </nav>}
      </section>
    </>}
  </div>;
}
