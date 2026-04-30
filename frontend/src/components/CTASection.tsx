import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-brand px-8 py-20 text-center text-white shadow-2xl shadow-brand-600/30">
          {/* Animated decorative circles */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ready to Understand Your Mood?</h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed font-sans">
              Join students who are already tracking their way to better self-awareness.
              Start your journey today.
            </p>
            <Link href="/signup" className="px-10 py-4 bg-white text-brand-600 hover:bg-slate-50 rounded-2xl font-bold transition-all shadow-xl hover:-translate-y-1 active:scale-95 inline-block">
              Get Started - It&apos;s Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
