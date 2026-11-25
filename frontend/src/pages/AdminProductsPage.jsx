import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { formatCurrencyVND } from '../utils/format';

const EMPTY_FORM = {
  name: '',
  quantity: 10,
  price: 10000000,
  description: '',
  imageUrl: '',
  categoryId: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);
  const createButtonRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [prodRes, catRes] = await Promise.all([
        axiosClient.get('/products?page=0&size=100&sortBy=name&sortDir=asc'),
        axiosClient.get('/categories?page=0&size=50'),
      ]);
      setProducts(prodRes?.data?.content || []);
      const catList = catRes?.data?.content || [];
      setCategories(catList);
    } catch (err) {
      setLoadError(err.message || 'Không tải được danh sách sản phẩm.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!modalOpen) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    nameInputRef.current.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      const returnTarget = previousFocus?.isConnected ? previousFocus : createButtonRef.current;
      returnTarget?.focus();
    };
  }, [modalOpen]);

  const openCreateModal = () => {
    setNotice(null);
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id || '',
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setNotice(null);
    setEditingId(product.id);
    setForm({
      name: product.name || '',
      quantity: product.quantity ?? 0,
      price: product.price ?? 0,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      categoryId: product.category?.id || categories[0]?.id || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    const payload = {
      name: form.name.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      categoryId: form.categoryId,
    };

    try {
      if (editingId) {
        await axiosClient.put(`/products/${editingId}`, payload);
        setNotice({ type: 'success', text: 'Đã cập nhật sản phẩm thành công.' });
      } else {
        await axiosClient.post('/products', payload);
        setNotice({ type: 'success', text: 'Đã tạo sản phẩm mới thành công.' });
      }
      await loadData();
      setModalOpen(false);
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Không thể lưu sản phẩm.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Xác nhận xóa sản phẩm "${product.name}"?`)) return;
    try {
      await axiosClient.delete(`/products/${product.id}`);
      setNotice({ type: 'success', text: `Đã xóa "${product.name}".` });
      await loadData();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Không thể xóa sản phẩm.' });
    }
  };

  const handleDialogKeyDown = (event) => {
    if (event.key !== 'Tab') return;
    const controls = dialogRef.current.querySelectorAll('button:enabled, input:enabled, select:enabled, textarea:enabled');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-[var(--text-primary)]">
            Quản trị Sản phẩm & Tồn kho
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Thêm mới, cập nhật giá và điều chỉnh số lượng tồn kho
          </p>
        </div>

        <button
          ref={createButtonRef}
          type="button"
          onClick={openCreateModal}
          disabled={loading || !!loadError || categories.length === 0}
          className="shop-button shop-button-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Thêm sản phẩm mới
        </button>
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

      <div className="shop-panel bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loadError ? (
          <div className="space-y-4 px-5 py-12 text-center">
            <h2 className="text-lg font-semibold">Chưa tải được sản phẩm</h2>
            <p role="alert" className="text-sm text-[var(--text-secondary)]">{loadError}</p>
            <button type="button" onClick={loadData} className="shop-button shop-button-primary">
              Tải lại sản phẩm
            </button>
          </div>
        ) : (
        <>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-[var(--text-secondary)]">
                <th className="py-3.5 px-4">Sản phẩm</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4 text-right">Đơn giá</th>
                <th className="py-3.5 px-4 text-center">Tồn kho</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                    Chưa có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[var(--text-primary)]">{p.name}</div>
                      <div className="text-xs text-[var(--text-secondary)] line-clamp-1">
                        {p.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[var(--text-secondary)] text-xs font-medium">
                        {p.category?.name || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-[var(--text-primary)]">
                      {formatCurrencyVND(p.price)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-mono-num px-2.5 py-1 rounded-md text-xs font-bold ${
                          p.quantity <= 0
                            ? 'bg-red-100 text-red-700'
                            : p.quantity <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.quantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="shop-button shop-button-secondary inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-[var(--text-secondary)] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="shop-button shop-button-danger inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-medium text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-slate-100 md:hidden">
          {loading ? (
            <p role="status" className="px-5 py-10 text-center text-sm text-[var(--text-secondary)]">Đang tải danh sách sản phẩm…</p>
          ) : products.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[var(--text-secondary)]">Chưa có sản phẩm nào.</p>
          ) : products.map((product) => (
            <article key={product.id} aria-label={product.name} className="space-y-4 p-5">
              <div className="space-y-1">
                <p className="text-xs text-[var(--text-secondary)]">{product.category?.name || 'Chưa có danh mục'}</p>
                <h2 className="font-semibold text-[var(--text-primary)]">{product.name}</h2>
                <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">{product.description}</p>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-[var(--text-secondary)]">Đơn giá</dt><dd className="mt-1 font-semibold tabular-nums">{formatCurrencyVND(product.price)}</dd></div>
                <div><dt className="text-xs text-[var(--text-secondary)]">Tồn kho</dt><dd className={`mt-1 font-semibold tabular-nums ${product.quantity <= 0 ? 'text-red-700' : product.quantity <= 5 ? 'text-amber-800' : 'text-emerald-800'}`}>{product.quantity} sản phẩm</dd></div>
              </dl>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => openEditModal(product)} aria-label={`Sửa ${product.name}`} className="shop-button shop-button-secondary">
                  <Pencil className="size-4" aria-hidden="true" /> Sửa
                </button>
                <button type="button" onClick={() => handleDelete(product)} aria-label={`Xóa ${product.name}`} className="shop-button shop-button-danger">
                  <Trash2 className="size-4" aria-hidden="true" /> Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <dialog
          ref={dialogRef}
          aria-labelledby="product-dialog-title"
          onKeyDown={handleDialogKeyDown}
          onCancel={(event) => {
            event.preventDefault();
            if (!saving) setModalOpen(false);
          }}
          className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 text-[#1D1D1F] shadow-xl backdrop:bg-black/45 backdrop:backdrop-blur-sm sm:p-6"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 id="product-dialog-title" className="text-lg font-display font-bold text-[var(--text-primary)]">
                {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Đóng biểu mẫu sản phẩm"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-slate-100 disabled:opacity-50 enabled:cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {notice?.type === 'error' && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{notice.text}</p>}
            <form onSubmit={handleSave} className="space-y-4" aria-busy={saving}>
              <fieldset disabled={saving} className="space-y-4">
                <legend className="sr-only">Thông tin sản phẩm</legend>
              <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Tên sản phẩm
                </label>
                <input
                  id="product-name"
                  ref={nameInputRef}
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="shop-field w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-price" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Giá bán (VNĐ)
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    required
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="shop-field w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label htmlFor="product-quantity" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Số lượng tồn kho
                  </label>
                  <input
                    id="product-quantity"
                    type="number"
                    required
                    min={0}
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    className="shop-field w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono-num"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-category" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Danh mục
                  </label>
                  <select
                    id="product-category"
                    required
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({ ...form, categoryId: e.target.value })
                    }
                    className="shop-field w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="product-image" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Ảnh (URL hoặc mã ảnh)
                  </label>
                  <input
                    id="product-image"
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                    placeholder="/catalog/photos/... hoặc https://..."
                    className="shop-field w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="product-description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Mô tả kỹ thuật
                </label>
                <textarea
                  id="product-description"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="shop-field w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="shop-button shop-button-secondary px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-[var(--text-secondary)] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="shop-button shop-button-primary px-5 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold cursor-pointer"
                >
                  {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
              </fieldset>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}

