import { useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dumbbell, Download, ArrowRight, Zap, Users, ShieldCheck, Activity } from "lucide-react";
import heroBgPath from "@assets/generated_images/hero_bg.jpg";

export function HeroSection() {
  const [, navigate] = useLocation();
  const headline = "Your AI Personal Trainer. 24/7.";
  const words = headline.split(" ");
  
  const stats = [
    { label: "Plans Generated", value: 12400, prefix: "", suffix: "+", icon: Zap },
    { label: "User Satisfaction", value: 98, prefix: "", suffix: "%", icon: Users },
    { label: "Workout Styles", value: 50, prefix: "", suffix: "+", icon: Dumbbell },
    { label: "Nutrition Plans", value: 15, prefix: "", suffix: "+", icon: Activity },
  ];

  return (
    <section className="relative min-h-[100dvh] flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10"></div>
        {/* Dynamic mesh gradient feel */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] z-10 mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[150px] z-10 mix-blend-screen opacity-40"></div>
        <img 
          src={heroBgPath} 
          alt="Cinematic luxury gym environment" 
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        <ParticleSystem />
      </div>

      <div className="container relative z-20 mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          <div className="flex-1 text-center lg:text-left mt-12 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-primary/30 text-primary mb-6 text-sm font-medium"
            >
              <Zap className="w-4 h-4 fill-primary" />
              <span>Next-Generation Fitness Technology</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.1] mb-6">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  className={`inline-block mr-3 lg:mr-4 ${word === "AI" || word === "Trainer." ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-300 text-glow" : ""}`}
                  initial={{ opacity: 0, y: 50, rotateZ: 5 }}
                  animate={{ opacity: 1, y: 0, rotateZ: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 100 }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Generate elite workout plans, precision diet blueprints, and track your transformation — powered by artificial intelligence.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <Button
                size="lg"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 h-14 text-lg gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                onClick={() => navigate("/")}
              >
                <Dumbbell className="w-5 h-5" />
                Get My Free Plan
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-14 text-lg gap-2 border-border/50 hover:border-primary/50"
                onClick={() => navigate("/")}
              >
                <Download className="w-5 h-5" />
                Get Free PDF Plan
              </Button>
            </motion.div>

            <motion.div 
              className="flex flex-wrap items-center gap-6 mt-8 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {[
                { icon: ShieldCheck, text: "No credit card" },
                { icon: Zap, text: "Instant PDF" },
                { icon: Users, text: "12,400+ plans generated" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm lg:max-w-xs flex-shrink-0">
            {stats.map(({ label, value, prefix, suffix, icon: Icon }, i) => (
              <StatCard key={label} label={label} value={value} prefix={prefix} suffix={suffix} Icon={Icon} delay={i * 0.15} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, prefix, suffix, Icon, delay }: {
  label: string; value: number; prefix: string; suffix: string;
  Icon: React.ComponentType<{ className?: string }>; delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    controls.start({ opacity: 1, y: 0 });
    let start = 0;
    const step = value / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value, controls]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={controls}
      transition={{ delay, duration: 0.5 }}
      className="glass-panel rounded-2xl p-4 text-center border border-primary/10"
    >
      <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
      <div className="text-2xl font-bold font-display">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}

function ParticleSystem() {
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, duration: number, delay: number, color: string}>>([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 10,
      color: Math.random() > 0.5 ? 'bg-primary' : 'bg-white'
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${p.color}`}
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: 0.2 }}
          animate={{ y: ["0%", "-100%"], x: ["0%", `${Math.random() * 20 - 10}%`], opacity: [0, 0.5, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}
