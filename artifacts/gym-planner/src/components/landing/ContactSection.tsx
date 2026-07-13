import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitContact } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Globe, MapPin, Mail, ArrowRight } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export function ContactSection() {
  const { toast } = useToast();
  const submitContact = useSubmitContact();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitContact.mutate(
      { 
        data: {
          ...values,
          type: "contact"
        } 
      },
      {
        onSuccess: () => {
          toast({
            title: "Message Sent",
            description: "We'll get back to you within 24 hours.",
          });
          form.reset();
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Something went wrong. Please try again later.",
          });
        }
      }
    );
  }

  return (
    <section id="contact" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Need Personal Coaching?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take your transformation beyond the AI. Reach out for 1-on-1 specialized consulting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto items-start">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-8 md:p-12 rounded-[2rem] border-primary/20 bg-gradient-to-br from-card to-card/50"
          >
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-display font-bold text-3xl mb-8 shadow-lg shadow-primary/20">
              TI
            </div>
            <h3 className="text-3xl font-display font-bold mb-2">Tarik Islam</h3>
            <p className="text-primary font-medium mb-8">Elite Fitness Architect & Developer</p>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4 text-muted-foreground">
                <Globe className="w-5 h-5 text-primary" />
                <a href="https://tarikislam.in" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">tarikislam.in</a>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span>contact@tarikislam.in</span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Global Online Coaching</span>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/10">
              <h4 className="font-bold mb-4 uppercase tracking-wider text-sm text-muted-foreground">Available Services</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium">
                {['Personal Training', 'Diet Consultation', 'Fitness Coaching', 'AI Solutions', 'Website Development', 'Digital Marketing'].map((service, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass-panel p-8 md:p-10 rounded-[2rem]">
              <h3 className="text-2xl font-display font-bold mb-6">Send a Message</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="bg-black/20 border-white/10 focus-visible:border-primary h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" type="email" className="bg-black/20 border-white/10 focus-visible:border-primary h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Coaching Inquiry" className="bg-black/20 border-white/10 focus-visible:border-primary h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell me about your goals..." 
                            className="bg-black/20 border-white/10 focus-visible:border-primary min-h-[120px] resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg group"
                    disabled={submitContact.isPending}
                  >
                    {submitContact.isPending ? "Sending..." : "Send Message"}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
