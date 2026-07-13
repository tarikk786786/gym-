import { useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dumbbell, Download, ArrowRight, Zap, Users, ShieldCheck, Activity } from "lucide-react";
import heroBgPath from "@assets/generated_images/hero_bg.jpg";

export function HeroSection() {
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
              transition={{ delay: 1, duration: 0.5 }}
            >
              <Button asChild size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold gap-2">
                <Link href="/sign-up">
                  Generate AI Plan <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-14 px-8 border-white/20 hover:bg-white/5 text-lg font-medium gap-2 glass-panel">
                <Download className="w-5 h-5" /> Download PDF Sample
              </Button>
            </motion.div>
          </div>
          
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative flex justify-center perspective-1000">
            <motion.div
              className="w-full aspect-square relative z-10"
              initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Abstract 3D floating visual - CSS only */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-primary/40 absolute"
                  animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="w-56 h-56 md:w-72 md:h-72 rounded-full border border-primary/20 absolute"
                  animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="w-32 h-64 bg-gradient-to-b from-primary/80 to-primary/20 rounded-full blur-xl absolute"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="relative z-10 w-full h-full flex items-center justify-center text-primary drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]"
                  animate={{ y: [-15, 15, -15] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* High quality SVG Dumbbell representation */}
                  <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-32 h-32 md:w-48 md:h-48 text-primary">
                    <path d="M14.4 14.4 9.6 9.6" />
                    <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
                    <path d="m21.5 21.5-1.4-1.4" />
                    <path d="M3.9 3.9 2.5 2.5" />
                    <path d="M6.404 2.768a2 2 0 1 1 2.829 2.829l1.768-1.767a2 2 0 1 1 2.828 2.828L7.465 13.023a2 2 0 1 1-2.828-2.829l1.768-1.768a2 2 0 1 1-2.829-2.828z" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="mt-20 md:mt-32 pt-10 border-t border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            {stats.map((stat, index) => (
              <StatCounter key={index} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCounter({ stat, index }: { stat: any, index: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  
  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * stat.value));

      if (currentStep >= steps) {
        setCount(stat.value);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, stat.value]);

  const Icon = stat.icon;

  return (
    <motion.div 
      ref={ref}
      className="flex flex-col items-center md:items-start space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-1">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl md:text-4xl font-display font-bold text-foreground">
        {stat.prefix}{count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {stat.label}
      </div>
    </motion.div>
  );
}

function ParticleSystem() {
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, duration: number, delay: number, color: string}>>([]);
  
  useEffect(() => {
    // Generate particles only on client
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
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: 0.2
          }}
          animate={{
            y: ["0%", "-100%"],
            x: ["0%", `${Math.random() * 20 - 10}%`],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
