"use client";

import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import {
  ArrowRightIcon,
  CarFrontIcon,
  CheckCircle2Icon,
  ListOrderedIcon,
  MessageCircleIcon,
  RadioIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  TimerIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { AnimatedSticker } from "./animated-sticker";
import { LandingAuthRedirect } from "./auth-redirect";
import { Sticker } from "./sticker";

const primaryCta =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-amber-glow transition-colors hover:bg-[#D97706] active:scale-[0.98]";

const secondaryCta =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-6 text-base font-semibold text-foreground transition-colors hover:bg-muted/60 active:scale-[0.98]";

/**
 * High-converting marketing landing — Night Amber Social + sticker-memes.
 * Stickers are emotional accents; hierarchy stays premium and dark.
 */
export function LandingPage() {
  return (
    <div
      id="top"
      className="relative min-h-full overflow-x-hidden bg-[#0B0F19] text-[#F9FAFB]"
    >
      <LandingAuthRedirect />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(245,158,11,0.22),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-24 size-72 rounded-full bg-[radial-gradient(circle,rgba(49,46,129,0.45),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[28rem] -right-20 size-80 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.12),transparent_70%)] blur-3xl"
      />

      <LandingNav />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TrustSection />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}

function LandingNav() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6">
      <Link
        href="#top"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl font-semibold tracking-tight"
      >
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-amber-glow">
          LN
        </span>
        <span className="text-base">LiquidNetwork</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href={routes.login}
          className="hidden min-h-11 items-center rounded-xl px-3 text-sm font-medium text-[#9CA3AF] transition-colors hover:text-[#F9FAFB] sm:inline-flex"
        >
          Đăng nhập
        </Link>
        <Link
          href={routes.register}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-amber-glow hover:bg-[#D97706]"
        >
          Bắt đầu
        </Link>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-6 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:pb-24 md:pt-10">
      <div className="relative space-y-6 text-center md:text-left">
        <p className="relative z-10 inline-flex items-center gap-2 rounded-full border border-[#374151] bg-[#111827]/80 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
          <SparklesIcon className="size-3.5" />
          LiquidNetwork Super App
        </p>
        <div className="relative">
          {/* “Sợ quê” sticker — composition accent near headline */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-2 right-0 z-0 sm:-right-2 sm:top-0 md:-right-6 md:-top-3 lg:-right-10"
          >
            <AnimatedSticker
              name="soQue"
              alt="Sợ quê"
              size={88}
              className="rotate-[-10deg] opacity-95 max-md:h-16 max-md:w-16 md:rotate-[-12deg]"
            />
          </div>
          <h1 className="relative z-10 max-w-[16ch] pr-14 text-balance text-3xl font-bold leading-tight tracking-tight sm:max-w-[18ch] sm:pr-20 sm:text-4xl md:pr-24 md:text-[2.75rem] md:leading-[1.15]">
            Hết{" "}
            <span className="bg-gradient-to-r from-primary to-[#FB7185] bg-clip-text text-transparent">
              sợ quê
            </span>{" "}
            khi rủ nhậu
          </h1>
        </div>
        <p className="relative z-10 mx-auto max-w-lg text-pretty text-base leading-relaxed text-[#9CA3AF] md:mx-0 md:text-[17px]">
          <strong className="font-semibold text-[#F9FAFB]">
            Sequential Invite Queue
          </strong>{" "}
          mời tuần tự theo thứ tự ưu tiên — không spam, không bối rối, đúng
          người, đúng lúc. Xem trước Hồ sơ giao lưu, Chỉ số phù hợp và luôn có giải pháp
          Đồng hành về nhà an toàn.
        </p>
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
          <Link href={routes.register} className={primaryCta}>
            Tạo tài khoản miễn phí
            <ArrowRightIcon className="size-4" />
          </Link>
          <Link href={routes.login} className={secondaryCta}>
            Đã có tài khoản
          </Link>
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-[#9CA3AF] md:justify-start">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2Icon className="size-3.5 text-[#84CC16]" />
            Mobile-first
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2Icon className="size-3.5 text-[#84CC16]" />
            Peer review thật
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2Icon className="size-3.5 text-[#84CC16]" />
            Đồng hành về nhà
          </span>
        </div>
      </div>

      <HeroPhoneMockup />
    </section>
  );
}

function HeroPhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_30%,rgba(245,158,11,0.25),transparent_65%)] blur-xl"
      />

      {/* Happy accepted sticker floating on mockup */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-4 -left-2 z-20 sm:-left-6 sm:top-2"
      >
        <AnimatedSticker
          name="accepted"
          alt="Được chấp nhận"
          size={100}
          className="rotate-[-14deg] sm:rotate-[-18deg]"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1 bottom-16 z-20 hidden sm:block sm:-right-8"
      >
        <AnimatedSticker
          name="waiting"
          alt="Đang chờ trong queue"
          size={72}
          className="rotate-[12deg] opacity-95"
        />
      </div>

      <div className="relative z-10 overflow-hidden rounded-[1.75rem] border border-[#374151] bg-[#111827] p-3 shadow-amber-glow ring-1 ring-primary/20">
        <div className="overflow-hidden rounded-[1.25rem] border border-[#374151]/80 bg-[#0B0F19]">
          <div className="flex items-center justify-between px-4 py-2 text-[10px] text-[#9CA3AF]">
            <span className="font-mono">21:30</span>
            <span className="font-medium text-primary">Queue Live</span>
            <span className="font-mono">5G</span>
          </div>
          <div className="space-y-3 px-4 pb-5 pt-2">
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-center">
              <p className="text-[10px] font-medium tracking-widest text-primary uppercase">
                Đang mời
              </p>
              <div className="mx-auto mt-3 flex size-14 items-center justify-center rounded-2xl bg-primary/20 text-xl font-bold text-primary">
                M
              </div>
              <p className="mt-2 text-sm font-semibold">Minh Bia</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-primary">
                00:42
              </p>
              <p className="text-[11px] text-[#9CA3AF]">Timeout còn lại</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[#374151] bg-[#111827] py-2.5 text-center text-xs font-semibold text-[#FB7185]">
                Từ chối
              </div>
              <div className="rounded-xl bg-primary py-2.5 text-center text-xs font-semibold text-primary-foreground shadow-amber-glow">
                Chấp nhận
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-[#9CA3AF]">
                Hàng chờ còn lại
              </p>
              {["Lan Chill", "Hà Networking", "Huy Chiến"].map((name, i) => (
                <div
                  key={name}
                  className="flex items-center gap-2 rounded-xl border border-[#374151] bg-[#111827] px-2.5 py-2"
                >
                  <span className="flex size-6 items-center justify-center rounded-lg bg-[#312E81]/60 text-[10px] font-bold">
                    {i + 2}
                  </span>
                  <span className="text-xs font-medium">{name}</span>
                  <span className="ml-auto text-[10px] text-[#9CA3AF]">
                    Chờ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="relative mt-3 text-center text-[11px] text-[#9CA3AF]">
        Sequential Invite Queue — mời tuần tự, không spam
      </p>
    </div>
  );
}

function ProblemSection() {
  const problems = [
    {
      sticker: "soQue" as const,
      title: "Sợ quê khi rủ rê",
      body: "Muốn rủ nhưng ngại bị từ chối — nhắn một người đã căng, đừng nói nhóm.",
    },
    {
      sticker: "giaiSau" as const,
      title: "Phải nhắn mời từng người",
      body: "Copy-paste khắp group, tag lung tung — mệt, rối, và dễ mất hình ảnh.",
    },
    {
      sticker: "timeout" as const,
      title: "Không hiểu rõ mức độ phù hợp",
      body: "Ghép bàn mù: ai phong cách thế nào, hiểu rõ nhau để gặp gỡ tự tin hơn.",
    },
  ];

  return (
    <section className="relative z-10 border-t border-[#374151]/60 bg-[#0B0F19] px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Vấn đề thật
          </p>
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Văn hóa nhậu Việt — vui thì vui thật, nhưng rủ rê quá cồng kềnh
          </h2>
          <p className="text-sm leading-relaxed text-[#9CA3AF] md:text-base">
            LiquidNetwork được thiết kế đúng từ những khoảnh khắc khó xử nhất
            khi rủ nhau ra bàn.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {problems.map((p) => (
            <div
              key={p.title}
              className="flex flex-row items-start gap-4 rounded-2xl border border-[#374151] bg-[#111827] p-5 sm:flex-col"
            >
              <Sticker name={p.sticker} alt="" size={80} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const flow = [
    {
      sticker: "waiting" as const,
      label: "Đang chờ",
      title: "Mời người #1",
      body: "Chỉ một người active — countdown rõ ràng.",
    },
    {
      sticker: "timeout" as const,
      label: "Timeout",
      title: "Không phản hồi",
      body: "Hết giờ hoặc từ chối → queue advance.",
    },
    {
      sticker: "peek" as const,
      label: "Next",
      title: "Người kế tiếp",
      body: "Tự chuyển theo thứ tự ưu tiên bạn xếp.",
    },
    {
      sticker: "accepted" as const,
      label: "Match",
      title: "Được chấp nhận",
      body: "Vào bàn — tự tin, đúng người.",
    },
  ];

  return (
    <section className="relative z-10 px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Cơ chế độc quyền
          </p>
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Sequential Invite Queue
          </h2>
          <p className="text-sm leading-relaxed text-[#9CA3AF] md:text-base">
            Mời có trật tự như xếp hàng — lịch sự với người được mời, tự tin với
            chính bạn.
          </p>
        </div>

        {/* Emotional queue story via stickers */}
        <div className="mt-10 overflow-x-auto pb-2">
          <ol className="mx-auto flex min-w-[640px] max-w-4xl items-stretch justify-between gap-2 px-1 sm:min-w-0 sm:gap-3">
            {flow.map((step, i) => (
              <li
                key={step.label}
                className="relative flex flex-1 flex-col items-center rounded-2xl border border-[#374151] bg-[#111827] px-2 py-4 text-center ring-1 ring-primary/10 sm:px-3"
              >
                <span className="mb-1 text-[10px] font-semibold tracking-wide text-primary uppercase">
                  {step.label}
                </span>
                <AnimatedSticker
                  name={step.sticker}
                  alt={step.title}
                  size={80}
                />
                <h3 className="mt-2 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1 text-[11px] leading-snug text-[#9CA3AF] sm:text-xs">
                  {step.body}
                </p>
                {i < flow.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-1/2 -right-2 z-10 hidden -translate-y-1/2 text-primary sm:block md:-right-2.5"
                  >
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "01",
              title: "Chọn & xếp ưu tiên",
              body: "Thêm người muốn mời, kéo thứ tự — ai quan trọng nhất lên đầu.",
              icon: ListOrderedIcon,
            },
            {
              n: "02",
              title: "Timeout đếm ngược",
              body: "Chỉ một người được mời tại một thời điểm. Countdown rõ ràng.",
              icon: TimerIcon,
            },
            {
              n: "03",
              title: "Tự advance hàng chờ",
              body: "Từ chối hoặc hết giờ → queue chuyển ngay sang người kế.",
              icon: RadioIcon,
            },
          ].map((s) => (
            <div
              key={s.n}
              className="relative overflow-hidden rounded-2xl border border-[#374151] bg-[#111827] p-5 ring-1 ring-primary/10"
            >
              <span className="font-mono text-3xl font-bold tabular-nums text-primary/25">
                {s.n}
              </span>
              <span className="mt-3 flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-[#111827] to-[#312E81]/30 p-5 md:p-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex max-w-xl flex-col items-center gap-3 text-center md:flex-row md:items-start md:text-left">
              <Sticker name="fullQueue" alt="" size={72} className="shrink-0" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Không còn “mời 10 người cùng lúc”
                </h3>
                <p className="text-sm text-[#9CA3AF]">
                  Một luồng mời duy nhất. Real-time cập nhật. Accept / Reject
                  rõ ràng. Kết thúc bằng match — hoặc chuyển người tiếp theo.
                </p>
              </div>
            </div>
            <Link href={routes.register} className={cn(primaryCta, "shrink-0")}>
              Thử Queue ngay
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: UserRoundIcon,
      sticker: "drunkHappy" as const,
      title: "Hồ sơ Giao lưu",
      body: "Profile: nghề nghiệp, giới thiệu, lịch sử gặp mặt — biết mình đang kết nối với ai.",
    },
    {
      icon: StarIcon,
      sticker: "chienThan" as const,
      title: "Chỉ số phù hợp",
      body: "4 cấp độ linh hoạt — giúp ghép bàn đồng điệu, tránh khó xử.",
    },
    {
      icon: UsersIcon,
      sticker: "networking" as const,
      title: "Chế độ Tranh luận sôi nổi",
      body: "Nhiều chế độ linh hoạt, có disclaimer khi cần thiết để tránh hiểu lầm.",
    },
    {
      icon: CarFrontIcon,
      sticker: "safeRide" as const,
      title: "Đồng hành về nhà",
      body: "Ưu tiên an toàn di chuyển, hỗ trợ gọi Xanh SM / Grab / Gojek nhanh chóng.",
    },
    {
      icon: MessageCircleIcon,
      sticker: "giaiSau" as const,
      title: "Chat & realtime",
      body: "Chat 1-1 / nhóm trong ngữ cảnh Queue và Session.",
    },
    {
      icon: ShieldCheckIcon,
      sticker: "peerReview" as const,
      title: "Peer Review",
      body: "Đánh giá sau bàn — cộng đồng tự lọc người đáng tin.",
    },
  ];

  return (
    <section className="relative z-10 border-t border-[#374151]/60 bg-[#0B0F19] px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Tính năng
          </p>
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Không chỉ mời — cả vòng đời một buổi giao lưu
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="relative overflow-hidden rounded-2xl border border-[#374151] bg-[#111827] p-5 transition-colors hover:border-primary/30"
            >
              <div className="absolute top-2 right-2 opacity-90">
                <Sticker
                  name={f.sticker}
                  alt=""
                  size={52}
                  className="rotate-[8deg]"
                />
              </div>
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-[#312E81]/50 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 pr-14 text-base font-semibold sm:pr-16">
                {f.title}
              </h3>
              <p className="mt-2 pr-2 text-sm leading-relaxed text-[#9CA3AF]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      sticker: "soQue" as const,
      n: "1",
      title: "Tạo hồ sơ",
      body: "Tên, Phong cách gặp gỡ, giới thiệu — thao tác nhanh chóng.",
    },
    {
      sticker: "waiting" as const,
      n: "2",
      title: "Khám phá hoặc Queue",
      body: "Match theo mode, hoặc mời tuần tự người bạn chọn.",
    },
    {
      sticker: "drunkHappy" as const,
      n: "3",
      title: "Vào bàn & chat",
      body: "Session check-in, chat nhóm, giữ vibe đúng gu.",
    },
    {
      sticker: "safeRide" as const,
      n: "4",
      title: "Về nhà an toàn",
      body: "Safe Ride + peer review — khép vòng có trách nhiệm.",
    },
  ];

  return (
    <section className="relative z-10 px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Cách dùng
          </p>
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            4 bước vào bàn
          </h2>
        </div>
        <ol className="relative mx-auto mt-12 max-w-3xl space-y-4">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className="relative flex gap-3 rounded-2xl border border-[#374151] bg-[#111827] p-4 sm:gap-4 sm:p-5"
            >
              <div className="relative shrink-0">
                <Sticker name={s.sticker} alt="" size={64} />
                <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-primary-foreground shadow-amber-glow">
                  {s.n}
                </span>
              </div>
              <div className="min-w-0 pt-1">
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-[#9CA3AF]">{s.body}</p>
              </div>
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute -bottom-4 left-10 hidden h-4 w-px bg-primary/40 sm:block"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function TrustSection() {
  const quotes = [
    {
      q: "Trước phải nhắn từng đứa, giờ xếp queue — hết sợ quê.",
      a: "Minh, Sales · HCM",
      sticker: "soQue" as const,
    },
    {
      q: "Biết tửu lượng trước khi ra bàn, cuộc vui mượt hơn hẳn.",
      a: "Lan, Designer · HCM",
      sticker: "chienThan" as const,
    },
    {
      q: "Safe Ride sau bàn là thứ mình share cho cả group.",
      a: "Huy, Engineer · HN",
      sticker: "safeRide" as const,
    },
  ];

  return (
    <section className="relative z-10 border-t border-[#374151]/60 bg-[#0B0F19] px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Niềm tin
          </p>
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Xây từ văn hóa giao lưu thực tế — không rập khuôn
          </h2>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-[#9CA3AF]">
          {[
            "Hồ sơ & peer review",
            "An toàn trên hết",
            "Timeout minh bạch",
            "Không ép bia",
          ].map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#374151] bg-[#111827] px-3 py-1.5"
            >
              <ShieldCheckIcon className="size-3.5 text-[#84CC16]" />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {quotes.map((item) => (
            <blockquote
              key={item.a}
              className="relative overflow-hidden rounded-2xl border border-[#374151] bg-[#111827] p-5"
            >
              <div className="absolute top-2 right-2 opacity-80">
                <Sticker name={item.sticker} alt="" size={48} />
              </div>
              <p className="pr-14 text-sm leading-relaxed text-[#F9FAFB]">
                “{item.q}”
              </p>
              <footer className="mt-4 text-xs font-medium text-primary">
                — {item.a}
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3 rounded-2xl border border-[#374151] bg-[#111827] p-5 text-center sm:gap-6">
          {[
            { v: "4", l: "Cấp độ phù hợp" },
            { v: "1", l: "Queue tuần tự" },
            { v: "0", l: "Rủi ro di chuyển" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-mono text-2xl font-bold tabular-nums text-primary sm:text-3xl">
                {s.v}
              </p>
              <p className="mt-1 text-[11px] text-[#9CA3AF] sm:text-xs">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="relative z-10 px-4 py-16 md:px-6 md:py-24">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[1.25rem] border border-primary/30 bg-[#111827] px-6 py-12 text-center shadow-amber-glow md:px-12 md:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(245,158,11,0.2),transparent_60%)]"
        />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-8 sm:text-left">
          <AnimatedSticker
            name="group"
            alt="Chúc mừng — sẵn sàng mời giao lưu"
            size={112}
            className="shrink-0 rotate-[6deg] sm:rotate-[8deg]"
          />
          <div className="relative space-y-5">
            <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
              Sẵn sàng gửi lời mời… không còn sợ quê?
            </h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-[#9CA3AF] sm:mx-0 md:text-base">
              Tham gia LiquidNetwork — Sequential Queue, Hồ sơ giao lưu, Đồng hành về nhà.
              Miễn phí để bắt đầu.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-start">
              <Link href={routes.register} className={primaryCta}>
                Đăng ký ngay
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link href={routes.login} className={secondaryCta}>
                Đăng nhập
              </Link>
            </div>
            <p className="text-[11px] text-[#9CA3AF]">
              Không cần thẻ tín dụng · Mobile-first · Night Amber Social
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-[#374151] bg-[#0B0F19] px-4 py-10 md:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 font-semibold">
            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
              LN
            </span>
            LiquidNetwork
          </div>
          <p className="max-w-xs text-sm text-[#9CA3AF]">
            LiquidNetwork Super App — kết nối cộng đồng giao lưu có trật tự và an toàn.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#9CA3AF]">
          <Link href={routes.login} className="hover:text-primary">
            Đăng nhập
          </Link>
          <Link href={routes.register} className="hover:text-primary">
            Đăng ký
          </Link>
          <Link href={routes.supportFaq} className="hover:text-primary">
            FAQ
          </Link>
          <Link href={routes.support} className="hover:text-primary">
            Hỗ trợ
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-[11px] text-[#9CA3AF] md:text-left">
        © {new Date().getFullYear()} LiquidNetwork. Night Amber Social.
      </p>
    </footer>
  );
}
