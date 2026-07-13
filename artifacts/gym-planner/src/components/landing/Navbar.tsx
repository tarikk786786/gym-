import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Menu, X, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/react";
import { Link } from "wouter";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Transformations", href: "#transformations" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "py-5 bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg hidden sm:inline-block tracking-tight">
            Tarik Islam <span className="text-primary">AI Gym Planner</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-muted transition-colors text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">Hi, {user?.firstName}</span>
                <Link href="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Button variant="ghost" className="rounded-full px-6" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button asChild variant="ghost" className="rounded-full px-6">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6">
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-muted transition-colors text-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            className="p-2 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-background flex flex-col p-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-lg">Tarik Islam AI</span>
              </div>
              <button
                className="p-2 text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <ul className="flex flex-col gap-6 text-xl font-display font-semibold">
              {navLinks.map((link) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <a
                    href={link.href}
                    className="block hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
            
            <div className="mt-auto pb-8 flex flex-col gap-4">
              {isSignedIn ? (
                <>
                  <Button asChild className="w-full rounded-full h-12 text-lg font-bold bg-primary text-primary-foreground">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="outline" className="w-full rounded-full h-12 text-lg font-bold" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="w-full rounded-full h-12 text-lg font-bold bg-primary text-primary-foreground">
                    <Link href="/sign-up">Get Started Free</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-full h-12 text-lg font-bold">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
