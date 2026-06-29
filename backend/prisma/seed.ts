import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const categories = [
  { name: "V\u0103n h\u1ECDc", slug: "van-hoc", icon: "\u{1F4DA}", sortOrder: 1 },
  { name: "Kinh t\u1EBF", slug: "kinh-te", icon: "\u{1F4C8}", sortOrder: 2 },
  { name: "K\u1EF9 n\u0103ng", slug: "ky-nang", icon: "\u2728", sortOrder: 3 },
  { name: "Thi\u1EBFu nhi", slug: "thieu-nhi", icon: "\u{1F9F8}", sortOrder: 4 },
  { name: "Ngo\u1EA1i ng\u1EEF", slug: "ngoai-ngu", icon: "\u{1F30F}", sortOrder: 5 },
  { name: "Manga/Comic", slug: "manga-comic", icon: "\u{1F4A5}", sortOrder: 6 },
  { name: "S\u00E1ch gi\u00E1o khoa", slug: "sach-giao-khoa", icon: "\u{1F393}", sortOrder: 7 },
  { name: "T\u1EA5t c\u1EA3 danh m\u1EE5c", slug: "tat-ca", icon: "\u2630", sortOrder: 8 },
];

const books = [
  {
    title: "Nh\u00E0 Gi\u1EA3 Kim",
    slug: "nha-gia-kim",
    author: "Paulo Coelho",
    categorySlug: "van-hoc",
    price: 69000,
    originalPrice: 99000,
    stock: 120,
    soldCount: 1280,
    avgRating: 4.8,
    reviewCount: 326,
    isFeatured: true,
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80",
    description: "M\u1ED9t c\u00E2u chuy\u1EC7n truy\u1EC1n c\u1EA3m h\u1EE9ng v\u1EC1 h\u00E0nh tr\u00ECnh theo \u0111u\u1ED5i \u01B0\u1EDBc m\u01A1 v\u00E0 l\u1EAFng nghe tr\u00E1i tim.",
  },
  {
    title: "T\u01B0 Duy Nhanh V\u00E0 Ch\u1EADm",
    slug: "tu-duy-nhanh-va-cham",
    author: "Daniel Kahneman",
    categorySlug: "kinh-te",
    price: 139000,
    originalPrice: 189000,
    stock: 80,
    soldCount: 980,
    avgRating: 4.9,
    reviewCount: 214,
    isFeatured: true,
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80",
    description: "T\u00E1c ph\u1EA9m kinh \u0111i\u1EC3n gi\u00FAp hi\u1EC3u c\u00E1ch con ng\u01B0\u1EDDi ra quy\u1EBFt \u0111\u1ECBnh trong cu\u1ED9c s\u1ED1ng v\u00E0 kinh doanh.",
  },
  {
    title: "Atomic Habits",
    slug: "atomic-habits",
    author: "James Clear",
    categorySlug: "ky-nang",
    price: 119000,
    originalPrice: 159000,
    stock: 150,
    soldCount: 1540,
    avgRating: 4.7,
    reviewCount: 418,
    isFeatured: true,
    coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80",
    description: "H\u1EC7 th\u1ED1ng x\u00E2y d\u1EF1ng th\u00F3i quen nh\u1ECF t\u1EA1o n\u00EAn thay \u0111\u1ED5i l\u1EDBn v\u00E0 b\u1EC1n v\u1EEFng m\u1ED7i ng\u00E0y.",
  },
  {
    title: "C\u00E2y Cam Ng\u1ECDt C\u1EE7a T\u00F4i",
    slug: "cay-cam-ngot-cua-toi",
    author: "Jos\u00E9 Mauro",
    categorySlug: "van-hoc",
    price: 84000,
    originalPrice: 108000,
    stock: 95,
    soldCount: 760,
    avgRating: 4.8,
    reviewCount: 192,
    coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=80",
    description: "C\u00E2u chuy\u1EC7n tu\u1ED5i th\u01A1 v\u1EEBa trong tr\u1EBBo v\u1EEBa x\u00FAc \u0111\u1ED9ng v\u1EC1 t\u00ECnh y\u00EAu th\u01B0\u01A1ng v\u00E0 s\u1EF1 tr\u01B0\u1EDFng th\u00E0nh.",
  },
  {
    title: "\u0110\u1EAFc Nh\u00E2n T\u00E2m",
    slug: "dac-nhan-tam",
    author: "Dale Carnegie",
    categorySlug: "ky-nang",
    price: 76000,
    originalPrice: 110000,
    stock: 200,
    soldCount: 2130,
    avgRating: 4.6,
    reviewCount: 537,
    isFeatured: true,
    coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=500&q=80",
    description: "Cu\u1ED1n s\u00E1ch n\u1EC1n t\u1EA3ng v\u1EC1 giao ti\u1EBFp, \u1EE9ng x\u1EED v\u00E0 x\u00E2y d\u1EF1ng m\u1ED1i quan h\u1EC7 t\u00EDch c\u1EF1c.",
  },
];

const banners = [
  {
    title: "Mùa hè đọc sách - Giảm đến 35%",
    subtitle: "Chọn nhanh những tựa sách bán chạy, sách mới và combo tri thức được BBooks tuyển chọn riêng cho bạn.",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    linkUrl: "/books",
    buttonText: "Khám phá ngay",
    position: "HOME_HERO" as const,
    sortOrder: 1,
  },
  {
    title: "Tủ sách kỹ năng cho tuần mới",
    subtitle: "Bắt đầu thói quen đọc 20 phút mỗi ngày với những cuốn sách dễ áp dụng.",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80",
    linkUrl: "/books?category=ky-nang",
    buttonText: "Xem kỹ năng",
    position: "HOME_MID" as const,
    sortOrder: 1,
  },
  {
    title: "Sách văn học truyền cảm hứng",
    subtitle: "Những câu chuyện ấm áp, sâu sắc và đáng đọc lại nhiều lần.",
    imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80",
    linkUrl: "/books?category=van-hoc",
    buttonText: "Đọc ngay",
    position: "HOME_MID" as const,
    sortOrder: 2,
  },
];

const reviewUsers = [
  { fullName: "Minh Anh", email: "minhanh.reader@bbooks.local" },
  { fullName: "Quang Huy", email: "quanghuy.reader@bbooks.local" },
  { fullName: "Thu Hà", email: "thuha.reader@bbooks.local" },
  { fullName: "Gia Bảo", email: "giabao.reader@bbooks.local" },
];

const sampleReviews = [
  {
    bookSlug: "nha-gia-kim",
    userEmail: "minhanh.reader@bbooks.local",
    rating: 5,
    title: "Truyền cảm hứng mạnh mẽ",
    content: "Một cuốn sách đẹp về hành trình theo đuổi ước mơ, rất phù hợp để đọc lại mỗi khi cần động lực.",
    isApproved: true,
    helpfulCount: 18,
  },
  {
    bookSlug: "tu-duy-nhanh-va-cham",
    userEmail: "quanghuy.reader@bbooks.local",
    rating: 4,
    title: "Nội dung sâu nhưng hơi dày",
    content: "Sách nhiều ví dụ thực tế và kiến thức hay, cần đọc chậm để thấm từng chương.",
    isApproved: true,
    helpfulCount: 11,
  },
  {
    bookSlug: "atomic-habits",
    userEmail: "thuha.reader@bbooks.local",
    rating: 5,
    title: "Rất thực tế",
    content: "Các gợi ý nhỏ nhưng dễ áp dụng ngay, đặc biệt phần thiết kế môi trường cho thói quen mới.",
    isApproved: false,
    helpfulCount: 6,
  },
  {
    bookSlug: "dac-nhan-tam",
    userEmail: "giabao.reader@bbooks.local",
    rating: 3,
    title: "Kinh điển nhưng cần chọn lọc",
    content: "Có nhiều bài học giao tiếp hữu ích, một số ví dụ hơi cũ nhưng vẫn đáng tham khảo.",
    isApproved: false,
    helpfulCount: 3,
  },
  {
    bookSlug: "cay-cam-ngot-cua-toi",
    userEmail: "minhanh.reader@bbooks.local",
    rating: 5,
    title: "Xúc động và trong trẻo",
    content: "Câu chuyện rất giàu cảm xúc, bản dịch dễ đọc và phù hợp làm quà tặng.",
    isApproved: true,
    helpfulCount: 15,
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const seededBooks = new Map<string, string>();

  for (const book of books) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: book.categorySlug } });
    const seededBook = await prisma.book.upsert({
      where: { slug: book.slug },
      update: {
        title: book.title,
        author: book.author,
        categoryId: category.id,
        price: book.price,
        originalPrice: book.originalPrice,
        stock: book.stock,
        soldCount: book.soldCount,
        avgRating: book.avgRating,
        reviewCount: book.reviewCount,
        isFeatured: book.isFeatured ?? false,
        coverUrl: book.coverUrl,
        description: book.description,
      },
      create: {
        title: book.title,
        slug: book.slug,
        author: book.author,
        categoryId: category.id,
        price: book.price,
        originalPrice: book.originalPrice,
        stock: book.stock,
        soldCount: book.soldCount,
        avgRating: book.avgRating,
        reviewCount: book.reviewCount,
        isFeatured: book.isFeatured ?? false,
        coverUrl: book.coverUrl,
        description: book.description,
      },
    });

    seededBooks.set(book.slug, seededBook.id);
  }

  for (const banner of banners) {
    const existingBanner = await prisma.banner.findFirst({
      where: { title: banner.title, position: banner.position },
    });

    if (existingBanner) {
      await prisma.banner.update({
        where: { id: existingBanner.id },
        data: { ...banner, isActive: true },
      });
    } else {
      await prisma.banner.create({ data: { ...banner, isActive: true } });
    }
  }

  const passwordHash = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@bbooks.local" },
    update: { fullName: "BBooks Admin", passwordHash, role: "ADMIN" },
    create: {
      fullName: "BBooks Admin",
      email: "admin@bbooks.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  const reviewerPasswordHash = await bcrypt.hash("User@123", 10);
  const seededUsers = new Map<string, string>();

  for (const user of reviewUsers) {
    const seededUser = await prisma.user.upsert({
      where: { email: user.email },
      update: { fullName: user.fullName, passwordHash: reviewerPasswordHash, role: "USER", isActive: true },
      create: { ...user, passwordHash: reviewerPasswordHash, role: "USER", isActive: true },
    });

    seededUsers.set(user.email, seededUser.id);
  }

  for (const review of sampleReviews) {
    const bookId = seededBooks.get(review.bookSlug);
    const userId = seededUsers.get(review.userEmail);

    if (!bookId || !userId) {
      continue;
    }

    await prisma.review.upsert({
      where: { bookId_userId: { bookId, userId } },
      update: {
        rating: review.rating,
        title: review.title,
        content: review.content,
        isApproved: review.isApproved,
        helpfulCount: review.helpfulCount,
      },
      create: {
        bookId,
        userId,
        rating: review.rating,
        title: review.title,
        content: review.content,
        isApproved: review.isApproved,
        helpfulCount: review.helpfulCount,
      },
    });
  }

  console.log("Seed completed: categories, books, banners, admin user, sample reviews");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
