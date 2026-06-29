import { Star, StarHalf } from "lucide-react";

type StarRatingProps = {
  rating: number;
  /** Tổng số sao tối đa */
  max?: number;
  /** Hiển thị số điểm bên cạnh */
  showValue?: boolean;
  /** Kích thước icon sao */
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const textSizeMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function StarRating({
  rating,
  max = 5,
  showValue = false,
  size = "md",
  className = "",
}: StarRatingProps) {
  const clampedRating = Math.min(Math.max(0, rating), max);
  const fullStars = Math.floor(clampedRating);
  const hasHalf = clampedRating - fullStars >= 0.3 && clampedRating - fullStars < 0.8;
  const emptyStars = max - fullStars - (hasHalf ? 1 : 0);

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${clampedRating} trên ${max} sao`}
      title={`${clampedRating}/${max} sao`}
    >
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={`${sizeMap[size]} fill-accent text-accent shrink-0`}
        />
      ))}
      {hasHalf && (
        <StarHalf
          className={`${sizeMap[size]} fill-accent text-accent shrink-0`}
        />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={`${sizeMap[size]} text-border-warm fill-transparent shrink-0`}
        />
      ))}
      {showValue && (
        <span className={`ml-1.5 font-semibold text-text-main ${textSizeMap[size]}`}>
          {clampedRating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
