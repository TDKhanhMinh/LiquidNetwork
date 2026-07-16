import Image from "next/image";
import { cn } from "@/shared/lib/utils";

export const STICKERS = {
  soQue: "/stickers/01-so-que.jpg",
  waiting: "/stickers/02-waiting-queue.jpg",
  timeout: "/stickers/03-timeout.jpg",
  accepted: "/stickers/04-invite-accepted.jpg",
  drunkHappy: "/stickers/05-drunk-happy.jpg",
  chienThan: "/stickers/06-chien-than.jpg",
  safeRide: "/stickers/07-safe-ride.jpg",
  networking: "/stickers/08-networking.jpg",
  giaiSau: "/stickers/09-giai-sau.jpg",
  peerReview: "/stickers/10-peer-review.jpg",
  fullQueue: "/stickers/11-full-queue.jpg",
  victory: "/stickers/12-victory.jpg",
  base: "/stickers/00-base-character.jpg",
} as const;

export type StickerKey = keyof typeof STICKERS;

type StickerProps = {
  name: StickerKey;
  alt: string;
  size?: number;
  className?: string;
  /** Soft amber glow + drop shadow for dark surfaces */
  glow?: boolean;
  priority?: boolean;
};

/**
 * Sticker asset for Night Amber landing — sits on dark bg with soft glow.
 * Assets are light-backed JPGs; framed as premium sticker tiles, not raw photos.
 */
export function Sticker({
  name,
  alt,
  size = 96,
  className,
  glow = true,
  priority = false,
}: StickerProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none overflow-hidden rounded-[22%]",
        "ring-1 ring-white/10",
        glow &&
          "after:pointer-events-none after:absolute after:inset-[-12%] after:-z-10 after:rounded-full after:bg-[radial-gradient(circle,rgba(245,158,11,0.32),transparent_70%)] after:blur-[3px]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={STICKERS[name]}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        sizes={`${size}px`}
        className={cn(
          "size-full object-cover object-center",
          glow &&
            "drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]",
        )}
      />
    </span>
  );
}
