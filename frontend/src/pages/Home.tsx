import { useEffect, useState } from "react";
import { BookCard } from "../components/shared/BookCard";
import { demoBooks, categories as demoCategories } from "../data";
import { getHomeData, type HomeBanner } from "../services/api";
import type { Book, Category } from "../types/book.types";

type HomeState = {
  heroBanners: HomeBanner[];
  midBanners: HomeBanner[];
  categories: Category[];
  bestSellingBooks: Book[];
  newBooks: Book[];
  saleBooks: Book[];
};

const fallbackHero: HomeBanner = {
  id: 0,
  title: "Sách hay cho từng ngày, mua nhanh trong vài cú chạm.",
  subtitle: "Khám phá sách bán chạy, sách mới và ưu đãi được chọn lọc cho bạn với trải nghiệm mua sách gọn gàng, ấm áp.",
  imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80",
  linkUrl: "/books",
  buttonText: "Mua sách ngay",
  sortOrder: 0,
};

function SectionHeader({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <div className="flex items-end justify-between gap-5 mb-5">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary mb-1">{eyebrow}</p>
        <h2 className="text-xl md:text-2xl font-bold text-espresso">{title}</h2>
      </div>
      <a href="/books" className="text-primary hover:text-primary-hover font-extrabold text-sm md:text-base transition-colors shrink-0">
        Xem tất cả →
      </a>
    </div>
  );
}

function BookSlider({ title, eyebrow, books }: { title: string; eyebrow: string; books: Book[] }) {
  if (books.length === 0) return null;

  return (
    <section className="py-9 max-w-[1280px] w-[calc(100%-48px)] mx-auto">
      <SectionHeader title={title} eyebrow={eyebrow} />
      <div className="grid grid-flow-col auto-cols-[220px] md:auto-cols-[calc((100%-72px)/5)] gap-[18px] overflow-x-auto pb-4 snap-x snap-proximity no-scrollbar">
        {books.slice(0, 5).map((book) => (
          <div key={`${title}-${book.id}`} className="snap-start">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryGrid({ categories, isLoading }: { categories: Category[]; isLoading: boolean }) {
  return (
    <section id="categories" className="py-9 max-w-[1280px] w-[calc(100%-48px)] mx-auto">
      <SectionHeader
        title="Thể loại sách"
        eyebrow={isLoading ? "Đang tải từ API" : "Khám phá nhanh"}
      />
      <div className="grid grid-flow-col auto-cols-[160px] md:auto-cols-[calc((100%-98px)/8)] gap-3.5 overflow-x-auto pb-4 snap-x snap-proximity no-scrollbar">
        {categories.map((category) => (
          <a
            className="snap-start min-h-[128px] rounded-[22px] border border-border-warm bg-linear-to-b from-white to-surface-warm grid place-items-center text-center p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-300"
            href={`/books?category=${category.slug}`}
            key={category.id}
          >
            <span className="text-3xl mb-2 block">{category.icon}</span>
            <strong className="text-espresso font-bold text-sm block">{category.name}</strong>
          </a>
        ))}
      </div>
    </section>
  );
}

function HeroSection({ banner }: { banner: HomeBanner }) {
  return (
    <section className="py-14 md:py-16">
      <div className="max-w-[1280px] w-[calc(100%-48px)] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_520px] items-center gap-12">
        <div className="flex flex-col">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary mb-2">BBooks · Warm Premium Bookstore</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-[4.9rem] font-bold text-espresso leading-[0.98] tracking-tighter mb-[22px]">
            {banner.title || fallbackHero.title}
          </h1>
          <p className="text-text-sub max-w-[650px] text-[15px] md:text-[17px] leading-relaxed">
            {banner.subtitle || fallbackHero.subtitle}
          </p>
          <div className="flex gap-3.5 mt-8 flex-wrap">
            <a
              className="inline-flex items-center justify-center rounded-full min-h-12 px-6 font-extrabold transition-all duration-200 hover:-translate-y-1 bg-linear-to-br from-accent to-primary-hover text-white shadow-[0_16px_35px_rgba(245,158,11,0.28)]"
              href={banner.linkUrl || "/books"}
            >
              {banner.buttonText || "Mua sách ngay"}
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full min-h-12 px-6 font-extrabold transition-all duration-200 hover:-translate-y-1 bg-surface border border-border-warm text-espresso"
              href="#categories"
            >
              Xem danh mục
            </a>
          </div>
        </div>
        <div
          className="relative overflow-hidden rounded-[32px] min-h-[300px] md:min-h-[420px] shadow-espresso bg-surface"
          aria-label="Hero banner"
        >
          <span className="absolute z-10 top-5 left-5 rounded-full py-2 px-4 bg-white/88 text-sale font-extrabold text-xs md:text-sm">
            Deal tuần này
          </span>
          <img
            src={banner.imageUrl || fallbackHero.imageUrl}
            alt={banner.title || "Không gian đọc sách BBooks"}
            className="w-full h-[300px] md:h-[420px] object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-espresso/45 to-transparent" />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span className="w-2 h-2 rounded-full bg-white opacity-50"></span>
            <span className="w-2 h-2 rounded-full bg-white opacity-50"></span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MidBanners({ banners }: { banners: HomeBanner[] }) {
  if (banners.length === 0) return null;

  return (
    <section className="py-4 max-w-[1280px] w-[calc(100%-48px)] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
      {banners.slice(0, 2).map((banner) => (
        <a
          href={banner.linkUrl || "/books"}
          key={banner.id}
          className="group relative overflow-hidden rounded-[28px] min-h-[210px] bg-espresso shadow-sm hover:shadow-xl transition-all"
        >
          <img src={banner.imageUrl} alt={banner.title || "BBooks banner"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso/88 via-espresso/45 to-transparent" />
          <div className="relative z-10 p-6 max-w-[360px] text-white">
            <p className="text-[10px] uppercase tracking-[0.16em] text-accent font-extrabold mb-2">Ưu đãi nổi bật</p>
            <h2 className="font-serif text-2xl font-bold">{banner.title || "BBooks Banner"}</h2>
            <p className="text-sm text-white/75 mt-2 line-clamp-2">{banner.subtitle || "Khám phá bộ sưu tập sách đang được yêu thích."}</p>
            <span className="inline-flex mt-5 rounded-full bg-accent px-4 py-2 text-xs font-extrabold text-white">
              {banner.buttonText || "Khám phá"}
            </span>
          </div>
        </a>
      ))}
    </section>
  );
}

export function Home() {
  const [home, setHome] = useState<HomeState>({
    heroBanners: [fallbackHero],
    midBanners: [],
    categories: demoCategories,
    bestSellingBooks: demoBooks,
    newBooks: [...demoBooks].reverse(),
    saleBooks: demoBooks.filter((book) => book.originalPrice).concat(demoBooks).slice(0, 5),
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadHome() {
      setIsLoading(true);
      try {
        const data = await getHomeData();
        if (!isMounted) return;
        setHome({
          heroBanners: data.heroBanners.length ? data.heroBanners : [fallbackHero],
          midBanners: data.midBanners,
          categories: data.categories.length ? data.categories : demoCategories,
          bestSellingBooks: data.bestSellingBooks.length ? data.bestSellingBooks : demoBooks,
          newBooks: data.newBooks.length ? data.newBooks : [...demoBooks].reverse(),
          saleBooks: data.saleBooks.length ? data.saleBooks : demoBooks.filter((book) => book.originalPrice).concat(demoBooks).slice(0, 5),
        });
      } catch (error) {
        console.error("Home: Không tải được dữ liệu trang chủ", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHome();
    return () => { isMounted = false; };
  }, []);

  return (
    <main>
      <HeroSection banner={home.heroBanners[0] ?? fallbackHero} />
      <CategoryGrid categories={home.categories} isLoading={isLoading} />
      <BookSlider title="Sách bán chạy" eyebrow={isLoading ? "Đang tải..." : "Được độc giả chọn nhiều"} books={home.bestSellingBooks} />
      <MidBanners banners={home.midBanners} />
      <BookSlider title="Sách mới" eyebrow="Vừa lên kệ" books={home.newBooks} />
      <BookSlider title="Sách khuyến mãi" eyebrow="Ưu đãi tốt hôm nay" books={home.saleBooks} />
      <BookSlider title="Gợi ý hôm nay" eyebrow="Dành riêng cho bạn" books={home.bestSellingBooks} />
    </main>
  );
}
