import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import ProductImage from '../components/ProductImage';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyVND } from '../utils/format';

const SLIDE_DURATION_MS = 5200;

const FLAGSHIP_SLIDES = [
  {
    eyebrow: 'Thiết kế Titan',
    name: 'iPhone 15 Pro Max',
    headline: 'iPhone 15 Pro Max',
    subhead: 'Titan tự nhiên. Nhẹ tênh. Mạnh vượt trội.',
    imageUrl: '/catalog/photos/iphone-15-pro-max.webp',
    alt: 'iPhone 15 Pro Max khung viền Titan',
    categorySlug: 'dien-thoai',
    categoryLabel: 'Điện thoại',
    auraStyle:
      'radial-gradient(circle at 50% 54%, rgba(194, 166, 130, 0.34) 0%, rgba(56, 98, 168, 0.18) 38%, rgba(0, 0, 0, 0) 72%)',
  },
  {
    eyebrow: 'Hiệu năng đồ họa',
    name: 'Asus ROG Strix',
    headline: 'ROG Strix G15',
    subhead: 'Tản nhiệt chuẩn mực. Làm chủ mọi tác vụ nặng.',
    imageUrl: '/catalog/photos/asus-rog-strix-g15.webp',
    alt: 'Laptop gaming Asus ROG Strix G15',
    categorySlug: 'laptop',
    categoryLabel: 'Laptop',
    auraStyle:
      'radial-gradient(circle at 50% 54%, rgba(56, 189, 248, 0.28) 0%, rgba(99, 102, 241, 0.20) 40%, rgba(0, 0, 0, 0) 72%)',
  },
  {
    eyebrow: 'Âm thanh không gian',
    name: 'AirPods Pro 2',
    headline: 'AirPods Pro 2',
    subhead: 'Chống ồn chủ động. Tĩnh lặng chỉ sau một chạm.',
    imageUrl: '/catalog/photos/airpods-pro-2.webp',
    alt: 'Tai nghe không dây Apple AirPods Pro 2 kèm hộp sạc',
    categorySlug: 'tai-nghe',
    categoryLabel: 'Tai nghe',
    auraStyle:
      'radial-gradient(circle at 50% 54%, rgba(125, 211, 252, 0.26) 0%, rgba(52, 211, 153, 0.14) 40%, rgba(0, 0, 0, 0) 72%)',
  },
];

const BENTO_TILES = [
  {
    theme: 'light',
    eyebrow: 'Gọn nhẹ di động',
    name: 'MacBook Air M2',
    subhead: 'Mỏng thanh thoát. Pin bền bỉ suốt ngày dài.',
    imageUrl: '/catalog/photos/macbook-air-m2.webp',
    alt: 'Laptop Apple MacBook Air M2',
    categorySlug: 'laptop',
    categoryLabel: 'Xem dòng Laptop',
  },
  {
    theme: 'dark',
    eyebrow: 'Chuẩn mực bàn làm việc',
    name: 'Logitech MX Master 3S',
    subhead: 'Cuộn từ trường êm tuyệt đối. Chuẩn từng điểm ảnh.',
    imageUrl: '/catalog/photos/logitech-mx-master-3s.webp',
    alt: 'Chuột không dây công thái học Logitech MX Master 3S',
    categorySlug: 'ban-phim-chuot',
    categoryLabel: 'Xem Bàn phím & chuột',
  },
];

const productGrid = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4';
const pageButton =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 enabled:cursor-pointer enabled:hover:bg-[#E8E8ED] enabled:active:scale-[0.97] motion-safe-transform disabled:opacity-40 sm:min-h-11 sm:px-5 sm:text-sm';

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

  // Welcome Stage motion state
  const [slideIndex, setSlideIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [stageInteracting, setStageInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event) => setReducedMotion(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const autoAdvancing = !userPaused && !stageInteracting && !reducedMotion;

  useEffect(() => {
    if (!autoAdvancing) return undefined;
    const timer = setInterval(() => {
      setSlideIndex((current) => (current + 1) % FLAGSHIP_SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [autoAdvancing, slideIndex]);

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

  const scrollToCatalog = () => {
    const section = document.getElementById('san-pham');
    if (section) {
      section.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  const chooseCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(0);
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setKeyword('');
    setPage(0);
  };

  const openProductByName = async (productName) => {
    const inMemory = products.find(
      (item) => item.name.toLocaleLowerCase('vi') === productName.toLocaleLowerCase('vi')
    );
    if (inMemory) {
      navigate(`/products/${inMemory.id}`);
      return;
    }

    try {
      const res = await axiosClient.get('/products', {
        params: { keyword: productName, size: 6 },
      });
      const list = res.data?.content || [];
      const exact =
        list.find((item) => item.name.toLocaleLowerCase('vi') === productName.toLocaleLowerCase('vi')) ||
        list[0];
      if (exact?.id) {
        navigate(`/products/${exact.id}`);
        return;
      }
    } catch {
      // Fallback to filtering catalog below
    }

    setSelectedCategory('');
    setSearchTerm(productName);
    setKeyword(productName);
    setPage(0);
    scrollToCatalog();
  };

  const filterByCategorySlug = (slug, fallbackKeyword) => {
    const matched = categories.find((cat) => cat.slug === slug);
    setSearchTerm('');
    setKeyword('');
    if (matched) {
      setSelectedCategory(matched.id);
    } else {
      setSelectedCategory('');
      setSearchTerm(fallbackKeyword);
      setKeyword(fallbackKeyword);
    }
    setPage(0);
    scrollToCatalog();
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

  const activeSlide = FLAGSHIP_SLIDES[slideIndex];
  const searching = searchTerm.trim() !== keyword;
  const catalogBusy = loading || searching;
  const selectedCategoryObj = categories.find((cat) => cat.id === selectedCategory);
  const hasActiveFilter = Boolean(selectedCategory || keyword);

  return (
    <div>
      {/* Floating Capsule Toast */}
      {toast && (
        <div
          role="status"
          className={`animate-toast-in fixed inset-x-4 bottom-5 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl sm:right-6 sm:left-auto sm:max-w-sm ${
            toast.type === 'success' ? 'bg-[#1D1D1F]/92' : 'bg-red-700/95'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
          ) : (
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="border-b border-black/[0.06] bg-white">
        <form
          role="search"
          aria-label="Tìm nhanh sản phẩm"
          onSubmit={(event) => {
            event.preventDefault();
            setKeyword(searchTerm.trim());
            setPage(0);
            scrollToCatalog();
          }}
          className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8"
        >
          <label htmlFor="quick-search" className="sr-only">Tìm nhanh sản phẩm</label>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#6E6E73]" aria-hidden="true" />
            <input id="quick-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Bạn đang tìm thiết bị nào?" className="min-h-11 w-full rounded-full bg-[#F5F5F7] pr-4 pl-11 text-base text-[#1D1D1F] placeholder:text-[#6E6E73] sm:text-sm" />
          </div>
          <button type="submit" className="shop-button shop-button-primary shrink-0 px-4 sm:px-6">
            <Search className="size-4 sm:hidden" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Tìm sản phẩm</span>
          </button>
        </form>
      </div>

      {/* 1. Full-Bleed OLED Flagship Welcome Stage */}
      <section
        aria-roledescription="carousel"
        aria-label="Sản phẩm tâm điểm"
        onMouseEnter={() => setStageInteracting(true)}
        onMouseLeave={() => setStageInteracting(false)}
        onFocusCapture={() => setStageInteracting(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setStageInteracting(false);
          }
        }}
        className="relative w-full overflow-hidden bg-black text-white"
      >
        {/* Ambient Studio Radial Glow */}
        <div
          aria-hidden="true"
          style={{ background: activeSlide.auraStyle }}
          className="animate-aura pointer-events-none absolute inset-0 transition-opacity duration-700"
        />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pt-10 pb-7 text-center sm:px-6 sm:pt-14 sm:pb-9">
          <div key={`copy-${activeSlide.name}`} className="flex flex-col items-center">
            <p className="animate-hero-copy text-xs font-semibold tracking-wide text-[#A1A1A6] sm:text-sm">
              {activeSlide.eyebrow}
            </p>
            <h1 className="animate-hero-copy mt-1.5 text-3xl leading-[1.08] font-extrabold tracking-[-0.035em] text-white sm:text-5xl lg:text-[3.5rem]">
              {activeSlide.headline}
            </h1>
            <p className="animate-hero-copy-delay mt-2.5 max-w-md text-sm font-medium text-[#F5F5F7]/90 sm:mt-3 sm:max-w-xl sm:text-xl">
              {activeSlide.subhead}
            </p>

            {/* Centered Dual Pill Actions */}
            <div className="animate-hero-cta mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-6">
              <button
                type="button"
                onClick={() => openProductByName(activeSlide.name)}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full bg-[#0066CC] px-5 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#0077ED] active:scale-[0.97] motion-safe-transform sm:min-h-11 sm:px-6 sm:text-sm"
              >
                Mua ngay
              </button>
              <button
                type="button"
                onClick={() => filterByCategorySlug(activeSlide.categorySlug, activeSlide.categoryLabel)}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-[#2997FF]/70 bg-white/[0.03] px-5 text-xs font-semibold text-[#2997FF] transition-all duration-200 hover:border-[#2997FF] hover:bg-[#2997FF] hover:text-white active:scale-[0.97] motion-safe-transform sm:min-h-11 sm:px-6 sm:text-sm"
              >
                Xem dòng {activeSlide.categoryLabel}
              </button>
            </div>
          </div>

          {/* Floating Transparent Hardware Visual */}
          <div
            key={`device-${activeSlide.name}`}
            className="animate-hero-device mt-6 flex h-52 w-full max-w-2xl items-center justify-center sm:mt-8 sm:h-72 lg:h-80"
          >
            <ProductImage
              imageUrl={activeSlide.imageUrl}
              alt={activeSlide.alt}
              className="max-h-full max-w-full object-contain drop-shadow-[0_26px_42px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Timed DotNav + Play/Pause Controls */}
          <div className="mt-5 flex items-center gap-2.5 sm:mt-6">
            <div
              role="group"
              aria-label="Chọn sản phẩm tâm điểm"
              className="inline-flex items-center rounded-full bg-white/[0.11] px-1 ring-1 ring-white/15 backdrop-blur-md"
            >
              {FLAGSHIP_SLIDES.map((slide, index) => {
                const selected = index === slideIndex;
                return (
                  <button
                    key={slide.name}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`Hiển thị ${slide.name}`}
                    onClick={() => setSlideIndex(index)}
                    className="group inline-flex size-11 cursor-pointer items-center justify-center rounded-full"
                  >
                    <span className={`relative h-2 overflow-hidden rounded-full ${selected ? 'w-8 bg-white/30' : 'w-2 bg-white/45 group-hover:bg-white/75'}`}>
                    {selected && autoAdvancing && (
                      <span
                        key={`progress-${slideIndex}-${autoAdvancing}`}
                        className="animate-slide-progress absolute inset-0 rounded-full bg-white"
                      />
                    )}
                    {selected && !autoAdvancing && (
                      <span className="absolute inset-0 rounded-full bg-white" />
                    )}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setUserPaused((paused) => !paused)}
              aria-label={userPaused ? 'Phát chuyển cảnh tự động' : 'Tạm dừng chuyển cảnh tự động'}
              aria-pressed={userPaused}
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/[0.11] text-white/90 ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-white/20 active:scale-[0.95] motion-safe-transform"
            >
              {userPaused || reducedMotion ? (
                <Play className="size-3.5 fill-current" aria-hidden="true" />
              ) : (
                <Pause className="size-3.5 fill-current" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 2. 2-Up Editorial Bento Showcase (Light vs Dark Contrast) */}
      <section aria-label="Bộ đôi thiết bị nổi bật" className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-3.5 sm:pt-3.5">
        <div className="grid gap-3 md:grid-cols-2 sm:gap-3.5">
          {BENTO_TILES.map((tile) => {
            const isDark = tile.theme === 'dark';
            return (
              <div
                key={tile.name}
                className={`group relative flex min-w-0 flex-col items-center justify-between overflow-hidden rounded-3xl px-5 pt-9 pb-6 text-center transition-transform duration-300 sm:px-8 sm:pt-11 sm:pb-8 ${
                  isDark
                    ? 'bg-[#0D1017] text-white'
                    : 'bg-white text-[#1D1D1F]'
                }`}
              >
                {isDark && (
                  <div
                    aria-hidden="true"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 68%, rgba(148, 163, 184, 0.22) 0%, rgba(13, 16, 23, 0) 68%)',
                    }}
                    className="pointer-events-none absolute inset-0"
                  />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <p
                    className={`text-xs font-semibold ${
                      isDark ? 'text-[#A1A1A6]' : 'text-[#6E6E73]'
                    }`}
                  >
                    {tile.eyebrow}
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-balance sm:text-3xl lg:text-[2rem]">
                    {tile.name}
                  </h2>
                  <p
                    className={`mt-1.5 max-w-md text-sm leading-snug text-balance sm:text-base ${
                      isDark ? 'text-[#F5F5F7]/85' : 'text-[#515154]'
                    }`}
                  >
                    {tile.subhead}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => openProductByName(tile.name)}
                      className={`inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full px-4 text-xs font-semibold transition-all duration-200 active:scale-[0.97] motion-safe-transform sm:text-[13px] ${
                        isDark
                          ? 'bg-[#0066CC] text-white hover:bg-[#0077ED]'
                          : 'bg-[#1D1D1F] text-white hover:bg-[#333336]'
                      }`}
                    >
                      Mua ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => filterByCategorySlug(tile.categorySlug, tile.name)}
                      className={`inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full px-4 text-xs font-semibold transition-colors duration-200 active:scale-[0.97] motion-safe-transform sm:text-[13px] ${
                        isDark
                          ? 'border border-white/25 text-white hover:bg-white/10'
                          : 'border border-black/15 text-[#1D1D1F] hover:bg-black/[0.04]'
                      }`}
                    >
                      {tile.categoryLabel}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openProductByName(tile.name)}
                  aria-label={`Xem ${tile.name}`}
                  className="relative z-10 mt-5 flex h-48 w-full max-w-lg cursor-pointer items-center justify-center sm:mt-6 sm:h-60"
                >
                  <ProductImage
                    imageUrl={tile.imageUrl}
                    alt={tile.alt}
                    loading="lazy"
                    className={`max-h-full max-w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] motion-safe-transform ${
                      isDark
                        ? 'drop-shadow-[0_20px_30px_rgba(0,0,0,0.65)]'
                        : 'scale-[1.08] mix-blend-multiply contrast-[1.03] brightness-[1.02]'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Borderless Storefront Catalog (#san-pham) */}
      <section
        id="san-pham"
        aria-labelledby="catalog-heading"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-10 pb-4 sm:px-6 sm:pt-14 lg:px-8"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="catalog-heading"
            className="max-w-2xl text-2xl leading-tight font-extrabold tracking-[-0.03em] text-balance sm:text-3xl"
          >
            <span className="text-[#1D1D1F]">Cửa Hàng.</span>{' '}
            <span className="font-semibold text-[#6E6E73]">
              Chọn thiết bị hợp nhất với công việc của bạn.
            </span>
          </h2>
          <p role="status" className="text-xs font-medium text-[#6E6E73] tabular-nums sm:text-sm">
            {catalogBusy ? 'Đang tải sản phẩm…' : !catalogError && `${totalProducts} sản phẩm`}
          </p>
        </div>

        {/* Sleek Floating Filter & Search Toolbar */}
        <div
          aria-label="Bộ lọc sản phẩm"
          role="group"
          className="mt-5 min-w-0 overflow-hidden rounded-2xl bg-white p-3 shadow-[0_2px_14px_rgba(0,0,0,0.03)] sm:mt-6 sm:rounded-3xl sm:p-4"
        >
          {/* Row 1: Pill Search + Sort */}
          <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto] sm:gap-3">
            <div className="relative min-w-0">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#6E6E73]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm iPhone, MacBook, màn hình…"
                aria-label="Tìm kiếm sản phẩm"
                className="min-h-10 w-full rounded-full bg-[#F5F5F7] pr-8 pl-9 text-sm text-[#1D1D1F] placeholder:text-[#6E6E73] transition-colors focus:bg-[#EBEBF0] sm:min-h-11 sm:pl-10 [&::-webkit-search-cancel-button]:appearance-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setKeyword('');
                    setPage(0);
                  }}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute top-1/2 right-1.5 inline-flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#515154] transition-colors hover:bg-black/[0.08] hover:text-[#1D1D1F]"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <select
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value);
                setPage(0);
              }}
              aria-label="Sắp xếp theo giá"
              className="min-h-11 cursor-pointer rounded-full bg-[#F5F5F7] px-4 text-sm font-semibold text-[#1D1D1F] transition-colors hover:bg-[#EBEBF0]"
            >
              <option value="asc">Giá thấp đến cao</option>
              <option value="desc">Giá cao đến thấp</option>
            </select>
          </div>

          {/* Row 2: Pill Category Rail */}
          <div className="no-scrollbar -mx-1 mt-2.5 flex items-center gap-1.5 overflow-x-auto px-1 py-0.5 sm:mt-3 sm:flex-wrap sm:overflow-visible">
            {[{ id: '', name: 'Tất cả' }, ...categories].map((category) => {
              const active = selectedCategory === category.id;
              return (
                <button
                  key={category.id || 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chooseCategory(category.id)}
                  className={`inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.97] motion-safe-transform sm:min-h-9.5 sm:px-4 sm:text-[13px] ${
                    active
                      ? 'bg-[#1D1D1F] text-white shadow-xs'
                      : 'bg-[#F5F5F7] text-[#515154] hover:bg-[#E8E8ED] hover:text-[#1D1D1F]'
                  }`}
                >
                  {active && (
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-[#2997FF]" />
                  )}
                  {category.name}
                </button>
              );
            })}
            {categoryError && (
              <button
                type="button"
                onClick={() => setReloadCount((count) => count + 1)}
                className="min-h-9 shrink-0 cursor-pointer rounded-full px-3 text-xs font-semibold whitespace-nowrap text-[#0066CC] underline underline-offset-4 sm:text-sm"
              >
                Tải lại danh mục
              </button>
            )}
          </div>

          {/* Active Filter Summary */}
          {hasActiveFilter && (
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.06] pt-2.5 text-xs text-[#515154]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span>Đang hiển thị:</span>
                {selectedCategoryObj && (
                  <span className="inline-flex items-center rounded-full bg-[#E8F2FF] px-2.5 py-0.5 font-semibold text-[#0066CC]">
                    {selectedCategoryObj.name}
                  </span>
                )}
                {keyword && (
                  <span className="inline-flex items-center rounded-full bg-[#F5F5F7] px-2.5 py-0.5 font-semibold text-[#1D1D1F]">
                    “{keyword}”
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex min-h-7 cursor-pointer items-center rounded-full px-2.5 font-semibold text-[#0066CC] transition-colors hover:bg-[#E8F2FF]"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Borderless Product Grid */}
        <div className="mt-5 sm:mt-7" aria-busy={catalogBusy}>
          {catalogBusy ? (
            <div className={productGrid} aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => (
                <div
                  key={index}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white p-3 sm:rounded-3xl sm:p-5"
                >
                  <div className="aspect-4/3 animate-pulse rounded-xl bg-[#F5F5F7]" />
                  <div className="mt-4 space-y-2.5">
                    <div className="h-3 w-1/3 animate-pulse rounded-full bg-[#F5F5F7]" />
                    <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#F5F5F7]" />
                    <div className="mt-4 h-5 w-1/2 animate-pulse rounded-full bg-[#F5F5F7]" />
                    <div className="h-9 w-full animate-pulse rounded-full bg-[#F5F5F7]" />
                  </div>
                </div>
              ))}
            </div>
          ) : catalogError || products.length === 0 ? (
            <div className="space-y-3 rounded-3xl bg-white px-5 py-14 text-center shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <p className="text-base font-bold text-[#1D1D1F]">
                {catalogError ? 'Chưa tải được danh sách sản phẩm' : 'Không tìm thấy thiết bị phù hợp'}
              </p>
              <p className="mx-auto max-w-md text-sm text-[#515154]">
                {catalogError
                  ? 'Kết nối tạm thời gián đoạn. Hãy thử tải lại danh mục.'
                  : 'Hãy thử từ khóa ngắn hơn hoặc chọn nhóm thiết bị khác.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (catalogError) {
                    setReloadCount((count) => count + 1);
                  } else {
                    resetFilters();
                  }
                }}
                className="mt-1 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full bg-[#0066CC] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0055B3] active:scale-[0.97] motion-safe-transform"
              >
                {catalogError ? 'Tải lại sản phẩm' : 'Xem tất cả sản phẩm'}
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
                    className="group/card flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.025)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(0,0,0,0.08)] motion-safe-transform sm:rounded-3xl"
                  >
                    {/* 1. Ảnh → 2. Tên */}
                    <Link
                      to={`/products/${product.id}`}
                      className="group block focus-visible:-outline-offset-2"
                    >
                      <div className="relative aspect-4/3 overflow-hidden bg-white px-3 pt-4 pb-2 sm:px-5 sm:pt-6 sm:pb-3">
                        <ProductImage
                          imageUrl={product.imageUrl}
                          alt=""
                          loading="lazy"
                          className="size-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.045] motion-safe-transform"
                        />
                        {(outOfStock || lowStock) && (
                          <span
                            className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              outOfStock
                                ? 'bg-[#1D1D1F]/85 text-white'
                                : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
                            }`}
                          >
                            {outOfStock ? 'Hết hàng' : `Còn ${stock}`}
                          </span>
                        )}
                      </div>

                      <div className="px-3.5 pt-2 sm:px-5 sm:pt-2.5">
                        <p className="truncate text-[11px] font-medium text-[#6E6E73] sm:text-xs">
                          {product.category?.name || 'Thiết bị'}
                        </p>
                        <h3 className="mt-0.5 line-clamp-2 min-h-[2.4rem] text-sm leading-snug font-bold text-[#1D1D1F] transition-colors group-hover:text-[#0066CC] sm:min-h-[2.65rem] sm:text-[15.5px]">
                          {product.name}
                        </h3>
                      </div>
                    </Link>

                    {product.description && (
                      <p className="mx-3.5 mt-1 line-clamp-1 text-xs leading-relaxed text-[#6E6E73] sm:mx-5">
                        {product.description}
                      </p>
                    )}

                    {/* 3. Giá → 4. Hành động mua dạng viên thuốc tinh tế */}
                    <div className="mt-auto space-y-2.5 px-3.5 pt-3 pb-3.5 sm:space-y-3 sm:px-5 sm:pt-4 sm:pb-5">
                      <p className="text-[15px] font-semibold tracking-[-0.015em] text-[#1D1D1F] tabular-nums sm:text-[17px]">
                        {formatCurrencyVND(product.price)}
                      </p>

                      <button
                        type="button"
                        disabled={outOfStock || addingId !== null}
                        onClick={() => handleAddToCart(product)}
                        aria-label={
                          outOfStock
                            ? `Tạm hết hàng: ${product.name}`
                            : adding
                              ? `Đang thêm… ${product.name}`
                              : `Thêm vào giỏ: ${product.name}`
                        }
                        className={`inline-flex min-h-9.5 w-full items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold whitespace-nowrap transition-all duration-200 sm:min-h-10 sm:text-[13px] ${
                          outOfStock
                            ? 'cursor-not-allowed bg-[#F5F5F7] text-[#86868B]'
                            : 'bg-[#F2F2F7] text-[#1D1D1F] enabled:cursor-pointer enabled:group-hover/card:bg-[#0066CC] enabled:group-hover/card:text-white enabled:hover:!bg-[#0055B3] enabled:hover:!text-white enabled:focus-visible:bg-[#0066CC] enabled:focus-visible:text-white enabled:active:scale-[0.96] motion-safe-transform disabled:opacity-50'
                        }`}
                      >
                        {!outOfStock && <ShoppingBag className="size-3.5 shrink-0" aria-hidden="true" />}
                        <span>
                          {outOfStock ? 'Tạm hết hàng' : adding ? 'Đang thêm…' : 'Thêm vào giỏ'}
                        </span>
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
          <nav aria-label="Phân trang sản phẩm" className="mt-8 flex items-center justify-center gap-2.5 sm:mt-10 sm:gap-3.5">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className={pageButton}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Trang trước
            </button>
            <span className="px-2 text-xs font-semibold text-[#515154] tabular-nums sm:px-3 sm:text-sm">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className={pageButton}
            >
              Trang sau
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
