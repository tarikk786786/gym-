import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "For casual gym-goers wanting to test the waters.",
    features: [
      "Basic fitness calculators",
      "1 AI workout plan per month",
      "Community forum access",
      "Standard email support"
    ],
    cta: "Start Free",
    popular: false,
    highlight: false
  },
  {
    name: "Pro",
    price: "19",
    description: "The complete AI toolkit for serious body transformation.",
    features: [
      "Unlimited AI plan regenerations",
      "Full diet & macro blueprint",
      "24/7 AI Chat Coach access",
      "Advanced progress tracking",
      "Downloadable luxury PDF reports",
      "Priority customer support"
    ],
    cta: "Get Pro",
    popular: true,
    highlight: true
  },
  {
    name: "Elite",
    price: "49",
    description: "Maximum precision for competitive athletes.",
    features: [
      "Everything in Pro",
      "1x Monthly live 1-on-1 coaching",
      "Custom branding on PDFs",
      "API access for raw data",
      "Advanced peaking & prep protocols",
      "Direct WhatsApp line to Tarik"
    ],
    cta: "Apply for Elite",
    popular: false,
    highlight: false
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Choose Your Transformation</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparent pricing. Cancel anytime. Invest in the architecture of your physique.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -10 }}
              className={`relative glass-panel rounded-3xl p-8 flex flex-col h-full ${
                plan.highlight 
                  ? 'border-primary/50 shadow-[0_0_30px_rgba(255,215,0,0.15)] md:-mt-8 md:mb-8 md:pb-12 bg-card/80' 
                  : 'border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-display font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              
              <ul className="flex flex-col gap-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 ${plan.highlight ? 'text-primary' : 'text-primary/70'}`} />
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                size="lg" 
                className={`w-full h-14 rounded-full font-bold text-lg ${
                  plan.highlight 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-white/10 text-foreground hover:bg-white/20'
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
