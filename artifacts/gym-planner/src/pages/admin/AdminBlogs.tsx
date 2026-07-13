import { useState, useEffect } from "react";
import { useAdminBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog } from "@/lib/admin-api";
import { Plus, Trash2, Save, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminBlogs() {
  const { data: blogs = [], isLoading } = useAdminBlogs();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();
  const { toast } = useToast();

  const [activeBlog, setActiveBlog] = useState<any>(null);
  
  // Editor state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (activeBlog) {
      setTitle(activeBlog.title || "");
      setSlug(activeBlog.slug || "");
      setExcerpt(activeBlog.excerpt || "");
      setContent(activeBlog.content || "");
      setPublished(!!activeBlog.published);
    } else {
      setTitle("");
      setSlug("");
      setExcerpt("");
      setContent("");
      setPublished(false);
    }
  }, [activeBlog]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!activeBlog || activeBlog.isNew) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleNew = () => {
    setActiveBlog({ isNew: true });
  };

  const handleSave = () => {
    if (!title || !slug || !content) {
      toast({ title: "Error", description: "Title, slug, and content are required.", variant: "destructive" });
      return;
    }

    const payload = { title, slug, excerpt, content, published };

    if (activeBlog.isNew) {
      createBlog.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Success", description: "Blog post created." });
          setActiveBlog(null);
        }
      });
    } else {
      updateBlog.mutate({ id: activeBlog.id, data: payload }, {
        onSuccess: () => {
          toast({ title: "Success", description: "Blog post updated." });
        }
      });
    }
  };

  const handleDelete = () => {
    if (!activeBlog?.id) {
      setActiveBlog(null);
      return;
    }
    if (confirm("Are you sure you want to delete this post?")) {
      deleteBlog.mutate(activeBlog.id, {
        onSuccess: () => {
          toast({ title: "Success", description: "Blog post deleted." });
          setActiveBlog(null);
        }
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden">
      {/* List Pane */}
      <div className="w-[320px] flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FFD700]" /> Blogs
          </h2>
          <button onClick={handleNew} className="p-1.5 bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 rounded-md transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
          ) : blogs.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No posts yet.</div>
          ) : (
            blogs.map((b: any) => (
              <div 
                key={b.id} 
                onClick={() => setActiveBlog(b)}
                className={`p-4 rounded-xl cursor-pointer transition-colors border ${activeBlog?.id === b.id ? 'bg-[#FFD700]/10 border-[#FFD700]/30' : 'bg-white/3 border-transparent hover:bg-white/10'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-white truncate pr-2">{b.title}</h3>
                  {b.published ? (
                    <span className="shrink-0 bg-green-500/20 text-green-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Pub</span>
                  ) : (
                    <span className="shrink-0 bg-gray-500/20 text-gray-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Draft</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate">{b.slug}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Pane */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        {activeBlog ? (
          <>
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-300">
                  {activeBlog.isNew ? "Create New Post" : "Edit Post"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="rounded border-white/20 bg-black/50 text-[#FFD700] focus:ring-[#FFD700]" />
                  Published
                </label>
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <Button onClick={handleSave} className="bg-[#FFD700] text-black hover:bg-yellow-500 font-bold gap-2 rounded-lg h-9">
                  <Save className="w-4 h-4" /> Save
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Post Title..."
                  className="w-full bg-transparent border-none text-3xl font-display font-bold text-white focus:outline-none focus:ring-0 px-0 placeholder:text-gray-600"
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">/blog/</span>
                <input 
                  type="text" 
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="post-slug"
                  className="flex-1 bg-transparent border-none text-[#FFD700] focus:outline-none focus:ring-0 px-0"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase mb-2 block">Excerpt</label>
                <textarea 
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  placeholder="Short summary for list views..."
                  className="w-full bg-[#1A1A1A] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FFD700] resize-none h-20"
                />
              </div>
              <div className="flex-1 flex flex-col min-h-[400px]">
                <label className="text-xs font-medium text-gray-400 uppercase mb-2 block">Content (Markdown)</label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your content here..."
                  className="w-full flex-1 bg-[#1A1A1A] border border-white/10 text-white rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#FFD700] resize-none"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
            <FileText className="w-12 h-12 opacity-20" />
            <p>Select a post or create a new one to edit.</p>
          </div>
        )}
      </div>
    </div>
  );
}
