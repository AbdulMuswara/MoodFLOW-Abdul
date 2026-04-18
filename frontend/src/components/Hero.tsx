import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] bg-brand-600 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-[35%] h-[35%] bg-blue-500 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6">
          Track Your Mood, <br />
          <span className="text-gradient">Improve Your Flow</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-sans">
          A simple, beautiful way to understand patterns in your mood and productivity.
          Perfect for students who want to reflect on their daily habits.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/signup" className="w-full sm:w-auto px-8 py-4 text-white bg-brand-600 hover:bg-brand-500 rounded-2xl font-bold shadow-xl shadow-brand-600/25 transition-all hover:-translate-y-1 active:scale-95 inline-block">
            Start Tracking Free
          </Link>
          <Link href="/#how-it-works" className="w-full sm:w-auto px-8 py-4 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl font-bold transition-all inline-block">
            Learn More
          </Link>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative mx-auto max-w-5xl">
          <div className="glass rounded-[2rem] p-4 shadow-2xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden aspect-[16/9] flex flex-col">
              {/* Mockup Header */}
              <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="h-2 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>

              {/* Mockup Content */}
              <div className="flex-1 p-8 grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                  <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
                    ))}
                  </div>
                  <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-t from-brand-600/10 to-transparent" />
                    {/* SVG Graph Placeholder */}
                    <svg className="absolute bottom-0 left-0 w-full h-32 text-brand-400/30" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0,80 Q20,20 40,60 T80,30 T100,50 L100,100 L0,100 Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-8 bg-slate-100 dark:bg-slate-900 rounded-lg w-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/10 backdrop-blur-3xl rounded-3xl -z-10" />
          <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-brand-600/10 backdrop-blur-3xl rounded-[3rem] -z-10" />
        </div>
      </div>
    </section>
  );
}
