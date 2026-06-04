'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Post = {
  id: number;
  author: string;
  avatar: string;
  time: string;
  tag: string;
  content: string;
  images: string[];
  videoUrl?: string;
  likes: number;
  comments: number;
};

type CurrentUser = { id: string; email: string; name: string; avatar: string };

export default function FeedPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [posts, setPosts]             = useState<Post[]>([]);
  const [liked, setLiked]             = useState<Record<number, boolean>>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo]   = useState<File | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const composerRef  = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return; }

      // Get profile for display name + avatar
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      setCurrentUser({
        id: session.user.id,
        email: session.user.email || '',
        name: profile?.full_name || session.user.email?.split('@')[0] || 'You',
        avatar: profile?.avatar_url || '',
      });

      fetch('/api/posts')
        .then((r) => r.json())
        .then((data: Post[]) => setPosts(data))
        .finally(() => setAuthLoading(false));
    });
  }, [router]);

  const toggleLike = async (id: number) => {
    if (!currentUser) return;
    const res = await fetch(`/api/posts/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id }),
    });
    const { liked: isLiked, likes } = await res.json();
    setLiked((prev) => ({ ...prev, [id]: isLiked }));
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes } : p)));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedImages(Array.from(e.target.files));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedVideo(e.target.files[0]);
  };

  const handlePost = async () => {
    const text = composerRef.current?.value.trim() ?? '';
    if (!text && selectedImages.length === 0 && !selectedVideo) return;

    const imageUrls = selectedImages.map((f) => URL.createObjectURL(f));
    const videoUrl = selectedVideo ? URL.createObjectURL(selectedVideo) : undefined;

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser?.id,
        author: currentUser?.name,
        avatar: currentUser?.avatar,
        content: text,
        images: imageUrls,
        videoUrl,
        tag: '',
      }),
    });
    const newPost: Post = await res.json();
    setPosts((prev) => [newPost, ...prev]);

    if (composerRef.current) composerRef.current.value = '';
    setSelectedImages([]);
    setSelectedVideo(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const focusComposer = () => {
    composerRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
      </div>
    );
  }

  const composerAvatar = currentUser?.avatar || undefined;
  const composerName   = currentUser?.name || 'You';

  return (
    <div className="font-body-md text-on-background">

      {/* ── TOP NAV ── */}
      <header className="fixed top-0 w-full z-50 glass-effect border-b border-outline-variant shadow-sm h-16">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-full max-w-[1280px] mx-auto">
          <Link href="/"><img src="/logo.png" alt="NeutronTech" className="h-12 w-auto drop-shadow-sm" /></Link>
          <div className="hidden lg:flex items-center bg-surface-container-low rounded-full px-md py-xs border border-outline-variant w-1/3 cursor-pointer" onClick={() => window.location.href = '/search'}>
            <span className="material-symbols-outlined text-outline">search</span>
            <span className="font-label-md text-label-md text-outline ml-xs">Search...</span>
          </div>
          <div className="flex items-center gap-sm">
            <Link href="/search" className="lg:hidden p-xs rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-150">
              <span className="material-symbols-outlined text-primary">search</span>
            </Link>
            <div className="hidden lg:flex items-center gap-xs">
              <button className="p-xs rounded-full hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-secondary">notifications</span>
              </button>
            </div>
            <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-fixed block shrink-0 bg-surface-container-low flex items-center justify-center">
              {composerAvatar
                ? <img alt="User" className="w-full h-full object-cover" src={composerAvatar} />
                : <span className="material-symbols-outlined text-primary">person</span>
              }
            </Link>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1280px] mx-auto pt-16">

        {/* ── LEFT SIDEBAR (lg+) ── */}
        <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant p-md pt-20 space-y-sm z-40">
          <div className="mb-lg">
            <img src="/logo.png" alt="NeutronTech" className="h-14 w-auto drop-shadow-sm mb-xs" />
            <p className="font-body-md text-on-surface-variant text-label-sm">{currentUser?.email}</p>
          </div>
          <nav className="flex-1 flex flex-col space-y-xs">
            <Link className="bg-secondary-container text-on-secondary-container rounded-xl font-bold flex items-center gap-sm p-sm transition-all active:translate-x-1 duration-200" href="/feed">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              <span className="font-label-md text-label-md">Home</span>
            </Link>
            <Link className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl transition-all" href="/search">
              <span className="material-symbols-outlined">search</span>
              <span className="font-label-md text-label-md">Search</span>
            </Link>
            <Link className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl transition-all" href="/profile">
              <span className="material-symbols-outlined">person</span>
              <span className="font-label-md text-label-md">Profile</span>
            </Link>
          </nav>
          <div className="pt-md border-t border-outline-variant flex flex-col space-y-xs">
            <button onClick={handleLogout} className="text-on-surface-variant flex items-center gap-sm p-sm hover:bg-surface-container-high rounded-xl transition-all text-left w-full">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">Logout</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN FEED ── */}
        <main className="flex-1 lg:ml-64 lg:mr-80 pt-4 pb-24 md:pb-8 px-margin-mobile md:px-margin-desktop min-h-screen">
          <div className="max-w-[640px] mx-auto space-y-md">

            {/* Composer */}
            <section className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant mb-md shadow-sm">
              <div className="flex gap-md">
                <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden bg-surface-container-low flex items-center justify-center">
                  {composerAvatar
                    ? <img alt="Avatar" className="w-full h-full object-cover" src={composerAvatar} />
                    : <span className="material-symbols-outlined text-primary">person</span>
                  }
                </div>
                <div className="flex-1">
                  <textarea ref={composerRef} className="w-full bg-transparent border-none focus:ring-0 font-body-md text-on-surface placeholder:text-on-surface-variant resize-none outline-none" placeholder={`What's on your mind, ${composerName}?`} rows={2}></textarea>
                  {(selectedImages.length > 0 || selectedVideo) && (
                    <div className="flex flex-wrap gap-xs mt-sm">
                      {selectedImages.map((file, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-outline-variant">
                          <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {selectedVideo && (
                        <div className="flex items-center gap-xs px-sm py-xs bg-surface-container-low rounded-lg border border-outline-variant">
                          <span className="material-symbols-outlined text-[16px] text-primary">videocam</span>
                          <span className="font-label-sm text-on-surface-variant truncate max-w-[120px]">{selectedVideo.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                  <div className="flex justify-between items-center mt-sm pt-sm border-t border-outline-variant">
                    <div className="flex gap-sm">
                      <button className="text-primary hover:bg-surface-container-low p-xs rounded-full transition-colors" onClick={() => imageInputRef.current?.click()} title="Add image">
                        <span className="material-symbols-outlined text-[20px]">image</span>
                      </button>
                      <button className="text-primary hover:bg-surface-container-low p-xs rounded-full transition-colors" onClick={() => videoInputRef.current?.click()} title="Add video">
                        <span className="material-symbols-outlined text-[20px]">videocam</span>
                      </button>
                    </div>
                    <button onClick={handlePost} className="bg-primary text-on-primary px-sm py-xs rounded-full font-label-md text-label-md active:scale-95 transition-transform">Post</button>
                  </div>
                </div>
              </div>
            </section>

            {/* Feed Cards */}
            {posts.length === 0 && (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] block mb-md">article</span>
                <p className="font-label-md text-label-md">No posts yet. Be the first to post!</p>
              </div>
            )}

            <div className="flex flex-col gap-md">
              {posts.map((post, index) => (
                <>
                  <article key={post.id} className="feed-card bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
                    <div className="p-md">
                      <div className="flex justify-between items-start mb-sm">
                        <div className="flex gap-sm items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-low flex items-center justify-center shrink-0">
                            {post.avatar
                              ? <img alt={post.author} className="w-full h-full object-cover" src={post.avatar} />
                              : <span className="material-symbols-outlined text-primary">person</span>
                            }
                          </div>
                          <div>
                            <Link href="/profile" className="font-label-md text-label-md text-on-surface font-bold hover:text-primary">{post.author}</Link>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">{post.time}{post.tag ? ` • ${post.tag}` : ''}</p>
                          </div>
                        </div>
                        <button className="text-on-surface-variant"><span className="material-symbols-outlined">more_horiz</span></button>
                      </div>

                      {post.content && <p className="font-body-md text-on-surface mb-md">{post.content}</p>}

                      {post.images.length === 1 && (
                        <div className="rounded-xl overflow-hidden mb-md aspect-video border border-outline-variant">
                          <img alt="Post image" className="w-full h-full object-cover" src={post.images[0]} />
                        </div>
                      )}
                      {post.images.length > 1 && (
                        <div className="grid grid-cols-2 gap-xs mb-md">
                          {post.images.map((src, i) => (
                            <div key={i} className="rounded-xl overflow-hidden aspect-square border border-outline-variant">
                              <img alt={`Image ${i + 1}`} className="w-full h-full object-cover" src={src} />
                            </div>
                          ))}
                        </div>
                      )}
                      {post.videoUrl && (
                        <div className="rounded-xl overflow-hidden mb-md border border-outline-variant">
                          <video src={post.videoUrl} controls className="w-full max-h-64 object-contain bg-black" />
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-sm border-t border-outline-variant">
                        <div className="flex gap-md">
                          <button className={`flex items-center gap-xs transition-colors ${liked[post.id] ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`} onClick={() => toggleLike(post.id)}>
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: liked[post.id] ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                            <span className="text-label-sm">{post.likes}</span>
                          </button>
                          <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">comment</span>
                            <span className="text-label-sm">{post.comments}</span>
                          </button>
                        </div>
                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[20px]">share</span>
                        </button>
                      </div>
                    </div>
                  </article>

                  {index === 0 && (
                    <section key="trending" className="bg-secondary-container/30 rounded-xl p-md border border-secondary-container">
                      <div className="flex justify-between items-center mb-sm">
                        <h2 className="font-label-md text-label-md text-on-secondary-container">Trending Topics</h2>
                        <Link href="/search" className="text-primary font-label-sm text-label-sm">View More</Link>
                      </div>
                      <div className="flex flex-col gap-xs">
                        <div className="flex justify-between items-center p-sm bg-surface-container-lowest rounded-lg">
                          <span className="font-label-md text-label-md">#Web3Sustainability</span>
                          <span className="text-label-sm text-on-surface-variant">14k posts</span>
                        </div>
                        <div className="flex justify-between items-center p-sm bg-surface-container-lowest rounded-lg">
                          <span className="font-label-md text-label-md">#NeutronConference24</span>
                          <span className="text-label-sm text-on-surface-variant">8.2k posts</span>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              ))}
            </div>
          </div>
        </main>

        {/* ── RIGHT SIDEBAR (lg+) ── */}
        <aside className="hidden lg:flex flex-col w-80 fixed right-0 top-0 h-screen border-l border-outline-variant p-md pt-20 space-y-lg overflow-y-auto">
          <div className="bg-surface-container-low rounded-2xl p-lg border border-outline-variant">
            <h3 className="font-headline-md text-headline-md mb-md">Trending for you</h3>
            <div className="space-y-md">
              <Link href="/search" className="block group cursor-pointer">
                <p className="font-label-sm text-label-sm text-outline">Technology • Trending</p>
                <h4 className="font-label-md text-label-md font-bold group-hover:text-primary transition-colors">#QuantumComputing</h4>
              </Link>
              <Link href="/search" className="block group cursor-pointer">
                <p className="font-label-sm text-label-sm text-outline">Business • Trending</p>
                <h4 className="font-label-md text-label-md font-bold group-hover:text-primary transition-colors">#NeutronSeriesB</h4>
              </Link>
              <Link href="/search" className="block group cursor-pointer">
                <p className="font-label-sm text-label-sm text-outline">Design • Trending</p>
                <h4 className="font-label-md text-label-md font-bold group-hover:text-primary transition-colors">#MinimalistUI</h4>
              </Link>
            </div>
            <Link href="/search" className="block mt-lg text-primary font-bold text-label-md hover:underline">Show more</Link>
          </div>
          <footer className="px-md py-sm">
            <div className="flex flex-wrap gap-sm text-outline font-label-sm text-label-sm">
              <a className="hover:underline" href="#">About</a>
              <a className="hover:underline" href="#">Privacy</a>
              <a className="hover:underline" href="#">Terms</a>
              <span>© 2024 NeutronTech Inc.</span>
            </div>
          </footer>
        </aside>

      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 w-full glass-effect border-t border-outline-variant md:hidden z-50">
        <div className="flex justify-around items-center h-16">
          <Link href="/feed" className="flex flex-col items-center justify-center gap-1 text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span className="font-label-sm text-[10px] font-bold">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center justify-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined">search</span>
            <span className="font-label-sm text-[10px]">Search</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-sm text-[10px]">Profile</span>
          </Link>
          <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-sm text-[10px]">Logout</span>
          </button>
        </div>
      </nav>

      {/* ── FAB (mobile only) ── */}
      <button className="fixed bottom-20 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform md:hidden z-40" onClick={focusComposer}>
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

    </div>
  );
}
