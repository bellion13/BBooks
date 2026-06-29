import { Link } from "react-router-dom";
import type { Book } from "../../types/book.types";
import { formatPrice } from "../../utils/formatPrice";
import { useAuth } from "../../store/AuthContext";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCartStore } from "../../store/useCartStore";
import { useAuthModalStore } from "../../store/useAuthModalStore";
import { Heart } from "lucide-react";

type BookCardProps = {
  book: Book;
};

export function BookCard({ book }: BookCardProps) {
  const { isAuthenticated } = useAuth();
  const openAuth = useAuthModalStore((state) => state.open);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const isInWish = isInWishlist(book.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
          stock: 99, // default fallback stock if not specified on search list
        },
        1
      );
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  return (
    <article className="group relative border border-border-warm rounded-[22px] bg-surface overflow-hidden shadow-sm hover:shadow-espresso transition-all duration-300 ease-out hover:-translate-y-1">
      <button
        className={`absolute z-10 top-3 right-3 w-10 h-10 border-0 rounded-full bg-surface/92 opacity-100 scale-100 md:opacity-0 md:scale-90 md:group-hover:opacity-100 md:group-hover:scale-100 transition-all duration-300 ease-out flex items-center justify-center shadow-sm cursor-pointer ${
          isInWish ? "text-sale" : "text-text-sub hover:text-sale"
        }`}
        type="button"
        onClick={handleWishlistClick}
        aria-label={isInWish ? `Xóa khỏi yêu thích` : `Thêm vào yêu thích`}
      >
        <Heart className="w-4 h-4" fill={isInWish ? "currentColor" : "none"} />
      </button>
      {book.badge ? (
        <span className="absolute top-3 left-3 z-10 rounded-full px-2.5 py-1.5 bg-sale text-white text-[11px] font-extrabold shadow-sm">
          {book.badge}
        </span>
      ) : null}
      
      <Link to={`/books/${book.slug}`} className="block overflow-hidden aspect-[3/4]">
        <img className="w-full h-full object-cover bg-surface-warm group-hover:scale-105 transition-transform duration-500" src={book.cover} alt={`Bìa sách ${book.title}`} />
      </Link>
      
      <div className="p-3.5 flex flex-col gap-1.5">
        <p className="text-text-sub text-[11px] uppercase tracking-wider font-semibold">{book.author}</p>
        
        <Link to={`/books/${book.slug}`} className="hover:text-primary transition-colors">
          <h3 className="line-clamp-2 min-h-[44px] text-sm font-bold text-espresso leading-snug">{book.title}</h3>
        </Link>
        
        <p className="text-text-sub text-[11px] flex items-center gap-1">
          <span className="text-accent text-sm font-bold">★</span> {book.rating} · Đã bán {book.soldCount}
        </p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <strong className="text-sale text-sm md:text-[15px] font-extrabold">{formatPrice(book.price)}</strong>
          {book.originalPrice ? <del className="text-text-sub text-xs">{formatPrice(book.originalPrice)}</del> : null}
        </div>
        <button
          className="w-full border-0 rounded-full py-2 px-3 bg-accent-soft text-primary font-extrabold text-xs md:text-sm mt-1 hover:bg-accent hover:text-white transition-colors duration-200 cursor-pointer"
          type="button"
          onClick={handleAddToCart}
        >
          Thêm vào giỏ
        </button>
      </div>
    </article>
  );
}

