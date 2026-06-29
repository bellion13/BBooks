-- CreateTable
CREATE TABLE "moderation_words" (
    "id" UUID NOT NULL,
    "word" VARCHAR(120) NOT NULL,
    "note" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "moderation_words_word_key" ON "moderation_words"("word");

-- CreateIndex
CREATE INDEX "moderation_words_is_active_idx" ON "moderation_words"("is_active");
