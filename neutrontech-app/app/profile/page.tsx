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
};

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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts]     = useState<Post[]>([]);
  const [liked, setLiked]     = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab]   = useState<'posts' | 'media'>('posts');
  const [scrolled, setScrolled]     = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Edit modal
  const [editOpen, setEditOpen]           = useState(false);
  const [editName, setEditName]           = useState('');
  const [editBio, setEditBio]             = useState('');
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [coverFile, setCoverFile]         = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview]   = useState<string | null>(null);
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
      const res = await fetch(`/api/users/${session.user.id}`);
      if (res.ok) {
        const { user, posts: userPosts } = await res.json();
        setProfile(user);
        setPosts(userPosts);
      }
      setAuthLoading(false);
    });
  }, [router]);

  const toggleLike = (id: number) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleLogout = async () => {
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
    setSaveError('');
    setEditOpen(true);
  };

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'avatar') { setAvatarFile(file); setAvatarPreview(url); }
    else                   { setCoverFile(file);  setCoverPreview(url);  }
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveError('');

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? '';
    const authHeader = { 'Authorization': `Bearer ${token}` };

    let newAvatarUrl = profile.avatar_url;
    let newCoverUrl  = profile.cover_url;

    // Upload via server-side route (service role key — no RLS issues)
    if (avatarFile) {
      const form = new FormData();
      form.append('file', avatarFile);
      const up = await fetch('/api/upload', { method: 'POST', headers: authHeader, body: form });
      const { url } = await up.json();
      if (url) newAvatarUrl = url;
    }

    if (coverFile) {
      const form = new FormData();
      form.append('file', coverFile);
      const up = await fetch('/api/upload', { method: 'POST', headers: authHeader, body: form });
      const { url } = await up.json();
      if (url) newCoverUrl = url;
    }

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

  const mediaPosts   = posts.filter((p) => p.images.length > 0 || p.videoUrl);
  const visiblePosts = activeTab === 'posts' ? posts : mediaPosts;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="font-body-md text-body-md overflow-x-hidden">

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
              {(coverPreview || profile?.cover_url) ? (
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
                  {(avatarPreview || avatarUrl) ? (
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
            <button onClick={handleLogout} className="hidden lg:block font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low px-md py-xs rounded-lg transition-all active:scale-95">Logout</button>
          </div>
        </div>
      </header>

      {/* ── LEFT SIDEBAR (lg+) ── */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface border-r border-outline-variant pt-20 p-md space-y-sm">
        <div className="mb-sm">
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
        </nav>
        <div className="pt-md border-t border-outline-variant flex flex-col space-y-xs">
          <button onClick={handleLogout} className="flex items-center space-x-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-xl text-left w-full">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="lg:ml-64 pt-16 min-h-screen pb-24 lg:pb-8">

        {/* ── PROFILE BANNER ── */}
        <div className="relative h-40 md:h-64 lg:h-80 w-full overflow-hidden">
          {profile?.cover_url ? (
            <img className="w-full h-full object-cover" src={profile.cover_url} alt="Cover photo" />
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
                ? <img className="w-full h-full object-cover" src={avatarUrl} alt={displayName} />
                : <span className="material-symbols-outlined text-primary text-[48px]">person</span>
              }
            </div>
            <div className="text-center mt-md">
              <h2 className="font-headline-md text-headline-lg-mobile text-on-surface">{displayName}</h2>
              {username && <p className="font-label-md text-label-md text-on-surface-variant">@{username}</p>}
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
                      ? <img className="w-full h-full object-cover" src={avatarUrl} alt={displayName} />
                      : <span className="material-symbols-outlined text-primary text-[64px]">person</span>
                    }
                  </div>
                </div>
                <div className="mb-2">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">{displayName}</h1>
                  {username && <p className="font-label-md text-label-md text-secondary">@{username}</p>}
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

            {visiblePosts.length === 0 && (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] block mb-md">article</span>
                <p className="font-label-md text-label-md">No posts yet. Share something on the feed!</p>
              </div>
            )}

            {visiblePosts.map((post) => (
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
                  <button className="material-symbols-outlined text-on-surface-variant">more_horiz</button>
                </div>

                {post.content && (
                  <p className="text-body-md text-on-surface mb-md">{post.content}</p>
                )}

                {post.images.length > 0 && (
                  <div className={`${post.images.length === 1 ? '' : 'grid grid-cols-2 gap-xs'} mb-md`}>
                    {post.images.map((src, i) => (
                      <div key={i} className="rounded-lg overflow-hidden border border-outline-variant aspect-video">
                        <img className="w-full h-full object-cover" src={src} alt={`Image ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-md border-t border-outline-variant pt-sm">
                  <button className={`flex items-center gap-xs transition-colors ${liked[post.id] ? 'text-primary' : 'text-on-surface-variant'}`} onClick={() => toggleLike(post.id)}>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: liked[post.id] ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                    <span className="text-label-md">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    <span className="text-label-md">{post.comments}</span>
                  </button>
                  <button className="ml-auto flex items-center gap-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── DESKTOP FOOTER ── */}
      <footer className="w-full py-xl bg-surface-container-lowest border-t border-outline-variant hidden lg:block">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto gap-md lg:ml-64">
          <div className="flex items-center space-x-sm">
            <img src="/logo.png" alt="Neutron Tech" className="h-12 w-auto drop-shadow-sm" />
            <span className="font-label-sm text-label-sm text-secondary">© 2024 Neutron Tech Inc.</span>
          </div>
          <div className="flex space-x-lg">
            <a className="font-label-sm text-label-sm text-secondary hover:text-primary" href="#">About</a>
            <a className="font-label-sm text-label-sm text-secondary hover:text-primary" href="#">Privacy</a>
            <a className="font-label-sm text-label-sm text-secondary hover:text-primary" href="#">Terms</a>
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
          <button onClick={handleLogout} className="flex flex-col items-center text-on-surface-variant transition-all active:scale-95">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-label-sm font-label-sm">Logout</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
