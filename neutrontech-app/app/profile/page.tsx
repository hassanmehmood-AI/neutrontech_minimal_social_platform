'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  role: string | null;
  followers: number;
  following: number;
  is_admin?: boolean | null;
};

type Post = {
  id: number;
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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts]     = useState<Post[]>([]);
  const [liked, setLiked]     = useState<Record<number, boolean>>({});
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set());
  const likingPostsRef = useRef<Set<number>>(new Set());
  const [activeTab, setActiveTab]   = useState<'posts' | 'media'>('posts');
  const [scrolled, setScrolled]     = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [postComments, setPostComments] = useState<Record<number, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [sendingComment, setSendingComment] = useState<Record<number, boolean>>({});
  const [likesModal, setLikesModal] = useState<{ postId: number; users: LikerUser[]; loading: boolean } | null>(null);
  const [replyingTo, setReplyingTo] = useState<Record<number, boolean>>({});
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [sendingReply, setSendingReply] = useState<Record<number, boolean>>({});
  const [commentReplies, setCommentReplies] = useState<Record<number, Comment[]>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});

  // Edit modal
  const [editOpen, setEditOpen]           = useState(false);
  const [editName, setEditName]           = useState('');
  const [editBio, setEditBio]             = useState('');
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [coverFile, setCoverFile]         = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview]   = useState<string | null>(null);
  const [clearAvatar, setClearAvatar]     = useState(false);
  const [clearCover, setClearCover]       = useState(false);
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login'); return; }
      const res = await fetch(`/api/users/${session.user.id}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const { user, posts: userPosts } = await res.json();
        setProfile(user);
        setPosts(userPosts);
        const likedMap: Record<number, boolean> = {};
        (userPosts as Post[]).forEach((p) => { if (p.likedByMe) likedMap[p.id] = true; });
        setLiked(likedMap);
      }
      setAuthLoading(false);
    });
  }, [router]);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? '';
  };

  const deletePost = async (id: number) => {
    setMenuOpen(null);
    const token = await getToken();
    const res = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const toggleLike = async (id: number) => {
    if (likingPostsRef.current.has(id)) return;
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

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const openEdit = () => {
    setEditName(profile?.full_name || '');
    setEditBio(profile?.bio || '');
    setAvatarFile(null);
    setCoverFile(null);
    setAvatarPreview(null);
    setCoverPreview(null);
    setClearAvatar(false);
    setClearCover(false);
    setSaveError('');
    setEditOpen(true);
  };

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'avatar') { setAvatarFile(file); setAvatarPreview(url); setClearAvatar(false); }
    else                   { setCoverFile(file);  setCoverPreview(url);  setClearCover(false);  }
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveError('');

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? '';
    const authHeader = { 'Authorization': `Bearer ${token}` };

    let newAvatarUrl: string | null = clearAvatar ? null : profile.avatar_url;
    let newCoverUrl:  string | null = clearCover  ? null : profile.cover_url;

    // Upload avatar and cover in parallel if files were selected
    const uploads = await Promise.all([
      avatarFile ? (async () => {
        const form = new FormData();
        form.append('file', avatarFile);
        const up = await fetch('/api/upload', { method: 'POST', headers: authHeader, body: form });
        const { url } = await up.json();
        return url as string | undefined;
      })() : Promise.resolve(undefined),
      coverFile ? (async () => {
        const form = new FormData();
        form.append('file', coverFile);
        const up = await fetch('/api/upload', { method: 'POST', headers: authHeader, body: form });
        const { url } = await up.json();
        return url as string | undefined;
      })() : Promise.resolve(undefined),
    ]);

    if (uploads[0]) newAvatarUrl = uploads[0];
    if (uploads[1]) newCoverUrl  = uploads[1];

    // PATCH 1: save name, bio, avatar
    const res = await fetch(`/api/users/${profile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ name: editName, bio: editBio, avatar: newAvatarUrl }),
    });

    if (!res.ok) {
      setSaveError('Failed to save. Please try again.');
      setSaving(false);
      return;
    }

    const updated = await res.json();

    // PATCH 2: save cover separately (requires cover_url column in profiles table)
    if (newCoverUrl !== profile.cover_url) {
      await fetch(`/api/users/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ cover: newCoverUrl }),
      });
    }

    setProfile({ ...updated, cover_url: newCoverUrl });
    setSaving(false);
    setEditOpen(false);
  };

  const displayName = profile?.full_name || profile?.username || 'Your Profile';
  const username    = profile?.username || '';
  const bio         = profile?.bio || 'No bio yet.';
  const avatarUrl   = profile?.avatar_url || undefined;

  const mediaPosts = posts.filter((p) => p.images.length > 0 || p.videoUrls.length > 0);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="font-body-md text-body-md overflow-x-hidden">

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

      {/* ── EDIT PROFILE MODAL ── */}
      {editOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{
            background: '#fff', borderRadius: '16px',
            width: '100%', maxWidth: '512px',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          }}>
            {/* Sticky header */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 10, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px', borderBottom: '1px solid #e5e7eb',
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Edit Profile</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="material-symbols-outlined"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6b7280' }}
              >close</button>
            </div>

            {/* Cover photo */}
            <div
              onClick={() => coverInputRef.current?.click()}
              style={{
                position: 'relative', height: '144px',
                background: '#111', cursor: 'pointer', overflow: 'hidden',
              }}
            >
              {!clearCover && (coverPreview || profile?.cover_url) ? (
                <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={coverPreview || profile?.cover_url!} alt="Cover" />
              ) : (
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.2,
                  backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)',
                  backgroundSize: '24px 24px',
                }} />
              )}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
              }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '32px' }}>add_photo_alternate</span>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>Change cover photo</span>
              </div>
              {!clearCover && (coverPreview || profile?.cover_url) && (
                <button
                  onClick={(e) => { e.stopPropagation(); setClearCover(true); setCoverFile(null); setCoverPreview(null); }}
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                    width: '32px', height: '32px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="Remove cover photo"
                >
                  <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '18px' }}>delete</span>
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => pickFile(e, 'cover')} />
            </div>

            {/* Fields */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Profile photo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  style={{
                    position: 'relative', width: '80px', height: '80px', borderRadius: '50%',
                    background: '#f3f4f6', border: '2px solid #e5e7eb',
                    cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {!clearAvatar && (avatarPreview || avatarUrl) ? (
                    <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={avatarPreview || avatarUrl} alt={displayName} />
                  ) : (
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '36px' }}>person</span>
                  )}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                  >
                    <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '20px' }}>photo_camera</span>
                  </div>
                  <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => pickFile(e, 'avatar')} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>Profile Photo</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>Click the circle to change</p>
                  {!clearAvatar && (avatarPreview || avatarUrl) && (
                    <button
                      onClick={() => { setClearAvatar(true); setAvatarFile(null); setAvatarPreview(null); }}
                      style={{
                        marginTop: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: 500,
                        color: '#ef4444', background: 'none', border: '1px solid #ef4444',
                        borderRadius: '8px', cursor: 'pointer',
                      }}
                    >Remove photo</button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%', padding: '10px 16px', boxSizing: 'border-box',
                    border: '1px solid #d1d5db', borderRadius: '12px',
                    fontSize: '14px', outline: 'none', background: '#fff',
                  }}
                />
              </div>

              {/* Bio */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  maxLength={160}
                  placeholder="Tell the world about yourself..."
                  style={{
                    width: '100%', padding: '10px 16px', boxSizing: 'border-box',
                    border: '1px solid #d1d5db', borderRadius: '12px',
                    fontSize: '14px', outline: 'none', resize: 'none', background: '#fff',
                  }}
                />
                <p style={{ textAlign: 'right', margin: 0, fontSize: '12px', color: '#9ca3af' }}>{editBio.length}/160</p>
              </div>

              {saveError && <p style={{ margin: 0, fontSize: '14px', color: '#ef4444' }}>{saveError}</p>}
            </div>

            {/* Sticky footer */}
            <div style={{
              position: 'sticky', bottom: 0, zIndex: 10, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px',
              padding: '16px 24px', borderTop: '1px solid #e5e7eb',
            }}>
              <button
                onClick={() => setEditOpen(false)}
                style={{
                  padding: '8px 20px', borderRadius: '12px',
                  border: '1px solid #d1d5db', fontSize: '14px', fontWeight: 500,
                  color: '#374151', background: '#fff', cursor: 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '8px 20px', borderRadius: '12px',
                  background: 'var(--color-primary-container)', color: '#fff',
                  fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}
              >{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIKES MODAL ── */}
      {likesModal && (
        <div
          onClick={() => setLikesModal(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: '1rem', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '70vh' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#000', fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>
                  {likesModal.loading ? 'Loading…' : `${likesModal.users.length} ${likesModal.users.length === 1 ? 'person' : 'people'} liked this`}
                </span>
              </div>
              <button onClick={() => setLikesModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', color: '#555' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>close</span>
              </button>
            </div>
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
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer' }}
                    onClick={() => { setLikesModal(null); router.push(user.id === profile?.id ? '/profile' : `/profile/${user.id}`); }}
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
      <header className={`fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant h-16 flex items-center px-margin-mobile md:px-margin-desktop ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="grid grid-cols-3 items-center w-full max-w-[1280px] mx-auto">
          <div></div>
          <div className="flex justify-center">
            <nav className="hidden lg:flex items-center space-x-lg">
              <Link href="/feed" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">Feed</Link>
              <Link href="/search" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">Search</Link>
            </nav>
          </div>
          <div className="flex items-center justify-end gap-sm">
            <button className="lg:hidden material-symbols-outlined p-xs hover:bg-surface-container-high rounded-full transition-colors text-secondary" onClick={() => window.location.href = '/search'}>search</button>
            <Link href="/settings" className="lg:hidden material-symbols-outlined p-xs hover:bg-surface-container-high rounded-full transition-colors text-secondary">settings</Link>
            <button onClick={handleLogout} disabled={loggingOut} style={{ touchAction: 'manipulation' }} className="hidden lg:block font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low px-md py-xs rounded-lg transition-all active:scale-95 disabled:opacity-50">{loggingOut ? 'Logging out…' : 'Logout'}</button>
          </div>
        </div>
      </header>

      {/* ── LEFT SIDEBAR (lg+) ── */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant p-md pt-0 space-y-sm z-40">
        <div className="h-16 flex items-center mb-sm">
            <Link href="/" className="inline-flex items-center gap-sm">
            <img src="/brand-logo.png" alt="" className="h-8 w-8 object-contain brightness-0" />
            <span className="font-display text-headline-sm text-on-surface font-bold tracking-tight">Neutron Tech</span>
          </Link>
        </div>
        <nav className="flex-1 flex flex-col space-y-xs pt-md">
          <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/feed">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-md text-label-md">Home</span>
          </Link>
          <Link className="flex items-center space-x-sm px-md py-sm bg-secondary-container text-on-secondary-container rounded-xl font-bold" href="/profile">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
          <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/search">
            <span className="material-symbols-outlined">search</span>
            <span className="font-label-md text-label-md">Search</span>
          </Link>
          <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/settings">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
          {profile?.is_admin && (
            <Link className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl" href="/admin">
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span className="font-label-md text-label-md">Admin Console</span>
            </Link>
          )}
        </nav>
        <div className="pt-sm border-t border-outline-variant flex flex-col space-y-xs">
          <button onClick={handleLogout} disabled={loggingOut} style={{ touchAction: 'manipulation' }} className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl text-left w-full disabled:opacity-50">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">{loggingOut ? 'Logging out…' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="lg:ml-64 pt-16 min-h-screen pb-24 lg:pb-8">

        {/* ── PROFILE BANNER ── */}
        <div className="relative h-40 md:h-64 lg:h-80 w-full overflow-hidden">
          {profile?.cover_url ? (
            <img
              className="w-full h-full object-cover cursor-zoom-in"
              src={profile.cover_url}
              alt="Cover photo"
              onClick={() => setPreviewUrl(profile.cover_url!)}
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-primary-container"></div>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '24px 24px' }}></div>
            </>
          )}
        </div>

        {/* ── MOBILE PROFILE HEADER ── */}
        <div className="px-margin-mobile -mt-12 relative z-10 lg:hidden">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-surface overflow-hidden shadow-lg bg-surface-container flex items-center justify-center">
              {avatarUrl
                ? <img className="w-full h-full object-cover cursor-zoom-in" src={avatarUrl} alt={displayName} onClick={() => setPreviewUrl(avatarUrl)} />
                : <span className="material-symbols-outlined text-primary text-[48px]">person</span>
              }
            </div>
            <div className="text-center mt-md">
              <h2 className="font-headline-md text-headline-lg-mobile text-on-surface">{displayName}</h2>
            </div>
            <div className="flex gap-sm w-full max-w-[24rem] mt-md">
              <button
                onClick={openEdit}
                className="flex-1 bg-surface border border-outline-variant text-on-surface h-12 rounded-xl font-label-md text-label-md active:scale-95 transition-transform duration-150"
              >Edit Profile</button>
            </div>
            <div className="w-full mt-lg">
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{bio}</p>
              {profile?.role && (
                <div className="flex items-center gap-xs mt-sm text-primary">
                  <span className="material-symbols-outlined text-[18px]">work</span>
                  <span className="font-label-md text-label-md">{profile.role}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── DESKTOP PROFILE CARD ── */}
        <div className="max-w-[1000px] mx-auto px-margin-mobile md:px-margin-desktop -mt-16 md:-mt-24 relative z-10 pb-xl hidden lg:block">
          <div className="bg-surface-container-lowest rounded-xl tonal-layer soft-shadow p-lg md:p-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-md">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-surface border-4 border-surface-container-lowest soft-shadow overflow-hidden flex items-center justify-center">
                    {avatarUrl
                      ? <img className="w-full h-full object-cover cursor-zoom-in" src={avatarUrl} alt={displayName} onClick={() => setPreviewUrl(avatarUrl)} />
                      : <span className="material-symbols-outlined text-primary text-[64px]">person</span>
                    }
                  </div>
                </div>
                <div className="mb-2">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">{displayName}</h1>
                  {profile?.role && (
                    <div className="flex items-center mt-2 space-x-base text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">work</span>
                      <span className="font-label-sm text-label-sm">{profile.role}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <button
                  onClick={openEdit}
                  className="border border-outline-variant px-lg py-sm rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-all active:scale-95"
                >Edit Profile</button>
              </div>
            </div>
            {bio && (
              <div className="mt-lg max-w-2xl">
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{bio}</p>
              </div>
            )}
            <div className="flex gap-lg mt-md">
              <div className="text-center">
                <p className="font-headline-md text-on-surface">{posts.length}</p>
                <p className="font-label-sm text-on-surface-variant">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-headline-md text-on-surface">{profile?.followers ?? 0}</p>
                <p className="font-label-sm text-on-surface-variant">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-headline-md text-on-surface">{profile?.following ?? 0}</p>
                <p className="font-label-sm text-on-surface-variant">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── POSTS SECTION ── */}
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter pb-xl mt-xl lg:mt-0">

          {/* About sidebar (desktop) */}
          <div className="lg:col-span-4 space-y-gutter hidden lg:block">
            <div className="bg-surface-container-lowest rounded-xl tonal-layer soft-shadow p-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Stats</h3>
              <ul className="space-y-md">
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary">article</span>
                  <div className="font-body-md text-body-md text-on-surface-variant"><span className="font-bold text-on-surface">{posts.length}</span> posts</div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary">group</span>
                  <div className="font-body-md text-body-md text-on-surface-variant"><span className="font-bold text-on-surface">{profile?.followers ?? 0}</span> followers</div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-primary">person_add</span>
                  <div className="font-body-md text-body-md text-on-surface-variant">Following <span className="font-bold text-on-surface">{profile?.following ?? 0}</span></div>
                </li>
              </ul>
            </div>
          </div>

          {/* Posts */}
          <div className="lg:col-span-8 space-y-gutter">
            <div className="flex items-center justify-between border-b border-outline-variant pb-0">
              <div className="flex space-x-lg">
                <button
                  className={`font-label-md text-label-md pb-2 px-1 transition-colors ${activeTab === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-on-surface'}`}
                  onClick={() => setActiveTab('posts')}
                >Recent Posts</button>
                <button
                  className={`font-label-md text-label-md pb-2 px-1 transition-colors ${activeTab === 'media' ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-on-surface'}`}
                  onClick={() => setActiveTab('media')}
                >Media</button>
              </div>
            </div>

            {/* ── RECENT POSTS TAB ── */}
            {activeTab === 'posts' && (
              <>
                {posts.length === 0 && (
                  <div className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px] block mb-md">article</span>
                    <p className="font-label-md text-label-md">No posts yet. Share something on the feed!</p>
                  </div>
                )}
                {posts.map((post) => (
                  <div key={post.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-sm">
                      <div className="flex items-center gap-sm">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed overflow-hidden flex items-center justify-center">
                          {post.avatar
                            ? <img className="w-full h-full object-cover" src={post.avatar} alt={post.author} />
                            : <span className="material-symbols-outlined text-primary">person</span>
                          }
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">{post.author}</p>
                          <p className="text-label-sm text-on-surface-variant">{post.time}{post.tag ? ` • ${post.tag}` : ''}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          className="text-on-surface-variant hover:text-on-surface p-1 rounded-full transition-colors"
                          onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}
                        >
                          <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                        {menuOpen === post.id && (
                          <div className="absolute right-0 top-8 z-20 bg-surface border border-outline-variant rounded-xl shadow-lg py-xs min-w-[120px]">
                            <button
                              onClick={() => deletePost(post.id)}
                              className="w-full flex items-center gap-xs px-md py-sm text-error hover:bg-error-container transition-colors font-label-md text-label-md"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {post.content && (
                      <p className="text-body-md text-on-surface mb-md">{post.content}</p>
                    )}

                    {post.images.length > 0 && (
                      <div className={`${post.images.length === 1 ? '' : 'grid grid-cols-2 gap-xs'} mb-md`}>
                        {post.images.map((src, i) => (
                          <div key={i} className="rounded-lg overflow-hidden border border-outline-variant aspect-video cursor-zoom-in" onClick={() => setPreviewUrl(src)}>
                            <img className="w-full h-full object-cover" src={src} alt={`Image ${i + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-md border-t border-outline-variant pt-sm">
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

                    {/* ── COMMENTS SECTION ── */}
                    {openComments[post.id] && (
                      <div className="pt-sm space-y-sm border-t border-outline-variant mt-sm">
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
                                >Reply</button>
                                {((c.replyCount || 0) > 0 || (commentReplies[c.id]?.length || 0) > 0) && (
                                  <button
                                    className="font-label-sm text-label-sm text-primary hover:underline transition-colors"
                                    onClick={() => loadReplies(post.id, c.id)}
                                  >
                                    {expandedReplies[c.id] ? 'Hide replies' : `View ${c.replyCount || commentReplies[c.id]?.length || ''} replies`}
                                  </button>
                                )}
                              </div>
                              {replyingTo[c.id] && (
                                <div className="flex gap-xs items-center mt-xs">
                                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-surface-container-low flex items-center justify-center">
                                    {avatarUrl
                                      ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
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
                        <div className="flex gap-sm items-center pt-xs">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-surface-container-low flex items-center justify-center">
                            {avatarUrl
                              ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" />
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
                ))}
              </>
            )}

            {/* ── MEDIA TAB ── */}
            {activeTab === 'media' && (
              <>
                {mediaPosts.length === 0 && (
                  <div className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px] block mb-md">photo_library</span>
                    <p className="font-label-md text-label-md">No media yet.</p>
                  </div>
                )}
                {mediaPosts.length > 0 && (
                  <div className="grid grid-cols-3 gap-1">
                    {mediaPosts.flatMap((post) => [
                      ...post.images.map((src, i) => (
                        <div key={`${post.id}-img-${i}`} className="aspect-square overflow-hidden rounded-sm bg-surface-container-low cursor-zoom-in" onClick={() => setPreviewUrl(src)}>
                          <img className="w-full h-full object-cover" src={src} alt="" />
                        </div>
                      )),
                      ...(post.videoUrls[0] ? [
                        <div key={`${post.id}-vid`} className="aspect-square overflow-hidden rounded-sm bg-black relative">
                          <video className="w-full h-full object-cover" src={post.videoUrls[0]} muted />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="material-symbols-outlined text-white text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                          </div>
                        </div>
                      ] : []),
                    ])}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </main>

      {/* ── DESKTOP FOOTER ── */}
      <footer className="w-full py-sm bg-surface-container-lowest border-t border-outline-variant hidden lg:block">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto lg:ml-64">
          <div className="flex items-center space-x-sm">
            <img src="/logo.png" alt="Neutron Tech" className="h-8 w-auto drop-shadow-sm" />
            <span className="font-label-sm text-label-sm text-secondary">© 2026 Neutron Tech Inc.</span>
          </div>
          <div className="flex space-x-md">
            <Link className="font-label-sm text-label-sm text-secondary hover:text-primary" href="/about">About</Link>
            <Link className="font-label-sm text-label-sm text-secondary hover:text-primary" href="/privacy">Privacy</Link>
            <Link className="font-label-sm text-label-sm text-secondary hover:text-primary" href="/terms">Terms</Link>
          </div>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant h-16 lg:hidden">
        <div className="flex justify-around items-center h-full">
          <Link href="/feed" className="flex flex-col items-center text-on-surface-variant transition-all active:scale-95">
            <span className="material-symbols-outlined">home</span>
            <span className="text-label-sm font-label-sm">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center text-on-surface-variant transition-all active:scale-95">
            <span className="material-symbols-outlined">search</span>
            <span className="text-label-sm font-label-sm">Search</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-primary font-bold transition-all active:scale-95">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="text-label-sm font-label-sm">Profile</span>
          </Link>
          <Link href="/contact" className="flex flex-col items-center text-on-surface-variant transition-all active:scale-95">
            <span className="material-symbols-outlined">mail</span>
            <span className="text-label-sm font-label-sm">Contact</span>
          </Link>
          <button onClick={handleLogout} disabled={loggingOut} style={{ touchAction: 'manipulation' }} className="flex flex-col items-center text-on-surface-variant transition-all active:scale-95 disabled:opacity-50">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-label-sm font-label-sm">Logout</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
