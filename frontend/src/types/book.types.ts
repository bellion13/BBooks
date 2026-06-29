export type Book = {
  id: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating: number;
  soldCount: number;
  cover: string;
  badge?: string;
  categorySlug?: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  slug: string;
};
