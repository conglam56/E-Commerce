import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  PackageCheck,
  AlertCircle,
  CheckCircle2,
  Minus,
  Plus,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyVND, resolveProductImage } from '../utils/format';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, setCart } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res?.data || null);
      })
      .catch((err) => {
        setError(err.message || 'Không tìm thấy sản phẩm.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async (buyNow = false) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setFeedback(null);
    setSubmitting(true);
    try {
      const res = await axiosClient.post('/cart/items', {
        productId: product.id,
        quantity,
      });
      if (res?.data) {
        setCart(res.data);
      }
      if (buyNow) {
        navigate('/cart');
      } else {
        setFeedback({
          type: 'success',
          message: `Đã thêm ${quantity} "${product.name}" vào giỏ hàng.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Số lượng vượt quá tồn kho.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-4/3 bg-slate-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-2/3" />
            <div className="h-8 bg-slate-200 rounded w-1/2" />
            <div className="h-20 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-lg font-semibold text-slate-900">
          {error || 'Sản phẩm không tồn tại'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const stock = Number(product.quantity || 0);
  const outOfStock = stock <= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Danh mục sản phẩm
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={resolveProductImage(product.imageUrl, product.name)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                {product.category?.name || 'Phần cứng'}
              </span>
              <span
                className={`font-mono-num px-2.5 py-1 rounded-md text-xs font-bold ${
                  outOfStock
                    ? 'bg-red-100 text-red-700'
                    : stock <= 5
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {outOfStock ? 'Hết hàng' : `Tồn kho: ${stock} máy`}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
              {product.name}
            </h1>
            <p className="font-mono-num text-2xl sm:text-3xl font-bold text-blue-600">
              {formatCurrencyVND(product.price)}
            </p>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed border-t border-b border-slate-100 py-4">
            {product.description || 'Thiết bị công nghệ chính hãng, nguyên seal.'}
          </p>

          {feedback && (
            <div
              role="alert"
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {!outOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">Số lượng:</span>
              <div className="inline-flex items-center rounded-lg border border-slate-300 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Giảm số lượng"
                  className="p-2 text-slate-700 hover:bg-slate-200 rounded-l-lg cursor-pointer"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <span className="font-mono-num px-4 py-1.5 text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  aria-label="Tăng số lượng"
                  className="p-2 text-slate-700 hover:bg-slate-200 rounded-r-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <span className="text-xs text-slate-500">
                (Tối đa {stock} sản phẩm)
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              disabled={outOfStock || submitting}
              onClick={() => handleAddToCart(false)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              Thêm vào giỏ hàng
            </button>
            <button
              type="button"
              disabled={outOfStock || submitting}
              onClick={() => handleAddToCart(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Mua ngay
            </button>
          </div>

          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
              <span>Kiểm tra tồn kho tự động khi đặt đơn</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Đổi trả trong 15 ngày nếu lỗi phần cứng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
