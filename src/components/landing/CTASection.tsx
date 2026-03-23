import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 px-6 bg-secondary">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-[24px] md:text-[28px] font-bold text-foreground mb-3">
          Start managing your relay today
        </h2>
        <p className="text-[15px] text-muted-foreground mb-8">
          Free for 1 relay. No credit card. Sign in with GitHub.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#f7931a] text-black text-[15px] font-semibold rounded-md hover:bg-[#e07b10] transition-colors"
        >
          Sign in with GitHub →
        </Link>
      </div>
    </section>
  );
}
