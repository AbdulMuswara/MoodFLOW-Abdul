export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Log Your Daily Mood",
      description: "Choose how you're feeling on a simple 1-5 scale. Add notes about what you worked on or what's on your mind."
    },
    {
      number: "2",
      title: "Build Your History",
      description: "Over time, you'll create a personal journal of your mood and activities. Each entry is saved and organized by date."
    },
    {
      number: "3",
      title: "Discover Your Patterns",
      description: "Review your mood trends with visual graphs. Understand what makes you productive and when you feel your best."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">How It Works</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Start tracking in three simple steps</p>
        </div>

        <div className="space-y-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-600/20">
                {step.number}
              </div>
              <div className="pt-2">
                <h3 className="text-2xl font-display font-bold mb-2">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
