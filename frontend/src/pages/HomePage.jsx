import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import ProductImage from '../components/ProductImage';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyVND } from '../utils/format';

const productGrid = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4';
const pageButton =
  'inline-flex min-h-11 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 enabled:cursor-pointer sm:px-3 sm:text-sm';

export default function HomePage() {
  const { isAuthenticated, setCart } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;
    setCategoryError(false);

    axiosClient
      .get('/categories', { params: { size: 50, sortBy: 'name' } })
      .then((res) => {
        if (active) setCategories(res.data.content);
      })
      .catch(() => {
        if (active) setCategoryError(true);
      });

    return () => {
      active = false;
    };
  }, [reloadCount]);

  useEffect(() => {
    const term = searchTerm.trim();
    if (term === keyword) return;

    const timer = setTimeout(() => {
      setKeyword(term);
      setPage(0);
    }, term ? 250 : 0);

    return () => clearTimeout(timer);
  }, [searchTerm, keyword]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setCatalogError(false);

    axiosClient
      .get('/products', {
        params: {
          page,
          size: 12,
          sortBy: 'price',
          sortDir,
          categoryId: selectedCategory || undefined,
          keyword: keyword || undefined,
        },
      })
      .then((res) => {
        if (!active) return;
        const { content, totalElements, totalPages } = res.data;
        setProducts(content);
        setTotalProducts(totalElements);
        setTotalPages(totalPages);
      })
      .catch(() => {
        if (active) setCatalogError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, sortDir, selectedCategory, keyword, reloadCount]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const chooseCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(0);
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
      if (res?.data) setCart(res.data);
      setToast({ type: 'success', message: `Đã thêm ${product.name} vào giỏ hàng.` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Không thể thêm vào giỏ hàng.' });
    } finally {
      setAddingId(null);
    }
  };

  const searching = searchTerm.trim() !== keyword;
  const catalogBusy = loading || searching;

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-5 sm:space-y-10 sm:px-6 sm:py-8 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed inset-x-4 bottom-5 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg sm:right-5 sm:left-auto sm:max-w-sm ${
            toast.type === 'success' ? 'bg-slate-900' : 'bg-red-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />
          ) : (
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          )}
          {toast.message}
        </div>
      )}

      {/* Hero Section */}
      <section className="grid overflow-hidden rounded-xl bg-[#eaf0f4] md:grid-cols-[1.08fr_1fr]">
        <div className="flex flex-col items-start justify-center px-6 py-6 sm:px-10 md:py-10 lg:px-14">
          <h1 className="max-w-lg text-3xl leading-[1.12] font-extrabold text-[#162c3c] sm:text-4xl lg:text-5xl">
            Thiết bị công nghệ cho mỗi ngày
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-700 sm:text-base">
            Laptop, điện thoại và phụ kiện cho bàn làm việc, lớp học và những ngày di chuyển.
          </p>
          <a
            href="#san-pham"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#193d57] px-4 text-sm font-semibold text-white hover:bg-[#285372]"
          >
            Xem sản phẩm
            <ArrowDown className="size-4" aria-hidden="true" />
          </a>
        </div>
        <figure className="relative flex items-center justify-center bg-white">
          <ProductImage
            imageUrl="/catalog/photos/sony-wh-1000xm3.webp"
            alt="Tai nghe Sony WH-1000XM3"
            className="h-40 w-full object-contain p-3 sm:h-60 md:h-80 md:p-6"
          />
          <figcaption className="absolute right-4 bottom-3 rounded bg-[#eaf0f4] px-2 py-1 text-xs font-medium text-slate-700 sm:right-5 sm:bottom-4">
            Sony WH-1000XM3
          </figcaption>
        </figure>
      </section>

      <section id="san-pham" aria-labelledby="catalog-heading" className="scroll-mt-28">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="catalog-heading" className="text-2xl font-bold text-[#162c3c] sm:text-3xl">
            Danh mục sản phẩm
          </h2>
          <p role="status" className="text-sm text-slate-600 tabular-nums">
            {catalogBusy ? 'Đang tải sản phẩm…' : !catalogError && `${totalProducts} sản phẩm`}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div aria-label="Bộ lọc sản phẩm" role="group" className="mt-4 space-y-3 border-y border-slate-200 py-3 sm:mt-5">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[{ id: '', name: 'Tất cả' }, ...categories].map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={selectedCategory === category.id}
                onClick={() => chooseCategory(category.id)}
                className="min-h-10 cursor-pointer rounded-md px-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 aria-pressed:bg-[#e1ecf3] aria-pressed:text-[#153e59] sm:px-3"
              >
                {category.name}
              </button>
            ))}
            {categoryError && (
              <button type="button" onClick={() => setReloadCount((count) => count + 1)} className="cursor-pointer px-3 text-sm text-blue-700 underline">
                Tải lại danh mục
              </button>
            )}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm sản phẩm"
                aria-label="Tìm kiếm sản phẩm"
                className="min-h-11 w-full rounded-md border border-slate-300 bg-white pr-3 pl-9 text-sm text-slate-900"
              />
            </div>
            <select
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value);
                setPage(0);
              }}
              aria-label="Sắp xếp theo giá"
              className="min-h-11 cursor-pointer rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700"
            >
              <option value="asc">Giá từ thấp đến cao</option>
              <option value="desc">Giá từ cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-5" aria-busy={catalogBusy}>
          {catalogBusy ? (
            <div className={productGrid} aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <div className="aspect-4/3 bg-slate-100" />
                  <div className="space-y-3 p-3 sm:p-4">
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                    <div className="h-4 w-4/5 rounded bg-slate-100" />
                    <div className="mt-10 h-6 w-2/3 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : catalogError || products.length === 0 ? (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-white px-5 py-10 text-center">
              <p className="font-semibold text-slate-900">
                {catalogError ? 'Chưa tải được sản phẩm' : 'Không tìm thấy sản phẩm phù hợp'}
              </p>
              <p className="text-sm text-slate-600">
                {catalogError ? 'Thử tải lại danh sách.' : 'Hãy thử từ khóa khác hoặc chọn danh mục khác.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (catalogError) {
                    setReloadCount((count) => count + 1);
                  } else {
                    chooseCategory('');
                    setSearchTerm('');
                    setKeyword('');
                  }
                }}
                className="min-h-10 cursor-pointer px-3 text-sm font-semibold text-blue-700 underline underline-offset-4"
              >
                {catalogError ? 'Tải lại sản phẩm' : 'Đặt lại bộ lọc'}
              </button>
            </div>
          ) : (
            <div className={productGrid}>
              {products.map((product) => {
                const stock = Number(product.quantity || 0);
                const outOfStock = stock <= 0;
                const lowStock = stock > 0 && stock <= 5;
                const adding = addingId === product.id;

                return (
                  <article
                    key={product.id}
                    className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"
                  >
                    <Link to={`/products/${product.id}`} aria-label={product.name} className="group block focus-visible:outline-offset-[-3px]">
                      <div className="aspect-4/3 overflow-hidden border-b border-slate-100 bg-white">
                        <ProductImage
                          imageUrl={product.imageUrl}
                          alt=""
                          loading="lazy"
                          className="size-full object-contain p-2 sm:p-3"
                        />
                      </div>
                      <div className="space-y-1 px-3 pt-3 sm:px-4 sm:pt-4">
                        <p className="text-xs text-slate-600">{product.category?.name || 'Thiết bị'}</p>
                        <h3 className="text-sm leading-snug font-bold text-slate-900 group-hover:underline sm:text-base">
                          {product.name}
                        </h3>
                      </div>
                    </Link>
                    {product.description && (
                      <p className="mx-3 mt-2 mb-3 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:mx-4 sm:text-sm">
                        {product.description}
                      </p>
                    )}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-1.5 px-3 pt-1 pb-3 sm:px-4 sm:pb-4">
                      <div>
                        <p className="text-sm font-extrabold text-[#193d57] tabular-nums sm:text-base">
                          {formatCurrencyVND(product.price)}
                        </p>
                        {(outOfStock || lowStock) && (
                          <p className="text-xs font-medium text-amber-800">
                            {outOfStock ? 'Hết hàng' : `Còn ${stock} sản phẩm`}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={outOfStock || addingId !== null}
                        onClick={() => handleAddToCart(product)}
                        aria-label={adding ? `Đang thêm ${product.name}` : `Thêm ${product.name} vào giỏ hàng`}
                        title={outOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-[#193d57] hover:border-[#193d57] hover:bg-[#eaf0f4] enabled:cursor-pointer disabled:opacity-40"
                      >
                        <ShoppingCart className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!catalogBusy && !catalogError && totalPages > 1 && (
          <nav aria-label="Phân trang sản phẩm" className="mt-6 flex items-center justify-center gap-2">
            <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className={pageButton}>
              <ChevronLeft className="size-4" aria-hidden="true" />
              Trang trước
            </button>
            <span className="px-1 text-xs text-slate-600 tabular-nums sm:px-3 sm:text-sm">
              Trang {page + 1} / {totalPages}
            </span>
            <button type="button" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)} className={pageButton}>
              Trang sau
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
