import { Link } from "react-router-dom";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCartStore } from "../store/useCartStore";
import { useAuth } from "../store/AuthContext";
import { useAuthModalStore } from "../store/useAuthModalStore";
import { formatPrice } from "../utils/formatPrice";
import { Heart, Lock } from "lucide-react";

export function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const openAuth = useAuthModalStore((state) => state.open);
  const { items, toggleWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const handleRemove = async (bookId: string) => {
    await toggleWishlist(bookId);
  };

  const handleAddToCart = async (item: any) => {
    try {
      await addToCart(
        {
          id: item.bookId,
          title: item.title,
          slug: item.slug,
          author: "",
          cover: item.cover,
          price: item.price,
          stock: 99, // default stock
        },
        1
      );
    } catch (e) {
      console.error("Add to cart error:", e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-warm py-16 px-4 text-center flex flex-col justify-center items-center">
        <Lock className="w-16 h-16 text-espresso/40 mb-4" />
        <h1 className="font-serif text-3xl font-bold text-espresso mb-3">Yêu cầu đăng nhập</h1>
        <p className="text-text-sub max-w-md mb-8">Vui lòng đăng nhập để lưu và xem danh sách những cuốn sách yêu thích của bạn.</p>
        <button
          onClick={openAuth}
          className="bg-accent hover:bg-primary-hover text-white font-bold rounded-full px-8 py-3.5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-warm py-12 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Breadcrumbs */}
        <div className="text-sm font-semibold text-text-sub mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-espresso">Danh sách yêu thích</span>
        </div>

        <h1 className="font-serif text-4xl font-bold text-espresso mb-8">Danh Sách Yêu Thích</h1>

        {items.length === 0 ? (
          <div className="bg-surface border border-border-warm rounded-3xl p-12 text-center shadow-sm">
            <Heart className="w-16 h-16 text-sale/30 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-espresso mb-2">Danh sách yêu thích trống</h2>
            <p className="text-text-sub mb-8 max-w-md mx-auto">Bạn chưa lưu cuốn sách nào. Nhấn biểu tượng trái tim trên các cuốn sách để lưu chúng tại đây nhé!</p>
            <Link 
              to="/books" 
              className="inline-block bg-primary hover:bg-primary-hover text-white font-bold rounded-full px-8 py-3.5 transition-all shadow-md hover:shadow-lg text-sm"
            >
              Khám phá sách
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <article 
                key={item.id} 
                className="group relative border border-border-warm rounded-[22px] bg-surface overflow-hidden shadow-sm hover:shadow-espresso transition-all duration-300 ease-out hover:-translate-y-1"
              >
                <Link to={`/books/${item.slug}`} className="block overflow-hidden aspect-[3/4]">
                  <img 
                    className="w-full h-full object-cover bg-surface-warm group-hover:scale-105 transition-transform duration-500" 
                    src={item.cover} 
                    alt={`Bìa sách ${item.title}`} 
                  />
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item.bookId)}
                  className="absolute z-20 top-3 right-3 w-10 h-10 border-0 rounded-full text-sale bg-surface shadow-sm hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
                  type="button"
                  title="Xóa khỏi yêu thích"
                >
                  <Heart className="w-5 h-5 text-sale" fill="currentColor" />
                </button>

                <div className="p-3.5 flex flex-col gap-1.5 justify-between min-h-[140px]">
                  <div>
                    <Link to={`/books/${item.slug}`} className="hover:text-primary transition-colors">
                      <h3 className="line-clamp-2 text-sm font-bold text-espresso leading-snug">{item.title}</h3>
                    </Link>
                    <strong className="text-sale text-sm font-extrabold block mt-2">{formatPrice(item.price)}</strong>
                  </div>

                  <button
                    className="w-full border-0 rounded-full py-2 px-3 bg-accent-soft text-primary font-extrabold text-xs md:text-sm mt-2 hover:bg-accent hover:text-white transition-colors duration-200 cursor-pointer"
                    type="button"
                    onClick={() => handleAddToCart(item)}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
