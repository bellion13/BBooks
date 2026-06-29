import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import { BookCard } from "../components/shared/BookCard";
import { Spinner } from "../components/ui/Spinner";
import { StarRating } from "../components/ui/StarRating";
import { useAuth } from "../store/AuthContext";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useAuthModalStore } from "../store/useAuthModalStore";
import { useToastStore } from "../store/useToastStore";
import { useBookDetail } from "../hooks/useBookDetail";
import { submitBookReview } from "../services/api";
import { Heart } from "lucide-react";

type SubmittedReview = Awaited<ReturnType<typeof submitBookReview>>["data"];

export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const openAuth = useAuthModalStore((state) => state.open);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const { book, relatedBooks, isLoading, error } = useBookDetail(slug);
  const showToast = useToastStore((state) => state.show);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [submittedReviews, setSubmittedReviews] = useState<SubmittedReview[]>([]);

  useEffect(() => {
    setHasSubmittedReview(false);
    setSubmittedReviews([]);
  }, [slug]);

  // Cập nhật ảnh chính khi sách tải xong
  if (book && !selectedImage) {
    setSelectedImage(book.cover);
  }

  if (isLoading) {
    return (
      <main className="container page-shell">
        <Spinner fullPage size="lg" label="Đang tải thông tin chi tiết sách..." />
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="max-w-[1280px] w-[calc(100%-48px)] mx-auto py-12 pb-20">
        <div className="col-span-full bg-red-50 border border-red-200 p-4 rounded-2xl text-red-700 text-sm text-center font-medium">
          {error || "Không tìm thấy sách"}
        </div>
        <Link
          to="/books"
          className="inline-flex items-center justify-center rounded-full min-h-12 px-6 font-extrabold transition-all duration-200 hover:-translate-y-1 bg-surface border border-border-warm text-espresso"
          style={{ marginTop: "20px" }}
        >
          Quay lại danh sách sách
        </Link>
      </main>
    );
  }

  const isInWish = isInWishlist(book.id);
  const discount = book.originalPrice
    ? Math.round((1 - book.price / book.originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    try {
      await addToCart(
        {
          id: book.id,
          title: book.title,
          slug: book.slug,
          author: book.author,
          cover: book.cover,
          price: book.price,
          originalPrice: book.originalPrice,
          stock: book.stock,
        },
        quantity
      );
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(
        {
          id: book.id,
          title: book.title,
          slug: book.slug,
          author: book.author,
          cover: book.cover,
          price: book.price,
          originalPrice: book.originalPrice,
          stock: book.stock,
        },
        quantity
      );
      navigate("/cart");
    } catch (err) {
      console.error("Buy now error:", err);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      openAuth();
      return;
    }
    await toggleWishlist(book.id, {
      title: book.title,
      slug: book.slug,
      cover: book.cover,
      price: book.price,
    });
  };

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated) {
      openAuth();
      return;
    }

    if (!slug) return;

    setIsSubmittingReview(true);
    try {
      const response = await submitBookReview(slug, {
        rating: reviewRating,
        title: reviewTitle,
        content: reviewContent,
      });
      setReviewTitle("");
      setReviewContent("");
      setReviewRating(5);
      setHasSubmittedReview(true);
      setSubmittedReviews((prev) => [response.data, ...prev.filter((item) => item.id !== response.data.id)]);
      showToast(response.message, "success");
    } catch (err) {
      showToast((err as Error).message || "Gửi đánh giá thất bại", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const visibleReviews = [
    ...submittedReviews,
    ...book.reviews.filter((review) => !submittedReviews.some((submitted) => submitted.id === review.id)),
  ];

  return (
    <main className="max-w-[1280px] w-[calc(100%-48px)] mx-auto py-12 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 text-sm text-text-sub flex-wrap" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="text-border-warm/60"> &gt; </span>
        <Link to="/books" className="hover:text-primary transition-colors">Sách</Link>
        {book.category && (
          <>
            <span className="text-border-warm/60"> &gt; </span>
            <Link to={`/books?category=${book.category.slug}`} className="hover:text-primary transition-colors">
              {book.category.name}
            </Link>
          </>
        )}
        <span className="text-border-warm/60"> &gt; </span>
        <span className="text-espresso font-semibold">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-12 items-start">
        {/* Ảnh sách */}
        <div className="flex flex-col gap-5 w-full max-w-[420px] mx-auto lg:mx-0">
          <div className="bg-surface rounded-[28px] border border-border-warm overflow-hidden shadow-sm aspect-[3/4]">
            <img
              src={selectedImage || book.cover}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          {book.images && book.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              <button
                className={`w-[72px] h-[96px] rounded-xl border-2 overflow-hidden p-0 cursor-pointer bg-surface shrink-0 transition-all ${
                  selectedImage === book.cover
                    ? "border-accent shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
                    : "border-transparent"
                }`}
                onClick={() => setSelectedImage(book.cover)}
                type="button"
              >
                <img src={book.cover} alt="Bìa chính" className="w-full h-full object-cover" />
              </button>
              {book.images.map((img, index) => (
                <button
                  key={index}
                  className={`w-[72px] h-[96px] rounded-xl border-2 overflow-hidden p-0 cursor-pointer bg-surface shrink-0 transition-all ${
                    selectedImage === img.imageUrl
                      ? "border-accent shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  type="button"
                >
                  <img src={img.imageUrl} alt={`Bìa phụ ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thông tin sách */}
        <div className="bg-surface rounded-[28px] border border-border-warm p-6 md:p-10 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary mb-1">{book.author}</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-espresso my-2 leading-tight">{book.title}</h1>

          <div className="flex items-center gap-3 text-text-sub text-sm flex-wrap mb-6">
            <StarRating rating={book.rating} showValue size="md" />
            <span className="text-border-warm/60">·</span>
            <span>{book.reviews.length} đánh giá</span>
            <span className="text-border-warm/60">·</span>
            <span>Đã bán {book.soldCount}</span>
          </div>

          <div className="bg-surface-warm rounded-2xl p-5 mb-6">
            <div className="flex items-baseline gap-3.5 flex-wrap">
              <strong className="text-sale text-3xl font-extrabold">{formatPrice(book.price)}</strong>
              {book.originalPrice && (
                <>
                  <del className="text-text-sub text-[17px]">{formatPrice(book.originalPrice)}</del>
                  <span className="bg-sale text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
          </div>

          <hr className="border-t border-border-warm my-6" />

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-espresso uppercase tracking-wider">Tóm tắt nội dung</h3>
            <p className="text-text-main leading-relaxed text-[15px]" style={{ whiteSpace: "pre-line" }}>
              {book.description || "Chưa có tóm tắt chi tiết cho cuốn sách này."}
            </p>
          </div>

          <hr className="border-t border-border-warm my-6" />

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-espresso uppercase tracking-wider">Thông tin chi tiết</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Nhà xuất bản:", value: book.publisher },
                { label: "Năm xuất bản:", value: book.publishYear },
                { label: "ISBN:", value: book.isbn },
                {
                  label: "Tình trạng:",
                  value: null,
                  custom: (
                    <span className={`font-semibold ${book.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      {book.stock > 0 ? `Còn hàng (Còn ${book.stock} cuốn)` : "Hết hàng"}
                    </span>
                  ),
                },
              ].map(({ label, value, custom }) => (
                <div key={label} className="flex text-[14px]">
                  <span className="text-text-sub w-[140px] shrink-0 font-medium">{label}</span>
                  {custom ?? <span className="text-text-main font-semibold">{value || "Đang cập nhật"}</span>}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-t border-border-warm my-6" />

          {book.stock > 0 ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-espresso">Số lượng:</span>
                <div className="flex items-center border border-border-warm rounded-xl overflow-hidden bg-surface-warm">
                  <button
                    className="w-9 h-9 border-0 bg-transparent text-espresso font-bold text-lg cursor-pointer hover:bg-surface-warm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    type="button"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    className="w-12 h-9 border-0 border-l border-r border-border-warm text-center font-bold bg-surface text-espresso outline-none"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(book.stock, Number(e.target.value))))}
                    min="1"
                    max={book.stock}
                  />
                  <button
                    className="w-9 h-9 border-0 bg-transparent text-espresso font-bold text-lg cursor-pointer hover:bg-surface-warm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                    type="button"
                    disabled={quantity >= book.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_52px] gap-4 items-center">
                <button
                  className="inline-flex items-center justify-center rounded-full h-[52px] px-4 font-extrabold transition-all duration-200 hover:-translate-y-0.5 border-2 border-primary text-primary hover:bg-primary hover:text-white cursor-pointer text-sm"
                  onClick={handleAddToCart}
                  type="button"
                >
                  Thêm vào giỏ
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-full h-[52px] px-4 font-extrabold transition-all duration-200 hover:-translate-y-0.5 bg-linear-to-br from-accent to-primary-hover text-white cursor-pointer text-sm shadow-[0_16px_35px_rgba(245,158,11,0.2)]"
                  onClick={handleBuyNow}
                  type="button"
                >
                  Mua ngay
                </button>
                <button
                  className={`inline-flex items-center justify-center rounded-full h-[52px] w-[52px] border-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-xl shadow-sm ${
                    isInWish
                      ? "border-sale bg-sale text-white"
                      : "border-border-warm bg-surface text-text-sub hover:text-sale hover:border-sale"
                  }`}
                  onClick={handleWishlistToggle}
                  type="button"
                  title={isInWish ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                >
                  <Heart className="w-5 h-5" fill={isInWish ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl font-bold text-center">
              <p>Sản phẩm tạm thời hết hàng. Vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sách cùng thể loại */}
      {relatedBooks.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6 text-espresso">Sách cùng thể loại</h2>
          <div className="grid grid-flow-col auto-cols-[220px] md:auto-cols-[calc((100%-72px)/5)] gap-[18px] overflow-x-auto pb-4 snap-x snap-proximity no-scrollbar">
            {relatedBooks.map((relBook) => (
              <div key={relBook.id} className="snap-start">
                <BookCard book={relBook} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Đánh giá */}
      <section className="mt-14 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="bg-surface rounded-[28px] border border-border-warm p-6 md:p-10 shadow-sm">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6 text-espresso">
            Đánh giá từ độc giả ({visibleReviews.length})
          </h2>
          {visibleReviews.length === 0 ? (
            <p className="text-text-sub text-center py-6">
              Chưa có đánh giá nào cho sách này. Hãy là người đầu tiên chia sẻ cảm nhận!
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {visibleReviews.map((rev) => (
                <div key={rev.id} className="pb-6 border-b border-border-warm last:pb-0 last:border-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-accent-soft text-primary font-bold grid place-items-center overflow-hidden shrink-0">
                      {rev.user.avatarUrl ? (
                        <img src={rev.user.avatarUrl} alt={rev.user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{rev.user.fullName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow">
                      <strong className="text-espresso text-[14px] font-bold">{rev.user.fullName}</strong>
                      <span className="text-text-sub text-xs mt-0.5">
                        {new Date(rev.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <StarRating rating={rev.rating} size="sm" className="shrink-0" />
                  </div>
                  {rev.title && <h3 className="md:pl-14 font-bold text-espresso mb-1">{rev.title}</h3>}
                  <p className="text-text-main leading-relaxed text-[14px] md:pl-14">
                    {rev.content || "Người mua không để lại nhận xét."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmitReview}
          className="bg-linear-to-br from-[#fff7ed] via-white to-[#fef3c7] rounded-[28px] border border-amber-200 p-6 shadow-sm sticky top-24"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary mb-2">Chia sẻ cảm nhận</p>
          <h2 className="font-serif text-2xl font-bold text-espresso mb-4">Viết đánh giá</h2>

          {hasSubmittedReview && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              Đánh giá đã được gửi và hiển thị ngay. Nếu có từ cấm, hệ thống sẽ tự che bằng ***.
            </div>
          )}

          <label className="block text-sm font-bold text-espresso mb-2" htmlFor="review-rating">
            Số sao
          </label>
          <div id="review-rating" className="flex gap-2 mb-4" role="radiogroup" aria-label="Chọn số sao đánh giá">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setReviewRating(rating)}
                className={`text-3xl transition-all hover:-translate-y-0.5 ${rating <= reviewRating ? "text-amber-400" : "text-stone-300"}`}
                aria-pressed={rating === reviewRating}
              >
                ★
              </button>
            ))}
          </div>

          <label className="block text-sm font-bold text-espresso mb-2" htmlFor="review-title">
            Tiêu đề
          </label>
          <input
            id="review-title"
            value={reviewTitle}
            onChange={(event) => setReviewTitle(event.target.value)}
            maxLength={120}
            placeholder="Ví dụ: Rất đáng đọc"
            className="w-full rounded-2xl border border-border-warm bg-white px-4 py-3 outline-none focus:border-primary"
          />

          <label className="block text-sm font-bold text-espresso mt-4 mb-2" htmlFor="review-content">
            Nội dung đánh giá
          </label>
          <textarea
            id="review-content"
            value={reviewContent}
            onChange={(event) => setReviewContent(event.target.value)}
            rows={5}
            maxLength={1000}
            placeholder="Bạn thích điều gì ở cuốn sách này?"
            className="w-full resize-none rounded-2xl border border-border-warm bg-white px-4 py-3 outline-none focus:border-primary"
          />

          <button
            type="submit"
            disabled={isSubmittingReview}
            className="mt-5 w-full rounded-full bg-linear-to-br from-accent to-primary-hover px-5 py-3 font-extrabold text-white shadow-[0_16px_35px_rgba(245,158,11,0.25)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmittingReview ? "Đang gửi..." : isAuthenticated ? "Gửi đánh giá" : "Đăng nhập để đánh giá"}
          </button>
        </form>
      </section>
    </main>
  );
}
