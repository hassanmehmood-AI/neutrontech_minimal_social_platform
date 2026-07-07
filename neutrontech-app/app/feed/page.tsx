

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Post = {
  id: number;
  userId: string;
  author: string;
  avatar: string;
  time: string;
  tag: string;
  content: string;
  images: string[];
  videoUrls: string[];
  likes: number;
  comments: number;
  likedByMe?: boolean;
};

type Comment = {
  id: number;
  userId: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  replyCount?: number;
};

type LikerUser = { id: string; name: string; avatar: string };

type CurrentUser = { id: string; email: string; name: string; avatar: string; isAdmin: boolean };

type Notification = {
  id: string;
  type: string;
  read: boolean;
  time: string;
  actor: { id: string; name: string; avatar: string };
};

export default function FeedPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set());
  const likingPostsRef = useRef<Set<number>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [postComments, setPostComments] = useState<Record<number, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [sendingComment, setSendingComment] = useState<Record<number, boolean>>({});
  const [likesModal, setLikesModal] = useState<{ postId: number; users: LikerUser[]; loading: boolean } | null>(null);
  const [replyingTo, setReplyingTo] = useState<Record<number, boolean>>({});
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [sendingReply, setSendingReply] = useState<Record<number, boolean>>({});
  const [commentReplies, setCommentReplies] = useState<Record<number, Comment[]>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
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
        .select('full_name, avatar_url, is_admin')
        .eq('id', session.user.id)
        .single();

      if (cancelled) return;

      setCurrentUser({
        id: session.user.id,
        email: session.user.email || '',
        name: profile?.full_name || session.user.email?.split('@')[0] || 'You',
        avatar: profile?.avatar_url || '',
        isAdmin: !!profile?.is_admin,
      });

      const authHeader = { 'Authorization': `Bearer ${session.access_token}` };

      Promise.all([
        fetch('/api/posts', { headers: authHeader }).then((r) => r.json()),
        fetch('/api/notifications', { headers: authHeader }).then((r) => r.json()),
      ]).then(([postsData, notifsData]: [Post[], Notification[]]) => {
        if (!cancelled) {
          const likedMap: Record<number, boolean> = {};
          postsData.forEach((p) => { if (p.likedByMe) likedMap[p.id] = true; });
          setPosts(postsData);
          setLiked(likedMap);
          if (Array.isArray(notifsData)) setNotifications(notifsData);
        }
      }).finally(() => { if (!cancelled) setAuthLoading(false); });
    });

    return () => { cancelled = true; };
  }, [router]);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) tokenRef.current = session.access_token;
    return tokenRef.current;
  };

  const openNotifications = () => setNotifOpen((prev) => !prev);

  const markNotifRead = async (id: string) => {
    setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, read: true } : n));
    const token = await getToken();
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
  };

  // Close notification panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

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
    if (!currentUser || likingPostsRef.current.has(id)) return;
    likingPostsRef.current.add(id);
    setLikingPosts(new Set(likingPostsRef.current));
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
    } finally {
      likingPostsRef.current.delete(id);
      setLikingPosts(new Set(likingPostsRef.current));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    e.target.value = '';
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setSelectedImages((prev) => [...prev, file]);
        setImagePreviews((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedVideos(Array.from(e.target.files));
  };

  const handlePost = async () => {
    const text = composerRef.current?.value.trim() ?? '';
    if (!text && selectedImages.length === 0 && selectedVideos.length === 0) return;

    setPosting(true);

    const token = await getToken();

    const uploadFile = async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      const up = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });
      const { url } = await up.json();
      return url ?? URL.createObjectURL(file);
    };

    const [imageUrls, videoUrls] = await Promise.all([
      Promise.all(selectedImages.map(uploadFile)),
      Promise.all(selectedVideos.map(uploadFile)),
    ]);

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        content: text,
        images: imageUrls,
        videoUrls,
        tag: '',
      }),
    });
    const newPost: Post = await res.json();
    setPosts((prev) => [newPost, ...prev]);

    if (composerRef.current) composerRef.current.value = '';
    setSelectedImages([]);
    setImagePreviews([]);
    setSelectedVideos([]);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
    setPosting(false);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const openLikesModal = async (postId: number) => {
    setLikesModal({ postId, users: [], loading: true });
    try {
      const res = await fetch(`/api/posts/${postId}/like`);
      const users: LikerUser[] = await res.json();
      setLikesModal({ postId, users, loading: false });
    } catch {
      setLikesModal({ postId, users: [], loading: false });
    }
  };

  const loadReplies = async (postId: number, commentId: number) => {
    if (commentReplies[commentId] !== undefined) {
      setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
      return;
    }
    setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    try {
      const res = await fetch(`/api/posts/${postId}/comments?parent_id=${commentId}`);
      const data: Comment[] = await res.json();
      setCommentReplies((prev) => ({ ...prev, [commentId]: data }));
    } catch {
      setCommentReplies((prev) => ({ ...prev, [commentId]: [] }));
    }
  };

  const submitReply = async (postId: number, parentCommentId: number) => {
    const text = replyText[parentCommentId]?.trim();
    if (!text) return;
    setSendingReply((prev) => ({ ...prev, [parentCommentId]: true }));
    try {
      const token = await getToken();
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: text, parent_id: parentCommentId }),
      });
      if (res.ok) {
        const newReply: Comment = await res.json();
        setCommentReplies((prev) => ({ ...prev, [parentCommentId]: [...(prev[parentCommentId] || []), newReply] }));
        setReplyText((prev) => ({ ...prev, [parentCommentId]: '' }));
        setExpandedReplies((prev) => ({ ...prev, [parentCommentId]: true }));
        setReplyingTo((prev) => ({ ...prev, [parentCommentId]: false }));
      }
    } finally {
      setSendingReply((prev) => ({ ...prev, [parentCommentId]: false }));
    }
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


      {/* ── LIKES MODAL ── */}
      {likesModal && (
        <div
          onClick={() => setLikesModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: '70vh',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#000', fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>
                  {likesModal.loading
                    ? 'Loading…'
                    : `${likesModal.users.length} ${likesModal.users.length === 1 ? 'person' : 'people'} liked this`}
                </span>
              </div>
              <button
                onClick={() => setLikesModal(null)}
                className="likes-close-btn"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', color: '#555', transition: 'background-color 0.15s ease' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', padding: '8px' }}>
              {likesModal.loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '28px', color: '#000' }}>progress_activity</span>
                </div>
              ) : likesModal.users.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#767676' }}>favorite_border</span>
                  <p style={{ fontSize: '14px', color: '#555' }}>No likes yet</p>
                </div>
              ) : (
                likesModal.users.map((user) => (
                  <div
                    key={user.id}
                    className="likes-user-row"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '12px' }}
                    onClick={() => { setLikesModal(null); router.push(user.id === currentUser?.id ? '/profile' : `/profile/${user.id}`); }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {user.avatar
                        ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={user.name} />
                        : <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#000' }}>person</span>
                      }
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#111' }}>{user.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
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
            <div className="hidden lg:flex items-center gap-xs" ref={notifRef}>
              {/* Bell button */}
              <button
                onClick={openNotifications}
                style={{ touchAction: 'manipulation' }}
                className="relative p-xs rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span
                  className="material-symbols-outlined text-secondary"
                  style={{ fontVariationSettings: notifOpen ? "'FILL' 1" : "'FILL' 0" }}
                >notifications</span>
                {(() => {
                  const unread = notifications.filter((n) => !n.read).length;
                  return unread > 0 ? (
                    <span
                      className="absolute -top-1 -right-1 flex items-center justify-center bg-error text-white font-bold rounded-full border-2 border-surface"
                      style={{ fontSize: '10px', minWidth: '18px', height: '18px', padding: '0 3px' }}
                    >
                      {unread > 9 ? '9+' : unread}
                    </span>
                  ) : null;
                })()}
              </button>

              {/* ── NOTIFICATION PANEL (fixed so it breaks out of header) ── */}
              {notifOpen && (
                <div
                  style={{ position: 'fixed', top: '68px', right: '16px', zIndex: 200, width: '340px' }}
                  className="bg-surface rounded-2xl shadow-2xl border border-outline-variant overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant">
                    <span className="font-label-md text-label-md font-bold text-on-surface">Notifications</span>
                    <span className="text-label-sm text-on-surface-variant">
                      {notifications.filter((n) => !n.read).length === 0 ? 'All caught up ✓' : `${notifications.filter((n) => !n.read).length} new`}
                    </span>
                  </div>

                  {/* List */}
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[40px]">notifications_none</span>
                        <p className="font-label-sm text-label-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={async () => {
                            if (!n.read) await markNotifRead(n.id);
                            setNotifOpen(false);
                            router.push(n.actor.id === currentUser?.id ? '/profile' : `/profile/${n.actor.id}`);
                          }}
                          className={`flex items-center gap-sm px-md py-sm cursor-pointer hover:bg-surface-container-low transition-colors border-b border-outline-variant/40 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
                        >
                          {/* Actor avatar + type badge */}
                          <div className="relative shrink-0">
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-surface-container-low flex items-center justify-center">
                              {n.actor.avatar
                                ? <img src={n.actor.avatar} className="w-full h-full object-cover" alt={n.actor.name} />
                                : <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>person</span>
                              }
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-surface">
                              <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '11px', fontVariationSettings: "'FILL' 1" }}>person_add</span>
                            </div>
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-on-surface leading-snug" style={{ fontSize: '13px' }}>
                              <span className="font-bold">{n.actor.name}</span> started following you
                            </p>
                            <p className="text-on-surface-variant mt-0.5" style={{ fontSize: '12px' }}>{n.time}</p>
                          </div>

                          {/* Unread dot */}
                          {!n.read && (
                            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
        <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant p-md pt-0 space-y-sm z-40">
          <div className="h-16 flex items-center mb-sm">
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
            {currentUser?.isAdmin && (
              <Link className="text-on-surface-variant hover:bg-surface-container-high flex items-center gap-sm p-sm rounded-xl transition-all" href="/admin">
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span className="font-label-md text-label-md">Admin Console</span>
              </Link>
            )}
          </nav>
          <div className="pt-md border-t border-outline-variant flex flex-col space-y-xs">
            <button onClick={handleLogout} disabled={loggingOut} style={{ touchAction: 'manipulation' }} className="text-on-surface-variant flex items-center gap-sm p-sm hover:bg-surface-container-high rounded-xl transition-all text-left w-full disabled:opacity-50">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">{loggingOut ? 'Logging out…' : 'Logout'}</span>
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
                  {imagePreviews.length > 0 && (
                    <div className={`mt-sm rounded-xl overflow-hidden grid gap-0.5 ${
                      imagePreviews.length === 1 ? 'grid-cols-1' :
                      imagePreviews.length === 2 ? 'grid-cols-2' :
                      'grid-cols-3'
                    }`}>
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square">
                          <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-0.5 flex items-center justify-center transition-colors"
                            onClick={() => {
                              setSelectedImages(prev => prev.filter((_, j) => j !== i));
                              setImagePreviews(prev => prev.filter((_, j) => j !== i));
                            }}
                          >
                            <span className="material-symbols-outlined text-white text-[14px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedVideos.length > 0 && (
                    <div className="flex flex-wrap gap-xs mt-xs">
                      {selectedVideos.map((file, i) => (
                        <div key={i} className="flex items-center gap-xs px-sm py-xs bg-surface-container-low rounded-lg border border-outline-variant">
                          <span className="material-symbols-outlined text-[16px] text-primary">videocam</span>
                          <span className="font-label-sm text-on-surface-variant truncate max-w-[100px]">{file.name}</span>
                          <button
                            type="button"
                            className="ml-xs text-on-surface-variant hover:text-error transition-colors"
                            onClick={() => setSelectedVideos(prev => prev.filter((_, j) => j !== i))}
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                  <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={handleVideoChange} />
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
                          <Link href={post.userId === currentUser?.id ? '/profile' : `/profile/${post.userId}`} className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-low flex items-center justify-center shrink-0">
                            {post.avatar
                              ? <img alt={post.author} className="w-full h-full object-cover" src={post.avatar} />
                              : <span className="material-symbols-outlined text-primary">person</span>
                            }
                          </Link>
                          <div>
                            <Link href={post.userId === currentUser?.id ? '/profile' : `/profile/${post.userId}`} className="font-label-md text-label-md text-on-surface font-bold hover:text-primary">{post.author}</Link>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">{post.time}{post.tag ? ` • ${post.tag}` : ''}</p>
                          </div>
                        </div>
                      </div>

                      {post.content && <p className="font-body-md text-on-surface mb-md">{post.content}</p>}

                      {post.images.length === 1 && (
                        <div className="rounded-xl overflow-hidden mb-md max-h-96 border border-outline-variant cursor-zoom-in" onClick={() => setPreviewUrl(post.images[0])}>
                          <img alt="Post image" className="w-full max-h-96 object-cover" src={post.images[0]} />
                        </div>
                      )}
                      {post.images.length === 2 && (
                        <div className="grid grid-cols-2 gap-0.5 mb-md rounded-xl overflow-hidden">
                          {post.images.map((src, i) => (
                            <div key={i} className="aspect-square cursor-zoom-in" onClick={() => setPreviewUrl(src)}>
                              <img alt={`Image ${i + 1}`} className="w-full h-full object-cover" src={src} />
                            </div>
                          ))}
                        </div>
                      )}
                      {post.images.length === 3 && (
                        <div className="grid grid-cols-2 gap-0.5 mb-md rounded-xl overflow-hidden h-64">
                          <div className="cursor-zoom-in row-span-2 h-full" onClick={() => setPreviewUrl(post.images[0])}>
                            <img alt="Image 1" className="w-full h-full object-cover" src={post.images[0]} />
                          </div>
                          <div className="cursor-zoom-in h-full" onClick={() => setPreviewUrl(post.images[1])}>
                            <img alt="Image 2" className="w-full h-full object-cover" src={post.images[1]} />
                          </div>
                          <div className="cursor-zoom-in h-full" onClick={() => setPreviewUrl(post.images[2])}>
                            <img alt="Image 3" className="w-full h-full object-cover" src={post.images[2]} />
                          </div>
                        </div>
                      )}
                      {post.images.length >= 4 && (
                        <div className="grid grid-cols-2 gap-0.5 mb-md rounded-xl overflow-hidden">
                          {post.images.slice(0, 4).map((src, i) => (
                            <div key={i} className="relative aspect-square cursor-zoom-in" onClick={() => setPreviewUrl(src)}>
                              <img alt={`Image ${i + 1}`} className="w-full h-full object-cover" src={src} />
                              {i === 3 && post.images.length > 4 && (
                                <div className="absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none">
                                  <span className="text-white font-bold text-2xl">+{post.images.length - 4}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {post.videoUrls?.length > 0 && (
                        <div className="space-y-sm mb-md">
                          {post.videoUrls.map((url, i) => (
                            <div key={i} className="rounded-xl overflow-hidden border border-outline-variant">
                              <video src={url} controls className="w-full max-h-64 object-contain bg-black" />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-sm border-t border-outline-variant">
                        <div className="flex gap-md">
                          <div className="flex items-center gap-xs">
                            <button
                              className={`transition-colors disabled:opacity-60 ${liked[post.id] ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                              style={{ touchAction: 'manipulation' }}
                              disabled={likingPosts.has(post.id)}
                              onClick={() => toggleLike(post.id)}
                            >
                              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: liked[post.id] ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                            </button>
                            <button
                              className="text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                              onClick={() => openLikesModal(post.id)}
                              title="See who liked this"
                            >
                              {post.likes}
                            </button>
                          </div>
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
                                <div className="flex items-center gap-sm mt-xs ml-sm">
                                  <p className="font-label-sm text-label-sm text-on-surface-variant">{c.time}</p>
                                  <button
                                    className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
                                    onClick={() => setReplyingTo((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                                  >
                                    Reply
                                  </button>
                                  {((c.replyCount || 0) > 0 || (commentReplies[c.id]?.length || 0) > 0) && (
                                    <button
                                      className="font-label-sm text-label-sm text-primary hover:underline transition-colors"
                                      onClick={() => loadReplies(post.id, c.id)}
                                    >
                                      {expandedReplies[c.id]
                                        ? 'Hide replies'
                                        : `View ${c.replyCount || commentReplies[c.id]?.length || ''} replies`}
                                    </button>
                                  )}
                                </div>

                                {/* Inline reply input */}
                                {replyingTo[c.id] && (
                                  <div className="flex gap-xs items-center mt-xs">
                                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-surface-container-low flex items-center justify-center">
                                      {composerAvatar
                                        ? <img src={composerAvatar} className="w-full h-full object-cover" alt="" />
                                        : <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px' }}>person</span>
                                      }
                                    </div>
                                    <div className="flex-1 flex gap-xs">
                                      <input
                                        value={replyText[c.id] || ''}
                                        onChange={(e) => setReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitReply(post.id, c.id); } }}
                                        placeholder={`Reply to ${c.author}…`}
                                        className="flex-1 bg-surface-container-low rounded-full px-sm py-xs outline-none border border-outline-variant focus:border-primary transition-colors"
                                        style={{ fontSize: '13px' }}
                                      />
                                      <button
                                        onClick={() => submitReply(post.id, c.id)}
                                        disabled={sendingReply[c.id] || !replyText[c.id]?.trim()}
                                        className="text-primary hover:bg-surface-container-low p-xs rounded-full transition-colors disabled:opacity-40"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Nested replies */}
                                {expandedReplies[c.id] && (
                                  <div className="mt-xs ml-sm space-y-xs border-l-2 border-outline-variant pl-sm">
                                    {commentReplies[c.id] === undefined ? (
                                      <div className="flex justify-center py-xs">
                                        <span className="material-symbols-outlined animate-spin text-primary text-[16px]">progress_activity</span>
                                      </div>
                                    ) : commentReplies[c.id].length === 0 ? (
                                      <p className="text-center font-label-sm text-label-sm text-on-surface-variant py-xs">No replies yet</p>
                                    ) : (
                                      commentReplies[c.id].map((reply) => (
                                        <div key={reply.id} className="flex gap-xs">
                                          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-surface-container-low flex items-center justify-center">
                                            {reply.avatar
                                              ? <img src={reply.avatar} className="w-full h-full object-cover" alt={reply.author} />
                                              : <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>person</span>
                                            }
                                          </div>
                                          <div>
                                            <div className="bg-surface-container-low rounded-xl px-sm py-xs">
                                              <p className="font-label-sm text-label-sm font-bold text-on-surface">{reply.author}</p>
                                              <p className="font-body-md text-on-surface" style={{ fontSize: '13px' }}>{reply.content}</p>
                                            </div>
                                            <p className="font-label-sm text-on-surface-variant mt-xs ml-xs" style={{ fontSize: '11px' }}>{reply.time}</p>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
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
          <Link
            href="/contact"
            className="flex items-center justify-between bg-surface-container-low rounded-2xl p-lg border border-outline-variant hover:border-primary transition-colors group"
          >
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">mail</span>
              <span className="font-label-md text-label-md font-bold text-on-surface group-hover:text-primary transition-colors">Contact Us</span>
            </div>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </Link>
          <footer className="px-md py-sm">
            <div className="flex flex-wrap gap-sm text-outline font-label-sm text-label-sm">
              <Link className="hover:underline" href="/about">About</Link>
              <Link className="hover:underline" href="/privacy">Privacy</Link>
              <Link className="hover:underline" href="/terms">Terms</Link>
              <span>© 2026 Neutron Tech Inc.</span>
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
          <Link href="/contact" className="flex flex-col items-center justify-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined">mail</span>
            <span className="font-label-sm text-[10px]">Contact</span>
          </Link>
          <button onClick={handleLogout} disabled={loggingOut} style={{ touchAction: 'manipulation' }} className="flex flex-col items-center justify-center gap-1 text-on-surface-variant disabled:opacity-50">
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
