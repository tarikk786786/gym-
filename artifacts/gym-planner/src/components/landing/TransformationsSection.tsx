import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const transformations = [
  { name: "Alex K.", stats: "Lost 22kg in 4 months", plan: "Fat Loss Elite", gradient: "from-blue-500/20 to-blue-900/40" },
  { name: "Jordan M.", stats: "Gained 8kg muscle", plan: "Hypertrophy Pro", gradient: "from-amber-500/20 to-amber-900/40" },
  { name: "Sam T.", stats: "Dropped 12% body fat", plan: "Recomp AI", gradient: "from-emerald-500/20 to-emerald-900/40" },
  { name: "Casey R.", stats: "Bench PR +30kg", plan: "Strength Protocol", gradient: "from-purple-500/20 to-purple-900/40" },
  { name: "Taylor P.", stats: "First Marathon Done", plan: "Endurance Prep", gradient: "from-rose-500/20 to-rose-900/40" },
  { name: "Morgan L.", stats: "Complete lifestyle shift", plan: "Beginner Reboot", gradient: "from-cyan-500/20 to-cyan-900/40" },
];

export function TransformationsSection() {
  return (
    <section id="transformations" className="py-24 bg-card/20 border-y border-border/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Transformations That Speak</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visual proof of the AI engine's capability. Real data, real dedication, real results.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {transformations.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 50 }}
              className="group cursor-pointer"
            >
              <div className="glass-panel p-2 rounded-3xl overflow-hidden relative aspect-[4/5]">
                {/* Silhouette placeholder with gradient to suggest a figure/transformation */}
                <div className={`w-full h-full rounded-2xl bg-gradient-to-tr ${t.gradient} relative overflow-hidden flex flex-col justify-end p-6`}>
                  {/* Abstract graphic replacing an actual photo */}
                  <div className="absolute inset-0 opacity-30 mix-blend-overlay">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M0,100 C30,80 70,80 100,100 L100,0 L0,0 Z" fill="currentColor" className="text-black/50" />
                      <circle cx="50" cy="40" r="20" fill="currentColor" className="text-white/20 blur-xl" />
                    </svg>
                  </div>
                  
                  {/* Overlay content */}
                  <div className="relative z-10 glass-panel rounded-2xl p-5 border-white/10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold font-display">{t.name}</h4>
                      <ArrowUpRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-2xl font-bold text-primary mb-2 tracking-tight">
                      {t.stats}
                    </div>
                    <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-white">
                      {t.plan}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
