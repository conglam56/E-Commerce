import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Cpu,
  FileText,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';
import { formatCurrencyVND } from '../utils/format';
import { getProductCatalogDetail } from '../utils/productCatalogDetails';

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, cart, setCart, loadingCart } = useAuth();

  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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
    setActiveImageIndex(0);
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
  const lowStock = stock > 0 && stock <= 5;
  const inCart = (cart?.items || [])
    .filter((item) => item.productId === id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const availableQuantity = Math.max(0, stock - inCart);
  const selectedQuantity = Math.min(quantity, availableQuantity);
  const purchaseDisabled = outOfStock || selectedQuantity < 1 || submitting || loadingCart;

  const catalogDetail = getProductCatalogDetail(product);
  const gallery = catalogDetail?.gallery || [];
  const safeImageIndex = gallery.length > 0 ? Math.min(activeImageIndex, gallery.length - 1) : 0;
  const currentGalleryItem = gallery[safeImageIndex];

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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8" role="status">
        <span className="sr-only">Đang tải sản phẩm…</span>
        <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div className="aspect-4/3 animate-pulse rounded-3xl bg-white" />
          <div className="space-y-4 py-2">
            <div className="h-4 w-24 animate-pulse rounded-full bg-white" />
            <div className="h-10 w-3/4 animate-pulse rounded-2xl bg-white" />
            <div className="h-6 w-2/3 animate-pulse rounded-full bg-white" />
            <div className="h-52 animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="space-y-4 rounded-3xl bg-white p-8 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          <h1 className="text-xl font-bold text-[#1D1D1F]">Chưa tải được sản phẩm</h1>
          <p role="alert" className="text-sm text-[#515154]">
            {error || 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setReloadCount((count) => count + 1)}
              className="min-h-10 cursor-pointer rounded-full bg-[#0066CC] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0055B3] active:scale-[0.97] motion-safe-transform"
            >
              Thử lại
            </button>
            <Link
              to="/"
              className="inline-flex min-h-10 items-center rounded-full bg-[#F5F5F7] px-5 text-sm font-semibold text-[#1D1D1F] transition-colors hover:bg-[#E8E8ED]"
            >
              Về cửa hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 sm:space-y-12 sm:px-6 sm:py-8 lg:px-8">
      {/* Breadcrumb & Back Link */}
      <nav aria-label="Điều hướng phân cấp" className="flex flex-wrap items-center gap-2 text-xs text-[#6E6E73] sm:text-sm">
        <Link
          to="/"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white px-3.5 font-semibold text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#E8E8ED]"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Cửa hàng
        </Link>
        {product.category?.name && (
          <>
            <span aria-hidden="true">/</span>
            <span>{product.category.name}</span>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="truncate font-medium text-[#1D1D1F]">{product.name}</span>
      </nav>

      {/* Top Showcase: Sticky Studio Gallery + Purchase Column */}
      <div className="grid items-start gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        {/* Left: Sticky Multi-Angle Studio Gallery */}
        <div className="min-w-0 lg:sticky lg:top-20">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
            <div className="flex aspect-4/3 items-center justify-center p-6 sm:aspect-[16/12.5] sm:p-10">
              <ProductImage
                key={currentGalleryItem?.url || product.imageUrl}
                imageUrl={currentGalleryItem?.url || product.imageUrl}
                fallbackUrl={product.imageUrl}
                alt={currentGalleryItem?.caption || product.name}
                className="max-h-full max-w-full object-contain transition-opacity duration-300"
              />
            </div>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((safeImageIndex - 1 + gallery.length) % gallery.length)
                  }
                  aria-label="Ảnh trước"
                  className="absolute top-1/2 left-3 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#F5F5F7]/90 text-[#1D1D1F] shadow-xs backdrop-blur-sm transition-colors hover:bg-[#E8E8ED] active:scale-[0.95] motion-safe-transform sm:left-4 sm:size-10"
                >
                  <ChevronLeft className="size-4.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((safeImageIndex + 1) % gallery.length)}
                  aria-label="Ảnh tiếp theo"
                  className="absolute top-1/2 right-3 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#F5F5F7]/90 text-[#1D1D1F] shadow-xs backdrop-blur-sm transition-colors hover:bg-[#E8E8ED] active:scale-[0.95] motion-safe-transform sm:right-4 sm:size-10"
                >
                  <ChevronRight className="size-4.5" aria-hidden="true" />
                </button>
              </>
            )}

            {currentGalleryItem?.caption && (
              <div className="border-t border-black/[0.05] px-4 py-2.5 text-center text-xs text-[#6E6E73] sm:px-6">
                {gallery.length > 1 && (
                  <span className="mr-1.5 font-semibold text-[#1D1D1F] tabular-nums">
                    {safeImageIndex + 1}/{gallery.length} ·
                  </span>
                )}
                {currentGalleryItem.caption}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {gallery.length > 1 && (
            <div
              role="tablist"
              aria-label="Chọn góc nhìn sản phẩm"
              className="no-scrollbar mt-3 flex items-center gap-2.5 overflow-x-auto py-1"
            >
              {gallery.map((item, idx) => {
                const active = idx === safeImageIndex;
                return (
                  <button
                    key={item.url}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Góc nhìn ${idx + 1}: ${item.caption}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex size-17 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-white p-2 transition-all duration-200 sm:size-20 sm:p-2.5 ${
                      active
                        ? 'ring-2 ring-[#0066CC] shadow-xs'
                        : 'opacity-75 ring-1 ring-black/[0.08] hover:opacity-100'
                    }`}
                  >
                    <ProductImage
                      imageUrl={item.url}
                      fallbackUrl={product.imageUrl}
                      alt=""
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Product Identity, Purchase Box & Highlights */}
        <div className="min-w-0 space-y-5 sm:space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#0066CC] sm:text-sm">
              {product.category?.name || 'Thiết bị công nghệ'}
            </p>
            <h1 className="mt-1 text-3xl leading-[1.12] font-extrabold tracking-[-0.03em] text-[#1D1D1F] text-balance sm:text-4xl">
              {product.name}
            </h1>
            {catalogDetail?.tagline && (
              <p className="mt-2.5 text-sm leading-relaxed text-[#515154] sm:text-base">
                {catalogDetail.tagline}
              </p>
            )}

            {/* Quick Spec Chips */}
            {catalogDetail?.quickSpecs?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                {catalogDetail.quickSpecs.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1D1D1F] ring-1 ring-black/[0.07]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Decision Box */}
          <div className="space-y-5 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.035)] sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/[0.06] pb-4">
              <p className="text-2xl font-bold tracking-[-0.02em] text-[#1D1D1F] tabular-nums sm:text-3xl">
                {formatCurrencyVND(product.price)}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
                  outOfStock
                    ? 'bg-[#F5F5F7] text-[#6E6E73]'
                    : lowStock
                      ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
                      : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-1.5 rounded-full ${
                    outOfStock
                      ? 'bg-[#86868B]'
                      : lowStock
                        ? 'bg-amber-600'
                        : 'bg-emerald-600'
                  }`}
                />
                {outOfStock ? 'Tạm hết hàng' : `Còn ${stock} sản phẩm`}
              </span>
            </div>

            {!outOfStock && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label
                    id="quantity-label"
                    htmlFor="product-quantity"
                    className="text-sm font-semibold text-[#1D1D1F]"
                  >
                    Số lượng đặt mua
                  </label>
                  <div
                    role="group"
                    aria-labelledby="quantity-label"
                    className="inline-flex items-center rounded-full bg-[#F5F5F7] p-1"
                  >
                    <button
                      type="button"
                      disabled={selectedQuantity <= 1 || submitting || loadingCart}
                      onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))}
                      aria-label="Giảm số lượng"
                      className="inline-flex size-9 items-center justify-center rounded-full text-[#1D1D1F] transition-colors enabled:cursor-pointer enabled:hover:bg-white enabled:active:scale-[0.95] motion-safe-transform disabled:opacity-35"
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </button>
                    <input
                      id="product-quantity"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max={availableQuantity}
                      step="1"
                      value={quantity === '' ? '' : selectedQuantity}
                      disabled={availableQuantity === 0 || submitting || loadingCart}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (value === '') setQuantity('');
                        else if (Number.isInteger(Number(value))) {
                          setQuantity(Math.min(availableQuantity, Math.max(1, Number(value))));
                        }
                      }}
                      onBlur={() => setQuantity(Math.max(1, selectedQuantity))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') event.currentTarget.blur();
                      }}
                      className="h-9 w-12 min-w-0 bg-transparent text-center text-sm font-semibold text-[#1D1D1F] tabular-nums disabled:opacity-35 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      disabled={selectedQuantity >= availableQuantity || submitting || loadingCart}
                      onClick={() => setQuantity(selectedQuantity + 1)}
                      aria-label="Tăng số lượng"
                      className="inline-flex size-9 items-center justify-center rounded-full text-[#1D1D1F] transition-colors enabled:cursor-pointer enabled:hover:bg-white enabled:active:scale-[0.95] motion-safe-transform disabled:opacity-35"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {inCart > 0 && (
                  <p className="mt-2 text-xs text-[#515154] tabular-nums">
                    Đã có {inCart} sản phẩm trong giỏ.
                    {availableQuantity === 0 && ' Bạn đã chọn hết số lượng tồn kho hiện có.'}
                  </p>
                )}
              </div>
            )}

            {feedback && (
              <div
                role={feedback.type === 'error' ? 'alert' : 'status'}
                className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200'
                    : 'bg-red-50 text-red-800 ring-1 ring-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
                )}
                <span>
                  {feedback.message}
                  {feedback.type === 'success' && (
                    <Link
                      to="/cart"
                      className="ml-2 font-semibold text-[#0066CC] underline underline-offset-4"
                    >
                      Xem giỏ hàng
                    </Link>
                  )}
                </span>
              </div>
            )}

            <div className="grid gap-2.5 sm:grid-cols-2" aria-busy={submitting}>
              <button
                type="button"
                disabled={purchaseDisabled}
                onClick={() => handleAddToCart(true)}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#0066CC] px-5 text-sm font-semibold text-white transition-all duration-200 enabled:cursor-pointer enabled:hover:bg-[#0077ED] enabled:active:scale-[0.97] motion-safe-transform disabled:opacity-40"
              >
                Mua ngay
              </button>
              <button
                type="button"
                disabled={purchaseDisabled}
                onClick={() => handleAddToCart(false)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1D1D1F] px-5 text-sm font-semibold text-white transition-all duration-200 enabled:cursor-pointer enabled:hover:bg-[#333336] enabled:active:scale-[0.97] motion-safe-transform disabled:opacity-40"
              >
                <ShoppingBag className="size-4 shrink-0" aria-hidden="true" />
                {submitting ? 'Đang thêm…' : 'Thêm vào giỏ hàng'}
              </button>
            </div>

            <p className="text-xs leading-relaxed text-[#6E6E73]">
              Bạn có thể rà soát lại số lượng và địa chỉ nhận hàng ở bước thanh toán trước khi xác nhận đơn.
            </p>
          </div>

          {/* Key Highlights */}
          {catalogDetail?.highlights?.length > 0 && (
            <section
              aria-labelledby="highlights-heading"
              className="rounded-3xl bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] sm:p-6"
            >
              <h2 id="highlights-heading" className="text-sm font-bold text-[#1D1D1F] sm:text-base">
                Điểm nổi bật
              </h2>
              <ul className="mt-3.5 space-y-2.5">
                {catalogDetail.highlights.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#515154]">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#E8F2FF] text-[#0066CC]"
                    >
                      <Check className="size-3 stroke-[2.5]" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {/* Bottom Section: Editorial Product Overview + Technical Specifications Table */}
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
        {/* Detailed Description */}
        <section
          aria-labelledby="product-description"
          className="rounded-3xl bg-white p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] sm:p-8"
        >
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="inline-flex size-8 items-center justify-center rounded-xl bg-[#F5F5F7] text-[#1D1D1F]"
            >
              <FileText className="size-4" />
            </span>
            <h2 id="product-description" className="text-lg font-extrabold tracking-[-0.02em] text-[#1D1D1F] sm:text-xl">
              Đặc điểm &amp; Trải nghiệm
            </h2>
          </div>

          <div className="mt-4 space-y-3.5 text-sm leading-relaxed text-[#515154] sm:text-[15px]">
            {catalogDetail?.overview?.length > 0 ? (
              catalogDetail.overview.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
            ) : (
              <p className="whitespace-pre-line">{product.description}</p>
            )}
          </div>
        </section>

        {/* Technical Specifications Table */}
        {catalogDetail?.specs?.length > 0 && (
          <section
            aria-labelledby="tech-specs-heading"
            className="rounded-3xl bg-white p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] sm:p-8"
          >
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-flex size-8 items-center justify-center rounded-xl bg-[#F5F5F7] text-[#1D1D1F]"
              >
                <Cpu className="size-4" />
              </span>
              <h2 id="tech-specs-heading" className="text-lg font-extrabold tracking-[-0.02em] text-[#1D1D1F] sm:text-xl">
                Thông số kỹ thuật
              </h2>
            </div>

            <dl className="mt-4 divide-y divide-black/[0.05] overflow-hidden rounded-2xl border border-black/[0.06]">
              {catalogDetail.specs.map((row, idx) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-1 gap-1 px-4 py-3 text-sm sm:grid-cols-[11.5rem_1fr] sm:gap-4 sm:py-3.5 ${
                    idx % 2 === 0 ? 'bg-[#F5F5F7]/65' : 'bg-white'
                  }`}
                >
                  <dt className="font-semibold text-[#1D1D1F]">{row.label}</dt>
                  <dd className="text-[#515154] tabular-nums">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}
