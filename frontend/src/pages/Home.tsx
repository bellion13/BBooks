import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Baby,
  BadgePercent,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  GraduationCap,
  Grid3X3,
  Languages,
  PanelsTopLeft,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
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
  title: "Hiệu sách online ấm áp cho mọi hành trình đọc.",
  subtitle:
    "BBooks tuyển chọn sách hay, ưu đãi rõ ràng và trải nghiệm mua nhanh như một quầy sách premium ngay trong trình duyệt của bạn.",
  imageUrl:
    "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1100&q=85",
  linkUrl: "/books",
  buttonText: "Mua sách ngay",
  sortOrder: 0,
};

const categoryIcons = [
  BookOpen,
  BriefcaseBusiness,
  Sparkles,
  Baby,
  Languages,
  PanelsTopLeft,
  GraduationCap,
  Grid3X3,
];

function SectionHeader({ title, eyebrow, description }: { title: string; eyebrow: string; description?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-5">
      <div>
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h2 className="font-serif text-2xl text-espresso md:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-sub">{description}</p> : null}
      </div>
      <a
        href="/books"
        className="hidden shrink-0 items-center gap-2 rounded-full border border-border-warm bg-white/80 px-4 py-2 text-sm font-extrabold text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-primary-hover md:inline-flex"
      >
        Xem tất cả <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}

function BookSlider({ title, eyebrow, books }: { title: string; eyebrow: string; books: Book[] }) {
  if (books.length === 0) return null;

  return (
    <section className="mx-auto w-[calc(100%-32px)] max-w-[1280px] py-9 md:w-[calc(100%-48px)]">
      <SectionHeader title={title} eyebrow={eyebrow} description="Các tựa sách được sắp xếp thành hàng ngang để bạn lướt nhanh như kệ sách thật." />
      <div className="grid auto-cols-[225px] grid-flow-col gap-[18px] overflow-x-auto pb-5 snap-x snap-proximity no-scrollbar md:auto-cols-[calc((100%-72px)/5)]">
        {books.slice(0, 10).map((book) => (
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
    <section id="categories" className="mx-auto w-[calc(100%-32px)] max-w-[1280px] py-9 md:w-[calc(100%-48px)]">
      <SectionHeader
        title="Chọn thể loại bạn muốn đọc"
        eyebrow={isLoading ? "Đang đồng bộ dữ liệu" : "Khám phá nhanh"}
        description="8 lối vào quen thuộc giúp người mua mới tìm sách nhanh hơn mà không cần mở quá nhiều bộ lọc."
      />
      <div className="grid grid-flow-col auto-cols-[164px] gap-4 overflow-x-auto pb-5 snap-x snap-proximity no-scrollbar md:auto-cols-[calc((100%-98px)/8)]">
        {categories.slice(0, 8).map((category, index) => {
          const Icon = categoryIcons[index % categoryIcons.length];
          return (
            <a
              className="group glass-panel relative min-h-[142px] snap-start overflow-hidden rounded-[26px] p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/70 hover:shadow-glow"
              href={`/books?category=${category.slug}`}
              key={category.id}
            >
              <span className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-accent/15 blur-2xl transition-transform duration-500 group-hover:scale-150" />
              <span className="mx-auto mb-3 grid h-13 w-13 place-items-center rounded-2xl bg-espresso text-white shadow-lg shadow-espresso/15 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
                <Icon className="h-6 w-6" />
              </span>
              <strong className="block text-sm font-extrabold text-espresso">{category.name}</strong>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                Xem sách <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function HeroSection({ banner }: { banner: HomeBanner }) {
  const title = banner.title || fallbackHero.title;
  const subtitle = banner.subtitle || fallbackHero.subtitle;

  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      <div className="pointer-events-none absolute left-[6%] top-10 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto grid w-[calc(100%-32px)] max-w-[1280px] grid-cols-1 items-center gap-10 md:w-[calc(100%-48px)] lg:grid-cols-[1fr_540px]">
        <div className="flex flex-col">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-accent" /> BBooks · Liquid Glass Bookstore
          </div>
          <h1 className="text-balance font-serif text-4xl leading-[1.02] tracking-tight text-espresso md:text-6xl lg:text-[5.35rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-[660px] text-[15px] leading-8 text-text-sub md:text-lg">{subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <a
              className="gold-glow inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-linear-to-br from-accent to-primary-hover px-7 font-black text-white transition-all duration-200 hover:-translate-y-1"
              href={banner.linkUrl || "/books"}
            >
              {banner.buttonText || "Mua sách ngay"} <ArrowRight className="h-4 w-4" />
            </a>
            <a
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-border-warm bg-white/78 px-7 font-extrabold text-espresso shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-accent"
              href="#categories"
            >
              <Search className="h-4 w-4" /> Tìm theo thể loại
            </a>
          </div>

          <div className="mt-9 grid max-w-[680px] grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, title: "Freeship 199K", text: "Giao sách nhanh" },
              { icon: ShieldCheck, title: "Sách chuẩn", text: "Thông tin rõ ràng" },
              { icon: BadgePercent, title: "Deal mỗi ngày", text: "Giá tốt dễ thấy" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-panel rounded-2xl px-4 py-3">
                  <Icon className="mb-2 h-5 w-5 text-primary" />
                  <strong className="block text-sm font-black text-espresso">{item.title}</strong>
                  <span className="text-xs font-medium text-text-sub">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="glass-panel animate-float-book relative overflow-hidden rounded-[36px] p-3">
            <div className="relative overflow-hidden rounded-[28px] bg-espresso">
              <img
                src={banner.imageUrl || fallbackHero.imageUrl}
                alt={title || "Không gian đọc sách BBooks"}
                className="h-[330px] w-full object-cover md:h-[470px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/78 via-espresso/10 to-transparent" />
              <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-sale shadow-sm backdrop-blur">
                Deal tuần này
              </div>
              <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/20 bg-white/16 p-5 text-white backdrop-blur-md">
                <div className="flex items-center gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-2 text-lg font-black">Kệ sách bán chạy được cập nhật liên tục</p>
                <p className="mt-1 text-sm text-white/75">Dữ liệu lấy từ API, fallback vẫn đẹp khi backend chưa bật.</p>
              </div>
            </div>
          </div>
          <div className="shimmer-line absolute -bottom-4 left-8 right-8 h-1 overflow-hidden rounded-full bg-espresso/10" />
        </div>
      </div>
    </section>
  );
}

function MidBanners({ banners }: { banners: HomeBanner[] }) {
  const fallbackBanners = useMemo<HomeBanner[]>(
    () => [
      {
        id: -1,
        title: "Combo sách kỹ năng giảm sâu",
        subtitle: "Gói đọc 30 ngày cho người muốn xây lại thói quen học tập và làm việc.",
        imageUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85",
        linkUrl: "/books?sort=sale",
        buttonText: "Xem combo",
        sortOrder: 1,
      },
      {
        id: -2,
        title: "Góc đọc cuối tuần",
        subtitle: "Tiểu thuyết, chữa lành và sách thiếu nhi được chọn cho gia đình.",
        imageUrl: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=900&q=85",
        linkUrl: "/books?category=van-hoc",
        buttonText: "Khám phá",
        sortOrder: 2,
      },
    ],
    []
  );

  const visibleBanners = banners.length ? banners.slice(0, 2) : fallbackBanners;

  return (
    <section className="mx-auto grid w-[calc(100%-32px)] max-w-[1280px] grid-cols-1 gap-4 py-4 md:w-[calc(100%-48px)] md:grid-cols-2">
      {visibleBanners.map((banner) => (
        <a
          href={banner.linkUrl || "/books"}
          key={banner.id}
          className="group relative min-h-[230px] overflow-hidden rounded-[32px] bg-espresso shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-espresso"
        >
          <img src={banner.imageUrl} alt={banner.title || "BBooks banner"} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-108" />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso/92 via-espresso/54 to-transparent" />
          <div className="relative z-10 max-w-[390px] p-7 text-white">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-accent">Ưu đãi nổi bật</p>
            <h2 className="font-serif text-3xl leading-tight">{banner.title || "BBooks Banner"}</h2>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/76">{banner.subtitle || "Khám phá bộ sưu tập sách đang được yêu thích."}</p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-black text-white transition-transform duration-200 group-hover:translate-x-1">
              {banner.buttonText || "Khám phá"} <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </a>
      ))}
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="mx-auto w-[calc(100%-32px)] max-w-[1280px] py-8 md:w-[calc(100%-48px)]">
      <div className="glass-panel grid gap-4 rounded-[30px] p-5 md:grid-cols-[1.1fr_0.9fr_0.9fr] md:p-7">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">BBooks Promise</p>
          <h2 className="mt-2 font-serif text-3xl text-espresso">Mua sách gọn, đẹp và đáng tin.</h2>
        </div>
        <div className="rounded-3xl bg-white/70 p-5">
          <p className="text-3xl font-black text-espresso">30s</p>
          <p className="mt-1 text-sm leading-6 text-text-sub">Review có chống spam theo kế hoạch, nội dung nhạy cảm được che bằng ****.</p>
        </div>
        <div className="rounded-3xl bg-espresso p-5 text-white">
          <p className="text-3xl font-black text-accent">24/7</p>
          <p className="mt-1 text-sm leading-6 text-white/72">Giao diện luôn có fallback data để demo mượt ngay cả khi API lỗi.</p>
        </div>
      </div>
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
    document.title = "BBooks | Hiệu sách online premium";
    const description = "BBooks là web bán sách React + Node.js với trải nghiệm mua sách nhanh, giao diện premium và quản trị đầy đủ.";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, []);

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
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main>
      <HeroSection banner={home.heroBanners[0] ?? fallbackHero} />
      <CategoryGrid categories={home.categories} isLoading={isLoading} />
      <BookSlider title="Sách bán chạy" eyebrow={isLoading ? "Đang tải..." : "Được độc giả chọn nhiều"} books={home.bestSellingBooks} />
      <MidBanners banners={home.midBanners} />
      <BookSlider title="Sách mới" eyebrow="Vừa lên kệ" books={home.newBooks} />
      <TrustStrip />
      <BookSlider title="Sách khuyến mãi" eyebrow="Ưu đãi tốt hôm nay" books={home.saleBooks} />
      <BookSlider title="Gợi ý hôm nay" eyebrow="Dành riêng cho bạn" books={home.bestSellingBooks} />
    </main>
  );
}
