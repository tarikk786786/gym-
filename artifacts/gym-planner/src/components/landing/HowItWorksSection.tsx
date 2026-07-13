import { motion } from "framer-motion";
import { UserCircle, Zap, TrendingUp } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Tell Us About You",
      description: "Complete a comprehensive profile detailing your age, fitness goals, experience level, dietary preferences, and any physical limitations.",
      icon: UserCircle,
    },
    {
      number: "02",
      title: "AI Generates Your Plan",
      description: "Our proprietary AI engine instantly architects a bespoke workout program and precision diet blueprint optimized for your physiology.",
      icon: Zap,
    },
    {
      number: "03",
      title: "Track & Transform",
      description: "Log your progress, interact with your 24/7 AI coach, download professional PDF reports, and watch your transformation unfold.",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-24 bg-card/30 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Get Your Plan in 3 Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From zero to a world-class personalized fitness protocol in under 60 seconds.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Connector Line Desktop */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-border/50 z-0">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-primary"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 group-hover:border-primary transition-colors duration-300"></div>
                  <motion.span 
                    className="text-3xl font-display font-bold text-primary"
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.number}
                  </motion.span>
                </div>
                
                <h4 className="text-2xl font-display font-bold mb-4">{step.title}</h4>
                <p className="text-muted-foreground leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
