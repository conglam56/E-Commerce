import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';
import { formatCurrencyVND } from '../utils/format';

export default function CartPage() {
  const { cart, setCart, loadingCart } = useAuth();
  const navigate = useNavigate();
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [quantityInputs, setQuantityInputs] = useState({});
  const updatingRef = useRef(false);

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
        if (active) setLoadError(err.message || 'Không tải được giỏ hàng.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadingCart, reloadCount, setCart]);

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (updatingRef.current || !Number.isInteger(newQuantity) || newQuantity < 1) return;
    updatingRef.current = true;
    setError('');
    setNotice('');
    setUpdatingItemId(item.id);
    try {
      const res = await axiosClient.put(`/cart/items/${item.id}`, { quantity: newQuantity });
      setCart(res.data);
      setNotice(`Đã cập nhật ${item.productName} thành ${newQuantity} sản phẩm.`);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật số lượng.');
    } finally {
      updatingRef.current = false;
      setUpdatingItemId(null);
    }
  };

  const handleQuantityCommit = (item, value) => {
    setQuantityInputs((current) => ({ ...current, [item.id]: undefined }));
    const newQuantity = Number(value);
    if (newQuantity !== item.quantity) handleUpdateQuantity(item, newQuantity);
  };

  const handleRemoveItem = async (item) => {
    if (updatingRef.current) return;
    updatingRef.current = true;
    setError('');
    setNotice('');
    setUpdatingItemId(item.id);
    try {
      const res = await axiosClient.delete(`/cart/items/${item.id}`);
      setCart(res.data);
      setNotice(`Đã xóa ${item.productName} khỏi giỏ hàng.`);
    } catch (err) {
      setError(err.message || 'Không thể xóa sản phẩm.');
    } finally {
      updatingRef.current = false;
      setUpdatingItemId(null);
    }
  };

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const busy = updatingItemId !== null;
  const waitingForCart = loading || loadingCart;

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:space-y-7 sm:px-6 sm:py-8 lg:px-8">
      <Link to="/" className="shop-button shop-button-text inline-flex min-h-10 items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Tiếp tục mua sắm
      </Link>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">Giỏ hàng của bạn</h1>
        {!waitingForCart && !loadError && (
          <p className="text-sm text-[var(--text-secondary)] tabular-nums">{itemCount} sản phẩm</p>
        )}
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      <p role="status" className="sr-only">{busy ? 'Đang cập nhật giỏ hàng…' : notice}</p>

      {waitingForCart ? (
        <div role="status" className="shop-panel rounded-lg border border-slate-200 bg-white px-6 py-14 text-center text-sm text-[var(--text-secondary)]">
          Đang tải giỏ hàng…
        </div>
      ) : loadError ? (
        <div className="shop-panel space-y-4 rounded-lg border border-slate-200 bg-white px-5 py-12 text-center">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Chưa tải được giỏ hàng</h2>
          <p role="alert" className="text-sm text-[var(--text-secondary)]">{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadCount((count) => count + 1)}
            className="shop-button shop-button-primary min-h-11 cursor-pointer rounded-md bg-[var(--accent-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            Tải lại giỏ hàng
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="shop-panel space-y-4 rounded-lg border border-slate-200 bg-white px-5 py-14 text-center sm:py-20">
          <ShoppingBag className="mx-auto size-9 text-[var(--text-muted)]" aria-hidden="true" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Giỏ hàng đang trống</h2>
            <p className="text-sm text-[var(--text-secondary)]">Chọn một món bạn cần từ danh mục của The Tech Shop.</p>
          </div>
          <Link
            to="/"
            className="shop-button shop-button-primary inline-flex min-h-11 items-center rounded-md bg-[var(--accent-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-8" aria-busy={busy}>
          {/* Cart Items Table */}
          <section aria-label="Sản phẩm trong giỏ" className="shop-panel min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="hidden grid-cols-[minmax(0,1fr)_8.5rem_9rem] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold text-[var(--text-secondary)] md:grid">
              <span>Sản phẩm</span>
              <span className="text-center">Số lượng</span>
              <span className="text-right">Thành tiền</span>
            </div>
            <ul className="divide-y divide-slate-200">
              {items.map((item) => {
                const subtotal = Number(item.productPrice || 0) * item.quantity;
                const isBusy = updatingItemId === item.id;

                return (
                  <li
                    key={item.id}
                    aria-label={item.productName}
                    className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] gap-x-3 gap-y-3 p-4 sm:gap-x-4 md:grid-cols-[minmax(0,1fr)_8.5rem_9rem] md:items-center md:gap-4 md:p-5"
                  >
                    <div className="col-span-2 grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-center gap-3 sm:gap-4 md:col-span-1 md:grid-cols-[5.5rem_minmax(0,1fr)]">
                      <Link
                        to={`/products/${item.productId}`}
                        className="aspect-square overflow-hidden rounded-md border border-slate-100 bg-white"
                        aria-label={`Xem ${item.productName}`}
                      >
                        <ProductImage imageUrl={item.productImageUrl} alt="" className="size-full object-contain p-1" />
                      </Link>
                      <div className="min-w-0 space-y-1.5">
                        <Link to={`/products/${item.productId}`} className="text-sm leading-snug font-bold text-[var(--text-primary)] hover:underline sm:text-base">
                          {item.productName}
                        </Link>
                        <p className="text-xs text-[var(--text-secondary)] tabular-nums sm:text-sm">
                          Đơn giá {formatCurrencyVND(item.productPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="col-start-2 flex justify-start md:col-start-auto md:justify-center">
                      <div role="group" aria-label={`Số lượng ${item.productName}`} className="inline-flex items-center overflow-hidden rounded-md border border-slate-300">
                        <button
                          type="button"
                          disabled={busy || item.quantity <= 1}
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          aria-label={`Giảm số lượng ${item.productName}`}
                          className="inline-flex size-11 items-center justify-center text-[var(--text-primary)] enabled:cursor-pointer enabled:hover:bg-slate-100 disabled:opacity-35"
                        >
                          <Minus className="size-4" aria-hidden="true" />
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          step="1"
                          aria-label={`Số lượng ${item.productName}`}
                          value={quantityInputs[item.id] ?? item.quantity}
                          disabled={busy}
                          onChange={(event) => setQuantityInputs((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))}
                          onBlur={(event) => handleQuantityCommit(item, event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') event.currentTarget.blur();
                          }}
                          className="h-11 w-10 min-w-0 text-center text-sm font-semibold text-[var(--text-primary)] tabular-nums focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-focus)] disabled:opacity-35 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          aria-label={`Tăng số lượng ${item.productName}`}
                          className="inline-flex size-11 items-center justify-center text-[var(--text-primary)] enabled:cursor-pointer enabled:hover:bg-slate-100 disabled:opacity-35"
                        >
                          <Plus className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="col-start-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 md:col-start-auto md:flex-col md:items-end">
                      <p className="text-base font-bold text-[var(--text-primary)] tabular-nums">{formatCurrencyVND(subtotal)}</p>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleRemoveItem(item)}
                        aria-label={`Xóa ${item.productName}`}
                        className="shop-button shop-button-danger inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-[var(--text-secondary)] enabled:cursor-pointer enabled:hover:bg-red-50 enabled:hover:text-red-800 disabled:opacity-40"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        {isBusy ? 'Đang cập nhật…' : 'Xóa'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Summary Panel */}
          <aside aria-labelledby="cart-summary" className="shop-panel space-y-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 id="cart-summary" className="text-lg font-bold text-[var(--text-primary)]">Tóm tắt giỏ hàng</h2>
            <dl className="space-y-3 border-y border-slate-200 py-4 text-sm">
              <div className="flex items-baseline justify-between gap-3 text-[var(--text-secondary)]">
                <dt>Số lượng</dt>
                <dd className="font-medium text-[var(--text-primary)] tabular-nums">{itemCount} sản phẩm</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 text-[var(--text-secondary)]">
                <dt>Tiền hàng</dt>
                <dd className="font-medium text-[var(--text-primary)] tabular-nums">{formatCurrencyVND(cart?.totalPrice)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 text-[var(--text-secondary)]">
                <dt>Phí vận chuyển</dt>
                <dd className="font-medium text-[var(--text-primary)]">Miễn phí</dd>
              </div>
            </dl>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-[var(--text-secondary)]">Tổng cộng</span>
              <strong className="text-xl text-[var(--text-primary)] tabular-nums">{formatCurrencyVND(cart?.totalPrice)}</strong>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => navigate('/checkout')}
              className="shop-button shop-button-primary inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent-primary)] px-4 text-sm font-semibold text-white enabled:cursor-pointer enabled:hover:bg-[var(--accent-hover)] disabled:opacity-40"
            >
              Tiến hành đặt hàng
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Bạn sẽ nhập địa chỉ giao hàng và chọn cách thanh toán ở bước tiếp theo.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
