import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Dumbbell, Utensils, LineChart, MessageSquare, FileText, Calculator } from "lucide-react";
import featureBgPath from "@assets/generated_images/feature_bg.jpg";

const features = [
  {
    title: "AI Workout Generator",
    description: "Personalized plans for every goal and experience level, adapting as you progress.",
    icon: Dumbbell,
  },
  {
    title: "AI Diet Planner",
    description: "Complete meal plans with exact macros, automated shopping lists & budget constraints.",
    icon: Utensils,
  },
  {
    title: "Progress Tracker",
    description: "Visual charts, body measurements, PR logging, achievement badges and weekly reports.",
    icon: LineChart,
  },
  {
    title: "AI Coach",
    description: "24/7 intelligent chat coach with voice support for real-time form checks and motivation.",
    icon: MessageSquare,
  },
  {
    title: "PDF Reports",
    description: "Luxury branded PDF fitness reports to download, print, or share with your community.",
    icon: FileText,
  },
  {
    title: "Fitness Calculators",
    description: "Advanced tools for BMI, TDEE, macros, one-rep max, body fat percentage, and 10+ more.",
    icon: Calculator,
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  } as const;

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
        <img src={featureBgPath} alt="" className="w-full h-full object-cover mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-4">Precision Engineering</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold mb-6">Everything You Need to Transform</h3>
            <p className="text-lg text-muted-foreground">
              A comprehensive suite of professional-grade tools powered by artificial intelligence, designed for those who demand excellence in their fitness journey.
            </p>
          </motion.div>
        </div>

        <motion.div 
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-panel p-8 rounded-[1.5rem] relative group hover:border-primary/50 transition-colors duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h4 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
