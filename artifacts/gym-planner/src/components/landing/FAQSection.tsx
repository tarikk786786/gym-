import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is this app suitable for beginners?",
    a: "Yes, the AI adapts plans for all levels from complete beginner to advanced athlete. It selects exercises based on your inputted experience level and equipment availability."
  },
  {
    q: "Do I need any equipment?",
    a: "No. We offer both home workout plans (bodyweight only) and full gym programs. Simply tell the AI what you have access to, and it builds the optimal plan."
  },
  {
    q: "How is the diet plan generated?",
    a: "Your AI plan is based on your specific calorie goals, food preferences, cuisine style (e.g., Indian, Mediterranean), and macro targets. It creates realistic meals you'll actually want to eat."
  },
  {
    q: "Can I use this if I have injuries?",
    a: "Yes. The onboarding collects injury and medical info, and the AI adapts your plan accordingly, avoiding contraindicated movements and suggesting rehab-friendly alternatives."
  },
  {
    q: "How often do plans update?",
    a: "You can regenerate a new plan anytime. Pro users get unlimited regenerations, allowing you to adapt on the fly if your schedule or goals change."
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use bank-level encryption and never sell your personal data. Your health metrics and progress photos remain strictly private."
  },
  {
    q: "What languages and cuisines are supported?",
    a: "We support multiple diet styles including Indian, Mediterranean, Keto, Vegan, Paleo, and many more. The AI understands regional ingredients and cultural preferences."
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Absolutely. Cancel with one click in your dashboard, no questions asked. You'll retain access until the end of your current billing cycle."
  }
];

export function FAQSection() {
  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Clarity is power. Everything you need to know about the AI Gym Planner.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full gap-4 flex flex-col">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="glass-panel px-6 py-2 rounded-2xl border-white/10 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-lg font-bold font-display hover:text-primary transition-colors hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
