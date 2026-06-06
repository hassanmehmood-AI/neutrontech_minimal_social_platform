

'use client';

import React, { useState, useRef, useEffect } from 'react';
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

type Comment = {
  id: number;
  userId: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
};

type CurrentUser = { id: string; email: string; name: string; avatar: string };

export default function FeedPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<number, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [sendingComment, setSendingComment] = useState<Record<number, boolean>>({});
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<string>('');

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      if (!session) { router.replace('/login'); return; }

      tokenRef.current = session.access_token;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (cancelled) return;

      setCurrentUser({
        id: session.user.id,
        email: session.user.email || '',
        name: profile?.full_name || session.user.email?.split('@')[0] || 'You',
        avatar: profile?.avatar_url || '',
      });

      fetch('/api/posts')
        .then((r) => r.json())
        .then((data: Post[]) => { if (!cancelled) setPosts(data); })
        .finally(() => { if (!cancelled) setAuthLoading(false); });
    });

    return () => { cancelled = true; };
  }, [router]);

  const getToken = async () => {
    if (tokenRef.current) return tokenRef.current;
    const { data: { session } } = await supabase.auth.getSession();
    tokenRef.current = session?.access_token ?? '';
    return tokenRef.current;
  };

  const toggleComments = async (postId: number) => {
    if (openComments[postId]) {
      setOpenComments((prev) => ({ ...prev, [postId]: false }));
      return;
    }
    setOpenComments((prev) => ({ ...prev, [postId]: true }));
    if (!postComments[postId]) {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data: Comment[] = await res.json();
      setPostComments((prev) => ({ ...prev, [postId]: data }));
    }
  };

  const submitComment = async (postId: number) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    setSendingComment((prev) => ({ ...prev, [postId]: true }));
    const token = await getToken();
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) {
      const newComment: Comment = await res.json();
      setPostComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }));
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    }
    setSendingComment((prev) => ({ ...prev, [postId]: false }));
  };

  const toggleLike = async (id: number) => {
    if (!currentUser) return;
    const wasLiked = liked[id] ?? false;
    setLiked((prev) => ({ ...prev, [id]: !wasLiked }));
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, likes: p.likes + (wasLiked ? -1 : 1) } : p));
    try {
      const token = await getToken();
      const res = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Like failed');
      const { liked: isLiked, likes } = await res.json();
      setLiked((prev) => ({ ...prev, [id]: isLiked }));
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, likes } : p));
    } catch {
      setLiked((prev) => ({ ...prev, [id]: wasLiked }));
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, likes: p.likes + (wasLiked ? 1 : -1) } : p));
    }
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

    setPosting(true);

    const token = await getToken();

    // Upload each image via the server-side API route to get a permanent public URL
    const imageUrls: string[] = [];
    for (const file of selectedImages) {
      const form = new FormData();
      form.append('file', file);
      const up = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });
      const { url } = await up.json();
      imageUrls.push(url ?? URL.createObjectURL(file));
    }

    const videoUrl = selectedVideo ? URL.createObjectURL(selectedVideo) : undefined;

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
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
    setPosting(false);
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
  const composerName = currentUser?.name || 'You';

  return (
    <div className="font-body-md text-on-background">

      {/* ── IMAGE PREVIEW LIGHTBOX ── */}
      {previewUrl && (
        <div
          onClick={() => setPreviewUrl(null)}
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-md"
        >
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}


      {/* ── TOP NAV ── */}
      <header className="fixed top-0 w-full z-50 glass-effect border-b border-outline-variant shadow-sm h-16">
        <div className="grid grid-cols-3 items-center px-margin-mobile md:px-margin-desktop h-full max-w-[1280px] mx-auto">
          {/* Left spacer */}
          <div className="flex items-center">
            <Link href="/search" className="lg:hidden p-xs rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-150">
              <span className="material-symbols-outlined text-primary">search</span>
            </Link>
          </div>
          {/* Center: search bar */}
          <div className="flex justify-center">
            <div className="hidden lg:flex items-center bg-surface-container-low rounded-full px-md py-xs border border-outline-variant w-full cursor-pointer" onClick={() => window.location.href = '/search'}>
              <span className="material-symbols-outlined text-outline">search</span>
              <span className="font-label-md text-label-md text-outline ml-xs">Search...</span>
            </div>
          </div>
          {/* Right: actions */}
          <div className="flex items-center justify-end gap-sm">
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
            <Link href="/" className="inline-flex items-center gap-sm">
              <img src="/brand-logo.png" alt="" className="h-8 w-8 object-contain brightness-0" />
              <span className="font-display text-headline-sm text-on-surface font-bold tracking-tight">Neutron Tech</span>
            </Link>
          </div>
          <nav className="flex-1 flex flex-col space-y-xs">
            <Link className="bg-secondary-container text-on-secondary-container rounded-xl font-bold flex items-center gap-sm p-sm transition-all active:translate-x-1 duration-200" href="/feed">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              <span className="font-label-md text-label-md">Home</span>
            </Link>
            <Link className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl transition-all" href="/profile">
              <span className="material-symbols-outlined">person</span>
              <span className="font-label-md text-label-md">Profile</span>
            </Link>
            <Link className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl transition-all" href="/search">
              <span className="material-symbols-outlined">search</span>
              <span className="font-label-md text-label-md">Search</span>
            </Link>
            <Link className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl transition-all" href="/settings">
              <span className="material-symbols-outlined">settings</span>
              <span className="font-label-md text-label-md">Settings</span>
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
                    <button onClick={handlePost} disabled={posting} className="bg-primary text-on-primary px-sm py-xs rounded-full font-label-md text-label-md active:scale-95 transition-transform disabled:opacity-60">
                      {posting ? 'Posting...' : 'Post'}
                    </button>
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
                <React.Fragment key={post.id}>
                  <article className="feed-card bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
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
                      </div>

                      {post.content && <p className="font-body-md text-on-surface mb-md">{post.content}</p>}

                      {post.images.length === 1 && (
                        <div className="rounded-xl overflow-hidden mb-md aspect-video border border-outline-variant cursor-zoom-in" onClick={() => setPreviewUrl(post.images[0])}>
                          <img alt="Post image" className="w-full h-full object-cover" src={post.images[0]} />
                        </div>
                      )}
                      {post.images.length > 1 && (
                        <div className="grid grid-cols-2 gap-xs mb-md">
                          {post.images.map((src, i) => (
                            <div key={i} className="rounded-xl overflow-hidden aspect-square border border-outline-variant cursor-zoom-in" onClick={() => setPreviewUrl(src)}>
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
                          <button
                            className={`flex items-center gap-xs transition-colors ${openComments[post.id] ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                            onClick={() => toggleComments(post.id)}
                          >
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: openComments[post.id] ? "'FILL' 1" : "'FILL' 0" }}>comment</span>
                            <span className="text-label-sm">{post.comments}</span>
                          </button>
                        </div>
                      </div>

                      {/* ── COMMENTS SECTION ── */}
                      {openComments[post.id] && (
                        <div className="pt-sm space-y-sm border-t border-outline-variant mt-sm">

                          {/* Comment list */}
                          {!postComments[post.id] && (
                            <div className="flex justify-center py-sm">
                              <span className="material-symbols-outlined animate-spin text-primary text-[20px]">progress_activity</span>
                            </div>
                          )}
                          {(postComments[post.id] || []).length === 0 && postComments[post.id] && (
                            <p className="text-center font-label-sm text-label-sm text-on-surface-variant py-sm">No comments yet. Be the first!</p>
                          )}
                          {(postComments[post.id] || []).map((c) => (
                            <div key={c.id} className="flex gap-sm">
                              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-container-low flex items-center justify-center">
                                {c.avatar
                                  ? <img src={c.avatar} className="w-full h-full object-cover" alt={c.author} />
                                  : <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>person</span>
                                }
                              </div>
                              <div className="flex-1">
                                <div className="bg-surface-container-low rounded-xl px-sm py-xs">
                                  <p className="font-label-sm text-label-sm font-bold text-on-surface">{c.author}</p>
                                  <p className="font-body-md text-on-surface" style={{ fontSize: '14px' }}>{c.content}</p>
                                </div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs ml-sm">{c.time}</p>
                              </div>
                            </div>
                          ))}

                          {/* Comment input */}
                          <div className="flex gap-sm items-center pt-xs">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-container-low flex items-center justify-center">
                              {composerAvatar
                                ? <img src={composerAvatar} className="w-full h-full object-cover" alt="" />
                                : <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>person</span>
                              }
                            </div>
                            <div className="flex-1 flex gap-xs">
                              <input
                                value={commentText[post.id] || ''}
                                onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(post.id); } }}
                                placeholder="Write a comment..."
                                className="flex-1 bg-surface-container-low rounded-full px-md py-xs font-body-md outline-none border border-outline-variant focus:border-primary transition-colors"
                                style={{ fontSize: '14px' }}
                              />
                              <button
                                onClick={() => submitComment(post.id)}
                                disabled={sendingComment[post.id] || !commentText[post.id]?.trim()}
                                className="text-primary hover:bg-surface-container-low p-xs rounded-full transition-colors disabled:opacity-40"
                              >
                                <span className="material-symbols-outlined text-[20px]">send</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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
                </React.Fragment>
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
              <span>© 2024 Neutron Tech Inc.</span>
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
