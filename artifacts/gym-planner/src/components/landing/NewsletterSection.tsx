import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubscribeNewsletter } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function NewsletterSection() {
  const { toast } = useToast();
  const subscribe = useSubscribeNewsletter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    subscribe.mutate(
      { data: { email: values.email } },
      {
        onSuccess: () => {
          toast({
            title: "Subscribed Successfully",
            description: "Welcome to the elite circle. Check your inbox.",
          });
          form.reset();
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not subscribe. Please try again.",
          });
        }
      }
    );
  }

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-black to-black z-0"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay z-0"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="glass-panel border-primary/30 rounded-[2rem] p-8 md:p-16 max-w-5xl mx-auto overflow-hidden relative">
          {/* Internal gradient strip */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left flex-1">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Join 12,000+ Fitness Enthusiasts</h2>
              <p className="text-lg text-muted-foreground">
                Get weekly AI-curated fitness insights, exclusive PDF templates, and early access to new features.
              </p>
            </div>
            
            <div className="w-full lg:w-auto flex-1 max-w-md">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex-1 w-full">
                        <FormControl>
                          <Input 
                            placeholder="Enter your email" 
                            className="h-14 rounded-full bg-black/40 border-white/20 focus-visible:border-primary px-6 text-lg w-full" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-bold text-lg whitespace-nowrap shrink-0 w-full sm:w-auto"
                    disabled={subscribe.isPending}
                  >
                    {subscribe.isPending ? "Joining..." : "Subscribe"}
                  </Button>
                </form>
              </Form>
              <p className="text-xs text-muted-foreground mt-4 text-center lg:text-left">
                No spam. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
