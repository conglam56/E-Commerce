import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyVND, resolveProductImage } from '../utils/format';

export default function HomePage() {
  const { isAuthenticated, setCart } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    axiosClient
      .get('/categories?size=50')
      .then((res) => {
        setCategories(res?.data?.content || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    axiosClient
      .get(`/products?page=${page}&size=12&sortBy=price&sortDir=${sortDir}`)
      .then((res) => {
        if (!active) return;
        const pageData = res?.data;
        setProducts(pageData?.content || []);
        setTotalPages(Math.max(1, pageData?.totalPages || 1));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, sortDir]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        selectedCategory === 'ALL' || p.category?.id === selectedCategory;
      const matchSearch =
        !searchTerm.trim() ||
        p.name?.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.trim().toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const showNotice = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setAddingId(product.id);
      const res = await axiosClient.post('/cart/items', {
        productId: product.id,
        quantity: 1,
      });
      if (res?.data) {
        setCart(res.data);
      }
      showNotice('success', `Đã thêm "${product.name}" vào giỏ hàng.`);
    } catch (err) {
      showNotice('error', err.message || 'Không thể thêm vào giỏ hàng.');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2.5 text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-red-600 text-white border-red-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white border border-slate-800 p-6 sm:p-10">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-mono-num">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            <span>REAL-TIME INVENTORY • OPTIMISTIC LOCKING @VERSION</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight text-white leading-tight">
            Phần cứng & Thiết bị Công nghệ Hiệu năng Cao
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Hệ thống đồng bộ tồn kho theo thời gian thực. Mọi đơn đặt hàng đều được bảo vệ chống bán vượt (anti-oversell) ở tầng cơ sở dữ liệu.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              Bảo hành chính hãng 12–24 tháng
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" aria-hidden="true" />
              Thanh toán COD hoặc VietQR tức thì
            </span>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section
        aria-label="Bộ lọc sản phẩm"
        className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
      >
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tên máy, dòng chip..."
              aria-label="Tìm kiếm sản phẩm"
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="inline-flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <select
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value);
                setPage(0);
              }}
              aria-label="Sắp xếp theo giá"
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="asc">Giá: Thấp đến Cao</option>
              <option value="desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 animate-pulse"
            >
              <div className="aspect-4/3 rounded-lg bg-slate-200" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <p className="text-base font-semibold text-slate-900">
            Không tìm thấy sản phẩm phù hợp
          </p>
          <p className="text-sm text-slate-500">
            Thử xóa bộ lọc danh mục hoặc tìm với từ khóa khác.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchTerm('');
            }}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const stock = Number(product.quantity || 0);
            const outOfStock = stock <= 0;
            const lowStock = stock > 0 && stock <= 5;

            return (
              <article
                key={product.id}
                className="group bg-white border border-slate-200 hover:border-blue-500/60 rounded-xl overflow-hidden flex flex-col justify-between transition-colors"
              >
                <div>
                  <Link
                    to={`/products/${product.id}`}
                    className="block relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={resolveProductImage(product.imageUrl, product.name)}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium">
                      {product.category?.name || 'Thiết bị'}
                    </span>

                    <span
                      className={`font-mono-num absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        outOfStock
                          ? 'bg-red-600 text-white'
                          : lowStock
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {outOfStock
                        ? 'Hết hàng'
                        : lowStock
                        ? `Chỉ còn ${stock}`
                        : `Kho: ${stock}`}
                    </span>
                  </Link>

                  <div className="p-4 space-y-1.5">
                    <Link
                      to={`/products/${product.id}`}
                      className="block font-display font-bold text-slate-900 group-hover:text-blue-600 text-base line-clamp-1 transition-colors cursor-pointer"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                      {product.description || 'Sản phẩm công nghệ chính hãng.'}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">
                      Giá niêm yết
                    </span>
                    <span className="font-mono-num text-base font-bold text-slate-900">
                      {formatCurrencyVND(product.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={outOfStock || addingId === product.id}
                    onClick={() => handleAddToCart(product)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      outOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
                    {outOfStock
                      ? 'Hết hàng'
                      : addingId === product.id
                      ? 'Đang thêm...'
                      : 'Thêm giỏ'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Trang trước
          </button>
          <span className="font-mono-num text-xs font-semibold text-slate-600 px-3">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 disabled:opacity-40 cursor-pointer"
          >
            Trang tiếp
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
