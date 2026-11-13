import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Minus,
  Plus,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';
import { formatCurrencyVND } from '../utils/format';

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, cart, setCart, loadingCart } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const submittingRef = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setProduct(null);
    setFeedback(null);
    setQuantity(1);

    axiosClient
      .get(`/products/${id}`)
      .then((res) => {
        if (active) setProduct(res.data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Không tải được sản phẩm.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, reloadCount]);

  const stock = Number(product?.quantity || 0);
  const outOfStock = stock <= 0;
  const inCart = (cart?.items || [])
    .filter((item) => item.productId === id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const availableQuantity = Math.max(0, stock - inCart);
  const selectedQuantity = Math.min(quantity, availableQuantity);
  const purchaseDisabled = outOfStock || selectedQuantity < 1 || submitting || loadingCart;

  const handleAddToCart = async (buyNow = false) => {
    if (submittingRef.current || purchaseDisabled) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    submittingRef.current = true;
    setFeedback(null);
    setSubmitting(true);
    try {
      const res = await axiosClient.post('/cart/items', {
        productId: product.id,
        quantity: selectedQuantity,
      });
      setCart(res.data);
      if (buyNow) {
        navigate('/cart');
      } else {
        setFeedback({
          type: 'success',
          message: `Đã thêm ${selectedQuantity} sản phẩm vào giỏ hàng.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Không thể thêm sản phẩm. Hãy thử lại.',
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8" role="status">
        <span className="sr-only">Đang tải sản phẩm…</span>
        <div aria-hidden="true" className="grid gap-6 md:grid-cols-2 lg:gap-12">
          <div className="aspect-square rounded-lg border border-slate-200 bg-white" />
          <div className="space-y-5 py-4">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-8 w-3/4 rounded bg-slate-200" />
            <div className="h-7 w-1/2 rounded bg-slate-200" />
            <div className="h-24 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[#193d57]">Chưa tải được sản phẩm</h1>
        <p role="alert" className="text-sm text-slate-600">{error || 'Sản phẩm không tồn tại.'}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setReloadCount((count) => count + 1)}
            className="min-h-11 cursor-pointer rounded-md bg-[#193d57] px-4 text-sm font-semibold text-white hover:bg-[#285372]"
          >
            Thử lại
          </button>
          <Link to="/" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-[#193d57] underline underline-offset-4">
            Về danh mục
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:space-y-7 sm:px-6 sm:py-8 lg:px-8">
      <Link to="/" className="inline-flex min-h-10 items-center gap-2 text-sm text-slate-600 hover:text-[#193d57] hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Danh mục sản phẩm
      </Link>

      <div className="grid items-start gap-6 md:grid-cols-2 lg:gap-14">
        <div className="aspect-4/3 overflow-hidden rounded-lg border border-slate-200 bg-white md:aspect-square">
          <ProductImage
            imageUrl={product.imageUrl}
            alt={product.name}
            className="size-full object-contain p-5 sm:p-10"
          />
        </div>

        <div className="min-w-0 space-y-6 md:py-2">
          <div>
            <p className="mb-2 text-sm text-slate-600">{product.category?.name || 'Thiết bị'}</p>
            <h1 className="text-3xl leading-tight font-bold text-[#162c3c] lg:text-4xl">{product.name}</h1>
            <p className="mt-4 text-2xl font-bold text-[#193d57] tabular-nums sm:text-3xl">
              {formatCurrencyVND(product.price)}
            </p>
            <p className={`mt-2 text-sm ${outOfStock ? 'text-slate-600' : 'text-emerald-800'}`}>
              {outOfStock ? 'Tạm hết hàng' : `Còn ${stock} sản phẩm`}
            </p>
          </div>

          {product.description && (
            <section aria-labelledby="product-description" className="space-y-2 border-y border-slate-200 py-5">
              <h2 id="product-description" className="text-sm font-semibold text-slate-900">Về sản phẩm</h2>
              <p className="max-w-prose text-sm leading-relaxed whitespace-pre-line text-slate-600">
                {product.description}
              </p>
            </section>
          )}

          <div className="space-y-4">
            {!outOfStock && (
              <div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span id="quantity-label" className="text-sm font-semibold text-slate-700">Số lượng</span>
                  <div role="group" aria-labelledby="quantity-label" className="inline-flex items-center overflow-hidden rounded-md border border-slate-300 bg-white">
                    <button
                      type="button"
                      disabled={selectedQuantity <= 1 || submitting || loadingCart}
                      onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))}
                      aria-label="Giảm số lượng"
                      className="inline-flex size-11 items-center justify-center text-[#193d57] enabled:cursor-pointer enabled:hover:bg-slate-100 disabled:opacity-35"
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </button>
                    <output className="min-w-10 text-center text-sm font-semibold text-slate-900 tabular-nums" aria-live="polite">
                      {selectedQuantity}
                    </output>
                    <button
                      type="button"
                      disabled={selectedQuantity >= availableQuantity || submitting || loadingCart}
                      onClick={() => setQuantity(selectedQuantity + 1)}
                      aria-label="Tăng số lượng"
                      className="inline-flex size-11 items-center justify-center text-[#193d57] enabled:cursor-pointer enabled:hover:bg-slate-100 disabled:opacity-35"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {inCart > 0 && (
                  <p className="mt-2 text-sm text-slate-600">
                    Đã có {inCart} trong giỏ.
                    {availableQuantity === 0 && ' Bạn đã chọn hết số lượng còn lại.'}
                  </p>
                )}
              </div>
            )}

            {feedback && (
              <div
                role={feedback.type === 'error' ? 'alert' : 'status'}
                className={`flex items-start gap-2 rounded-md border px-3 py-3 text-sm ${
                  feedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {feedback.message}
                  {feedback.type === 'success' && <Link to="/cart" className="ml-2 font-semibold underline underline-offset-4">Xem giỏ hàng</Link>}
                </span>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2" aria-busy={submitting}>
              <button
                type="button"
                disabled={purchaseDisabled}
                onClick={() => handleAddToCart(false)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#193d57] px-3 text-sm font-semibold text-white enabled:cursor-pointer enabled:hover:bg-[#285372] disabled:opacity-40"
              >
                <ShoppingCart className="size-4" aria-hidden="true" />
                {submitting ? 'Đang thêm…' : 'Thêm vào giỏ hàng'}
              </button>
              <button
                type="button"
                disabled={purchaseDisabled}
                onClick={() => handleAddToCart(true)}
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#193d57] px-3 text-sm font-semibold text-[#193d57] enabled:cursor-pointer enabled:hover:bg-[#eaf0f4] disabled:opacity-40"
              >
                Mua ngay
              </button>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Bạn có thể kiểm tra số lượng và thông tin giao hàng trước khi đặt đơn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
