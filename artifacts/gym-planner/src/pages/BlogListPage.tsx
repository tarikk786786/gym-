import { Link } from "wouter";
import { useListBlogs } from "@workspace/api-client-react";
import { CalendarDays, ArrowRight, BookOpen } from "lucide-react";

export default function BlogListPage() {
  const { data: posts, isLoading, isError } = useListBlogs();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm hidden sm:inline">AI Gym Planner</span>
          </Link>
          <span className="text-border/60">/</span>
          <span className="text-sm font-semibold text-foreground">Blog</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Fitness <span className="text-primary">Blog</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Expert training advice, nutrition science, and evidence-based tips from Coach Tarik Islam.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-card/50 h-52 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Failed to load posts. Please try again.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && (!posts || posts.length === 0) && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No posts yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Check back soon — content is coming.</p>
          </div>
        )}

        {/* Posts grid */}
        {posts && posts.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="group rounded-2xl border border-border/40 bg-card/50 hover:border-primary/40 hover:bg-card/80 transition-all duration-200 overflow-hidden cursor-pointer h-full flex flex-col">
                  {/* Accent bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/40" />

                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : ""}
                      </div>
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                        Read more <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/30 py-8 text-center text-xs text-muted-foreground/40 mt-12">
        Designed & Developed by{" "}
        <a href="https://tarikislam.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Tarik Islam
        </a>
      </footer>
    </div>
  );
}
