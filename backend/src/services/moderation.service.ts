import { prisma } from "../config/database.js";

export type ModerationWordInput = {
  word: string;
  note?: string | null;
  isActive?: boolean;
};

function normalizeWord(word: string) {
  return word.trim().replace(/\s+/g, " ").toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getActiveModerationWords() {
  return prisma.moderationWord.findMany({
    where: { isActive: true },
    orderBy: { word: "asc" },
  });
}

export function maskModeratedText<T extends string | null | undefined>(value: T, words: string[]): T {
  if (!value || words.length === 0) return value;

  const pattern = words
    .map((word) => word.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  if (!pattern) return value;

  return value.replace(new RegExp(pattern, "giu"), "***") as T;
}

export async function maskReviewText<T extends { title?: string | null; content?: string | null }>(review: T) {
  const words = await getActiveModerationWords();
  const wordValues = words.map((item) => item.word);

  return {
    ...review,
    title: maskModeratedText(review.title, wordValues),
    content: maskModeratedText(review.content, wordValues),
  };
}

export async function maskReviewList<T extends { title?: string | null; content?: string | null }>(reviews: T[]) {
  const words = await getActiveModerationWords();
  const wordValues = words.map((item) => item.word);

  return reviews.map((review) => ({
    ...review,
    title: maskModeratedText(review.title, wordValues),
    content: maskModeratedText(review.content, wordValues),
  }));
}

export async function adminFindModerationWords(query: { search?: string; isActive?: string } = {}) {
  return prisma.moderationWord.findMany({
    where: {
      ...(query.isActive !== undefined ? { isActive: query.isActive === "true" } : {}),
      ...(query.search ? { word: { contains: query.search, mode: "insensitive" as const } } : {}),
    },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
  });
}

export async function adminCreateModerationWord(input: ModerationWordInput) {
  const word = normalizeWord(input.word ?? "");
  if (!word) {
    throw new Error("Từ cấm không được để trống");
  }

  return prisma.moderationWord.create({
    data: {
      word,
      note: input.note?.trim() || null,
      isActive: input.isActive ?? true,
    },
  });
}

export async function adminUpdateModerationWord(id: string, input: Partial<ModerationWordInput>) {
  const nextWord = input.word !== undefined ? normalizeWord(input.word) : undefined;
  if (input.word !== undefined && !nextWord) {
    throw new Error("Từ cấm không được để trống");
  }

  return prisma.moderationWord.update({
    where: { id },
    data: {
      ...(nextWord !== undefined && { word: nextWord }),
      ...(input.note !== undefined && { note: input.note?.trim() || null }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
}

export async function adminDeleteModerationWord(id: string) {
  return prisma.moderationWord.delete({ where: { id } });
}
