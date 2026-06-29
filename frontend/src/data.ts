import type { Book, Category } from "./types/book.types";

export const categories: Category[] = [
  { id: "literature", name: "Văn học", icon: "📚", slug: "van-hoc" },
  { id: "business", name: "Kinh tế", icon: "📈", slug: "kinh-te" },
  { id: "skills", name: "Kỹ năng", icon: "✨", slug: "ky-nang" },
  { id: "kids", name: "Thiếu nhi", icon: "🧸", slug: "thieu-nhi" },
  { id: "language", name: "Ngoại ngữ", icon: "🌏", slug: "ngoai-ngu" },
  { id: "manga", name: "Manga/Comic", icon: "💥", slug: "manga-comic" },
  { id: "textbook", name: "Sách giáo khoa", icon: "🎓", slug: "sach-giao-khoa" },
  { id: "all", name: "Tất cả danh mục", icon: "☰", slug: "tat-ca" },
];

export const demoBooks: Book[] = [
  { id: "1", slug: "nha-gia-kim", title: "Nhà Giả Kim", author: "Paulo Coelho", price: 69000, originalPrice: 99000, rating: 4.8, soldCount: 1280, cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80", badge: "-30%" },
  { id: "2", slug: "tu-duy-nhanh-va-cham", title: "Tư Duy Nhanh Và Chậm", author: "Daniel Kahneman", price: 139000, originalPrice: 189000, rating: 4.9, soldCount: 980, cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80", badge: "Bán chạy" },
  { id: "3", slug: "atomic-habits", title: "Atomic Habits", author: "James Clear", price: 119000, originalPrice: 159000, rating: 4.7, soldCount: 1540, cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80", badge: "Hot" },
  { id: "4", slug: "cay-cam-ngot-cua-toi", title: "Cây Cam Ngọt Của Tôi", author: "José Mauro", price: 84000, originalPrice: 108000, rating: 4.8, soldCount: 760, cover: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=80" },
  { id: "5", slug: "dac-nhan-tam", title: "Đắc Nhân Tâm", author: "Dale Carnegie", price: 76000, originalPrice: 110000, rating: 4.6, soldCount: 2130, cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=500&q=80", badge: "-31%" },
];
