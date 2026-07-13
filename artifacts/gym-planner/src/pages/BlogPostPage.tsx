import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/landing/Navbar";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default function BlogPostPage() {
  const { slug } = useParams();
  
  const { data: blog, isLoading, isError } = useQuery({
    queryKey: ["public", "blog", slug],
    queryFn: async () => {
      const BASE = import.meta.env.BASE_URL || "/";
      const r = await fetch(`${BASE}api/blogs/${slug}`.replace("//api", "/api"));
      if (!r.ok) throw new Error("Blog post not found");
      return r.json();
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <h1 className="text-4xl font-display font-bold">Post Not Found</h1>
          <p className="text-muted-foreground text-center">The article you're looking for doesn't exist or was removed.</p>
          <Link href="/" className="text-primary hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-4 md:px-6">
        <article className="container mx-auto max-w-3xl">
          
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-10 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium text-white">By Tarik Islam</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </header>

          <div className="glass-panel p-8 md:p-12 rounded-3xl">
            <div className="prose prose-invert prose-yellow max-w-none text-gray-300 whitespace-pre-wrap font-sans leading-relaxed text-lg">
              {blog.content}
            </div>
          </div>

        </article>
      </main>
    </div>
  );
}
