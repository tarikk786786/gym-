import { Dumbbell, Instagram, Youtube, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background pt-20 pb-10 border-t border-white/5 relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:scale-105 transition-transform">
                <Dumbbell className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">
                Tarik Islam <span className="text-primary">AI</span>
              </span>
            </a>
            <p className="text-muted-foreground max-w-sm leading-relaxed mb-8">
              The world's most advanced artificial intelligence engine for physical transformation. Precision engineering for the human body.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Youtube className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
            </div>
          </div>
          
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Legal</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Tarik Islam AI Gym Planner. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed & Developed by <a href="https://tarikislam.in" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Tarik Islam</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon }: { href: string, icon: React.ReactNode }) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
    >
      {icon}
    </a>
  );
}
