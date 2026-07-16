"use client";

import { cn } from "@/shared/lib/utils";

export const ANIMATED_STICKERS = {
  soQue: "/stickers/animated/01-so-que.mp4",
  waiting: "/stickers/animated/02-waiting-queue.mp4",
  timeout: "/stickers/animated/03-timeout.mp4",
  accepted: "/stickers/animated/04-invite-accepted.mp4",
  drunkHappy: "/stickers/animated/05-drunk-happy.mp4",
  chienThan: "/stickers/animated/06-chien-than.mp4",
  safeRide: "/stickers/animated/07-safe-ride.mp4",
  idle: "/stickers/animated/08-idle-float.mp4",
  peek: "/stickers/animated/09-excited-peek.mp4",
  group: "/stickers/animated/10-group-celebration.mp4",
} as const;

export type AnimatedStickerKey = keyof typeof ANIMATED_STICKERS;

type AnimatedStickerProps = {
  name: AnimatedStickerKey;
  alt: string;
  size?: number;
  className?: string;
  glow?: boolean;
};

/**
 * Looping MP4 sticker for Night Amber landing.
 * Uses autoplay + muted + loop (required for silent autoplay in browsers).
 */
export function AnimatedSticker({
  name,
  alt,
  size = 96,
  className,
  glow = true,
}: AnimatedStickerProps) {
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
      role="img"
      aria-label={alt || undefined}
    >
      <video
        src={ANIMATED_STICKERS[name]}
        autoPlay
        muted
        loop
        playsInline
        width={size}
        height={size}
        className={cn(
          "size-full object-cover object-center",
          glow && "drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]",
        )}
      />
    </span>
  );
}
