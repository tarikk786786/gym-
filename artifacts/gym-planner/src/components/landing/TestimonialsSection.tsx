import { useRef } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Marcus J.",
    goal: "Gained 6kg muscle",
    quote: "I've used Fitbod and Strong, but this AI planner is on another level. The way it adapts when I'm fatigued or miss a day is genuinely intelligent.",
    rating: 5,
    initials: "MJ",
    color: "bg-blue-600"
  },
  {
    name: "Priya S.",
    goal: "Lost 18kg in 6 months",
    quote: "The diet plans finally made sense. Having a personalized Indian cuisine macro-balanced plan generated in seconds changed everything for me.",
    rating: 5,
    initials: "PS",
    color: "bg-purple-600"
  },
  {
    name: "David W.",
    goal: "Marathon prep",
    quote: "The PDF reports look so professional my actual running coach was impressed. The premium feel of the whole platform keeps me motivated.",
    rating: 5,
    initials: "DW",
    color: "bg-emerald-600"
  },
  {
    name: "Sarah L.",
    goal: "Rehab & Mobility",
    quote: "I inputted my shoulder injury and the AI completely worked around it, suggesting perfect alternatives. Felt like working with a high-end PT.",
    rating: 5,
    initials: "SL",
    color: "bg-rose-600"
  },
  {
    name: "James T.",
    goal: "Powerlifting Prep",
    quote: "The 1RM calculators and peaking programs it generates are mathematically sound. Hit a 20kg PR on my deadlift using the Elite tier.",
    rating: 5,
    initials: "JT",
    color: "bg-amber-600"
  },
  {
    name: "Elena R.",
    goal: "General fitness",
    quote: "I love the UI. It's dark, sleek, and doesn't look like a generic colorful fitness app. It feels like a serious tool for serious people.",
    rating: 5,
    initials: "ER",
    color: "bg-indigo-600"
  }
];

export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "center",
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2, align: "start" },
      '(min-width: 1024px)': { slidesToScroll: 3, align: "start" }
    }
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <section id="testimonials" className="py-24 bg-background overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Real People. Real Results.</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of athletes and fitness enthusiasts who have transformed their bodies using our intelligent coaching engine.
            </p>
          </motion.div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors h-12 w-12"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors h-12 w-12"
              onClick={scrollNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex cursor-grab active:cursor-grabbing">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 md:pl-6 first:pl-0">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-panel p-8 rounded-3xl h-full flex flex-col relative"
                >
                  <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  
                  <p className="text-lg leading-relaxed mb-8 flex-1 italic text-foreground/90">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <div className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {testimonial.initials}
                    </div>
                    <div>
                      <h4 className="font-bold font-display">{testimonial.name}</h4>
                      <p className="text-sm text-primary font-medium">{testimonial.goal}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
